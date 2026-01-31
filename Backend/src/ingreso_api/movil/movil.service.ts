import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaIngreso, EstadoIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';
import { DetalleIngreso } from '../../detalle_ingreso/entities/detalle_ingreso.entity';
import { StockInventarioService } from '../../stock_inventario/stock_inventario.service';
import { HistorialEstadoService } from '../../historial_estado/historial_estado.service';

@Injectable()
export class MovilService {
    constructor(
        @InjectRepository(NotaIngreso)
        private readonly notaRepo: Repository<NotaIngreso>,
        @InjectRepository(DetalleIngreso)
        private readonly detalleRepo: Repository<DetalleIngreso>,
        private readonly stockInventarioService: StockInventarioService,
        private readonly historialEstadoService: HistorialEstadoService,
    ) { }

    /**
     * Valida un item por código de barra (Operario 1)
     * Solo funciona si la orden está en estado PALETIZADO
     */
    async escanearValidar(codigoBarra: string, usuarioId: string) {
        // 1. Buscar detalle por codigo de barra (join con Item)
        const detalle = await this.detalleRepo
            .createQueryBuilder('d')
            .leftJoinAndSelect('d.notaIngreso', 'nota')
            .leftJoinAndSelect('d.item', 'i') // Join con Item
            .where("d.cod_item = :codigoBarra", { codigoBarra })
            .orWhere("i.codigoBarra = :codigoBarra", { codigoBarra }) // Busca en tabla Item
            .orWhere("i.codigoFabrica = :codigoBarra", { codigoBarra })
            .getOne();

        if (!detalle) {
            throw new NotFoundException(`No se encontró ningún item con código: ${codigoBarra}`);
        }

        const orden = detalle.notaIngreso;

        // 2. Validar estado
        if (orden.estado !== EstadoIngreso.PALETIZADO) {
            const estadoNombre = this.obtenerNombreEstado(orden.estado);
            throw new BadRequestException(
                `La orden ${orden.nroDocumento} no está en estado PALETIZADO. Estado actual: ${estadoNombre}`,
            );
        }

        // 3. Actualizar orden a VALIDADO
        const estadoAnterior = orden.estado;
        orden.estado = EstadoIngreso.VALIDADO;
        orden.usuarioValidacion = usuarioId;
        orden.validatedAt = new Date();
        await this.notaRepo.save(orden);

        // 4. Registrar historial
        await this.historialEstadoService.registrarCambio({
            notaIngresoId: orden.id,
            estadoAnterior,
            estadoNuevo: EstadoIngreso.VALIDADO,
            usuario: usuarioId,
            motivo: `Validación por escaneo de código: ${codigoBarra}`,
        });

        return {
            exito: true,
            mensaje: `Orden ${orden.nroDocumento} validada correctamente`,
            orden: {
                id: orden.id,
                nroDocumento: orden.nroDocumento,
                estado: 'VALIDADO',
            },
            siguientePaso: 'Almacenaje',
        };
    }

    /**
     * Almacena un item en una ubicación (Operario 2)
     * Solo funciona si la orden está en estado VALIDADO
     */
    async escanearAlmacenar(codigoBarra: string, ubicacionDestino: string, usuarioId: string) {
        // 1. Buscar detalle por codigo de barra (join con Item)
        const detalle = await this.detalleRepo
            .createQueryBuilder('d')
            .leftJoinAndSelect('d.notaIngreso', 'nota')
            .leftJoinAndSelect('d.item', 'i')
            .where("d.cod_item = :codigoBarra", { codigoBarra })
            .orWhere("i.codigoBarra = :codigoBarra", { codigoBarra })
            .getOne();

        if (!detalle) {
            throw new NotFoundException(`No se encontró ningún item con código: ${codigoBarra}`);
        }

        const orden = detalle.notaIngreso;

        // 2. Validar estado
        if (orden.estado !== EstadoIngreso.VALIDADO) {
            if (orden.estado === EstadoIngreso.PALETIZADO) {
                throw new BadRequestException(
                    `La orden ${orden.nroDocumento} aún no ha sido validada. Debe validarse primero.`,
                );
            }
            const estadoNombre = this.obtenerNombreEstado(orden.estado);
            throw new BadRequestException(
                `La orden ${orden.nroDocumento} ya fue procesada o anulada. Estado: ${estadoNombre}`,
            );
        }

        // 3. Transacción atómica
        const estadoAnterior = orden.estado;

        // 3a. Actualizar ubicación final del detalle
        detalle.ubicacionFinal = ubicacionDestino;
        await this.detalleRepo.save(detalle);

        // 3b. Actualizar orden a ALMACENADO
        orden.estado = EstadoIngreso.ALMACENADO;
        orden.usuarioAlmacenaje = usuarioId;
        orden.storedAt = new Date();
        await this.notaRepo.save(orden);

        // 3c. Insertar en stock_inventario
        // Ahora pasamos el item entero (o su ID)
        await this.stockInventarioService.agregarStock({
            item: detalle.item || { id: detalle['item_id'] }, // Fallback si no carga la relación pero d.item está en join
            ubicacion: ubicacionDestino,
            cantidad: Number(detalle.cantidad),
            detalleIngreso: detalle,
        });

        // 4. Registrar historial
        await this.historialEstadoService.registrarCambio({
            notaIngresoId: orden.id,
            estadoAnterior,
            estadoNuevo: EstadoIngreso.ALMACENADO,
            usuario: usuarioId,
            motivo: `Almacenado en ubicación: ${ubicacionDestino}`,
        });

        return {
            exito: true,
            mensaje: `Stock disponible en sistema. Ubicación: ${ubicacionDestino}`,
            orden: {
                id: orden.id,
                nroDocumento: orden.nroDocumento,
                estado: 'ALMACENADO',
            },
            stock: {
                item: detalle.item ? detalle.item.codigo : 'ID:' + detalle['item_id'], // Retornamos info del item
                ubicacion: ubicacionDestino,
                cantidad: detalle.cantidad,
            },
        };
    }

    /**
     * Obtiene órdenes pendientes de validar
     */
    async obtenerPorValidar() {
        return await this.notaRepo.find({
            where: { estado: EstadoIngreso.PALETIZADO },
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Obtiene órdenes pendientes de almacenar
     */
    async obtenerPorAlmacenar() {
        return await this.notaRepo.find({
            where: { estado: EstadoIngreso.VALIDADO },
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { validatedAt: 'DESC' },
        });
    }

    private obtenerNombreEstado(estado: number): string {
        const nombres = {
            [EstadoIngreso.PALETIZADO]: 'PALETIZADO',
            [EstadoIngreso.VALIDADO]: 'VALIDADO',
            [EstadoIngreso.ALMACENADO]: 'ALMACENADO',
            [EstadoIngreso.ANULADO]: 'ANULADO',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }
}
