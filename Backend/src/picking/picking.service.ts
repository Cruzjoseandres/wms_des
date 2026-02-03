import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrdenSalida, EstadoSalida } from '../orden_salida/entities/orden_salida.entity';
import { DetalleSalida, EstadoDetalleSalida } from '../detalle_salida/entities/detalle_salida.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';

@Injectable()
export class PickingService {
    constructor(
        @InjectRepository(OrdenSalida)
        private ordenRepo: Repository<OrdenSalida>,
        @InjectRepository(DetalleSalida)
        private detalleRepo: Repository<DetalleSalida>,
        @InjectRepository(StockInventario)
        private stockRepo: Repository<StockInventario>,
    ) { }

    // ============================================
    // CONSULTAS
    // ============================================

    /**
     * Obtener órdenes pendientes de picking
     */
    async obtenerOrdenesPendientes() {
        const ordenes = await this.ordenRepo.find({
            where: { estado: In([EstadoSalida.PENDIENTE, EstadoSalida.EN_PICKING]) },
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { prioridad: 'ASC', fechaSalida: 'ASC' },
        });

        return ordenes.map(orden => ({
            ...orden,
            estadoNombre: this.obtenerNombreEstado(orden.estado),
            detalles: orden.detalles.map(d => ({
                ...d,
                estadoNombre: this.obtenerNombreEstadoDetalle(d.estado),
            })),
            resumen: {
                totalDetalles: orden.detalles.length,
                pendientes: orden.detalles.filter(d => d.estado === EstadoDetalleSalida.PENDIENTE).length,
                pickeados: orden.detalles.filter(d => d.estado === EstadoDetalleSalida.PICKEADO).length,
            },
        }));
    }

    // ============================================
    // FLUJO PICKING
    // ============================================

    /**
     * Iniciar picking de una orden
     */
    async iniciarOrden(ordenId: number, usuario: string) {
        const orden = await this.ordenRepo.findOne({
            where: { id: ordenId },
            relations: ['detalles', 'detalles.item'],
        });

        if (!orden) {
            throw new NotFoundException(`Orden ${ordenId} no encontrada`);
        }

        if (orden.estado !== EstadoSalida.PENDIENTE && orden.estado !== EstadoSalida.EN_PICKING) {
            throw new BadRequestException(`Orden no disponible para picking. Estado: ${this.obtenerNombreEstado(orden.estado)}`);
        }

        orden.estado = EstadoSalida.EN_PICKING;
        orden.usuarioPicking = usuario;
        orden.pickingStartedAt = new Date();
        await this.ordenRepo.save(orden);

        return {
            exito: true,
            mensaje: `Picking iniciado para orden ${orden.nroDocumento}`,
            orden: {
                id: orden.id,
                nroDocumento: orden.nroDocumento,
                estado: this.obtenerNombreEstado(orden.estado),
                detallesPendientes: orden.detalles.filter(d => d.estado === EstadoDetalleSalida.PENDIENTE).length,
            },
        };
    }

    /**
     * Iniciar picking de un detalle específico (captura tiempo)
     */
    async iniciarDetalle(detalleId: number, usuario: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['ordenSalida', 'item'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado !== EstadoDetalleSalida.PENDIENTE) {
            throw new BadRequestException(`Detalle ya fue procesado. Estado: ${this.obtenerNombreEstadoDetalle(detalle.estado)}`);
        }

        detalle.inicioPicking = new Date();
        detalle.usuarioPicking = usuario;
        await this.detalleRepo.save(detalle);

        return {
            exito: true,
            mensaje: `Picking iniciado para item ${detalle.item?.descripcion || detalle.codItem}`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadSolicitada: detalle.cantidadSolicitada,
                ubicacionOrigen: detalle.ubicacionOrigen,
                item: detalle.item,
            },
            inicioPicking: detalle.inicioPicking,
        };
    }

    /**
     * Confirmar picking de un detalle
     */
    async pickearDetalle(detalleId: number, cantidadPickeada: number, usuario: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['ordenSalida', 'ordenSalida.detalles', 'item', 'stockInventario'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado === EstadoDetalleSalida.PICKEADO) {
            throw new BadRequestException('Este detalle ya fue pickeado');
        }

        const ahora = new Date();
        let tiempoPicking: number | null = null;

        if (detalle.inicioPicking) {
            tiempoPicking = Math.floor((ahora.getTime() - detalle.inicioPicking.getTime()) / 1000);
        }

        // Actualizar detalle
        detalle.estado = EstadoDetalleSalida.PICKEADO;
        detalle.cantidadPickeada = cantidadPickeada;
        detalle.finPicking = ahora;
        detalle.usuarioPicking = usuario;
        if (tiempoPicking !== null) {
            detalle.tiempoPicking = tiempoPicking;
        }
        await this.detalleRepo.save(detalle);

        // Reducir stock
        if (detalle.stockInventario && cantidadPickeada > 0) {
            const nuevoStock = Number(detalle.stockInventario.cantidad) - cantidadPickeada;
            detalle.stockInventario.cantidad = Math.max(0, nuevoStock);
            detalle.stockInventario.ultimoMovimiento = ahora;
            await this.stockRepo.save(detalle.stockInventario);
        }

        // Verificar si la orden está completa
        await this.actualizarEstadoOrden(detalle.ordenSalida);

        return {
            exito: true,
            mensaje: `Item pickeado correctamente`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadSolicitada: detalle.cantidadSolicitada,
                cantidadPickeada: detalle.cantidadPickeada,
                estado: this.obtenerNombreEstadoDetalle(detalle.estado),
                tiempoPicking: tiempoPicking,
            },
            orden: {
                id: detalle.ordenSalida.id,
                nroDocumento: detalle.ordenSalida.nroDocumento,
                estado: this.obtenerNombreEstado(detalle.ordenSalida.estado),
            },
        };
    }

    /**
     * Completar picking de una orden
     */
    async completarOrden(ordenId: number, usuario: string) {
        const orden = await this.ordenRepo.findOne({
            where: { id: ordenId },
            relations: ['detalles'],
        });

        if (!orden) {
            throw new NotFoundException(`Orden ${ordenId} no encontrada`);
        }

        const pendientes = orden.detalles.filter(d => d.estado === EstadoDetalleSalida.PENDIENTE);
        if (pendientes.length > 0) {
            throw new BadRequestException(`Aún hay ${pendientes.length} items pendientes de pickear`);
        }

        orden.estado = EstadoSalida.COMPLETADA;
        orden.pickingCompletedAt = new Date();
        await this.ordenRepo.save(orden);

        return {
            exito: true,
            mensaje: `Picking completado para orden ${orden.nroDocumento}`,
            orden: {
                id: orden.id,
                nroDocumento: orden.nroDocumento,
                estado: this.obtenerNombreEstado(orden.estado),
                pickingStartedAt: orden.pickingStartedAt,
                pickingCompletedAt: orden.pickingCompletedAt,
            },
            siguientePaso: 'Despacho',
        };
    }

    // ============================================
    // MÉTRICAS
    // ============================================

    async obtenerMetricas(usuarioId: string) {
        const detalles = await this.detalleRepo.find({
            where: { usuarioPicking: usuarioId },
            select: ['id', 'tiempoPicking'],
        });

        const tiempos = detalles
            .map(d => d.tiempoPicking)
            .filter((t): t is number => t !== null && t !== undefined);

        const stats = this.calcularEstadisticas(tiempos);

        return {
            usuario: usuarioId,
            picking: {
                total: detalles.length,
                conTiempo: tiempos.length,
                tiempoPromedio: stats.promedio,
                tiempoMin: stats.min,
                tiempoMax: stats.max,
            },
        };
    }

    // ============================================
    // HELPERS
    // ============================================

    private async actualizarEstadoOrden(orden: OrdenSalida) {
        const detalles = await this.detalleRepo.find({
            where: { ordenSalida: { id: orden.id } },
        });

        const todosPendientes = detalles.every(d => d.estado === EstadoDetalleSalida.PENDIENTE);
        const todosPickeados = detalles.every(d => d.estado === EstadoDetalleSalida.PICKEADO);

        let nuevoEstado = orden.estado;

        if (todosPendientes) {
            nuevoEstado = EstadoSalida.PENDIENTE;
        } else if (todosPickeados) {
            nuevoEstado = EstadoSalida.COMPLETADA;
            orden.pickingCompletedAt = new Date();
        } else {
            nuevoEstado = EstadoSalida.EN_PICKING;
        }

        if (nuevoEstado !== orden.estado) {
            orden.estado = nuevoEstado;
            await this.ordenRepo.save(orden);
        }
    }

    private calcularEstadisticas(tiempos: number[]): { promedio: number; min: number; max: number } {
        if (tiempos.length === 0) {
            return { promedio: 0, min: 0, max: 0 };
        }
        const suma = tiempos.reduce((a, b) => a + b, 0);
        return {
            promedio: Math.round(suma / tiempos.length),
            min: Math.min(...tiempos),
            max: Math.max(...tiempos),
        };
    }

    private obtenerNombreEstado(estado: number): string {
        const nombres: Record<number, string> = {
            [EstadoSalida.PENDIENTE]: 'PENDIENTE',
            [EstadoSalida.EN_PICKING]: 'EN_PICKING',
            [EstadoSalida.COMPLETADA]: 'COMPLETADA',
            [EstadoSalida.DESPACHADA]: 'DESPACHADA',
            [EstadoSalida.ANULADA]: 'ANULADA',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }

    private obtenerNombreEstadoDetalle(estado: number): string {
        const nombres: Record<number, string> = {
            [EstadoDetalleSalida.PENDIENTE]: 'PENDIENTE',
            [EstadoDetalleSalida.PICKEADO]: 'PICKEADO',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }
}
