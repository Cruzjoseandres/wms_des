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

    /**
     * Confirma un ingreso con las cantidades reales recibidas
     * Actualiza cantidades, cambia estado a ALMACENADO y registra stock
     */
    async confirmarIngreso(
        notaIngresoId: number,
        detalles: { detalleId: number; cantidadRecibida: number; ubicacion?: string }[],
        observacion: string | null,
        usuarioId: string
    ) {
        // 1. Obtener la nota de ingreso
        const nota = await this.notaRepo.findOne({
            where: { id: notaIngresoId },
            relations: ['detalles', 'detalles.item'],
        });

        if (!nota) {
            throw new NotFoundException(`Nota de ingreso ${notaIngresoId} no encontrada`);
        }

        // 2. Validar que esté en estado correcto (PALETIZADO o VALIDADO)
        if (nota.estado !== EstadoIngreso.PALETIZADO && nota.estado !== EstadoIngreso.VALIDADO) {
            throw new BadRequestException(
                `La orden ya fue procesada. Estado: ${this.obtenerNombreEstado(nota.estado)}`
            );
        }

        const estadoAnterior = nota.estado;

        // 3. Actualizar cada detalle con la cantidad recibida
        for (const { detalleId, cantidadRecibida, ubicacion } of detalles) {
            const detalle = nota.detalles.find(d => d.id === detalleId);
            if (detalle) {
                detalle.cantidad = cantidadRecibida;
                if (ubicacion) {
                    detalle.ubicacionFinal = ubicacion;
                }
                await this.detalleRepo.save(detalle);

                // 4. Registrar en stock_inventario
                if (cantidadRecibida > 0 && detalle.item) {
                    await this.stockInventarioService.agregarStock({
                        item: detalle.item,
                        ubicacion: ubicacion || 'SIN-UBICACION',
                        cantidad: cantidadRecibida,
                        detalleIngreso: detalle,
                    });
                }
            }
        }

        // 5. Actualizar nota de ingreso
        nota.estado = EstadoIngreso.ALMACENADO;
        nota.usuarioAlmacenaje = usuarioId;
        nota.storedAt = new Date();
        if (observacion) {
            nota.observacion = observacion;
        }
        await this.notaRepo.save(nota);

        // 6. Registrar historial
        await this.historialEstadoService.registrarCambio({
            notaIngresoId: nota.id,
            estadoAnterior,
            estadoNuevo: EstadoIngreso.ALMACENADO,
            usuario: usuarioId,
            motivo: observacion || 'Confirmación de ingreso desde móvil',
        });

        return {
            exito: true,
            mensaje: `Ingreso ${nota.nroDocumento} confirmado. Stock actualizado.`,
            orden: {
                id: nota.id,
                nroDocumento: nota.nroDocumento,
                estado: 'ALMACENADO',
            },
        };
    }
}
