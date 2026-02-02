import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotaIngreso, EstadoIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';
import { DetalleIngreso, EstadoDetalle } from '../../detalle_ingreso/entities/detalle_ingreso.entity';
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
     * Obtiene órdenes que tienen al menos un detalle pendiente de validar
     */
    async obtenerPorValidar() {
        // Buscar órdenes que tengan detalles PENDIENTES
        const ordenes = await this.notaRepo.find({
            where: [
                { estado: EstadoIngreso.PALETIZADO },
                { estado: EstadoIngreso.PARCIAL },
            ],
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { createdAt: 'DESC' },
        });

        // Filtrar para mostrar solo órdenes con al menos un detalle PENDIENTE
        // y agregar estado de cada detalle en la respuesta
        return ordenes.filter(orden => {
            const tieneDetallesPendientes = orden.detalles.some(
                d => d.estado === EstadoDetalle.PENDIENTE
            );
            return tieneDetallesPendientes;
        }).map(orden => ({
            ...orden,
            detalles: orden.detalles.map(d => ({
                ...d,
                estadoNombre: this.obtenerNombreEstadoDetalle(d.estado),
            })),
            resumen: {
                totalDetalles: orden.detalles.length,
                pendientes: orden.detalles.filter(d => d.estado === EstadoDetalle.PENDIENTE).length,
                validados: orden.detalles.filter(d => d.estado === EstadoDetalle.VALIDADO).length,
                almacenados: orden.detalles.filter(d => d.estado === EstadoDetalle.ALMACENADO).length,
            },
        }));
    }

    /**
     * Obtiene órdenes que tienen al menos un detalle validado (listo para almacenar)
     */
    async obtenerPorAlmacenar() {
        // Buscar órdenes que tengan detalles VALIDADOS
        const ordenes = await this.notaRepo.find({
            where: [
                { estado: EstadoIngreso.VALIDADO },
                { estado: EstadoIngreso.PARCIAL },
            ],
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { validatedAt: 'DESC' },
        });

        // Filtrar para mostrar solo órdenes con al menos un detalle VALIDADO
        return ordenes.filter(orden => {
            const tieneDetallesValidados = orden.detalles.some(
                d => d.estado === EstadoDetalle.VALIDADO
            );
            return tieneDetallesValidados;
        }).map(orden => ({
            ...orden,
            // Solo mostrar detalles que están listos para almacenar (VALIDADOS)
            detalles: orden.detalles
                .filter(d => d.estado === EstadoDetalle.VALIDADO)
                .map(d => ({
                    ...d,
                    estadoNombre: this.obtenerNombreEstadoDetalle(d.estado),
                })),
            resumen: {
                totalDetalles: orden.detalles.length,
                pendientes: orden.detalles.filter(d => d.estado === EstadoDetalle.PENDIENTE).length,
                validados: orden.detalles.filter(d => d.estado === EstadoDetalle.VALIDADO).length,
                almacenados: orden.detalles.filter(d => d.estado === EstadoDetalle.ALMACENADO).length,
            },
        }));
    }

    private obtenerNombreEstado(estado: number): string {
        const nombres = {
            [EstadoIngreso.PALETIZADO]: 'PALETIZADO',
            [EstadoIngreso.VALIDADO]: 'VALIDADO',
            [EstadoIngreso.ALMACENADO]: 'ALMACENADO',
            [EstadoIngreso.ANULADO]: 'ANULADO',
            [EstadoIngreso.PARCIAL]: 'PARCIAL',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }

    private obtenerNombreEstadoDetalle(estado: number): string {
        const nombres = {
            [EstadoDetalle.PENDIENTE]: 'PENDIENTE',
            [EstadoDetalle.VALIDADO]: 'VALIDADO',
            [EstadoDetalle.ALMACENADO]: 'ALMACENADO',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }

    // ============================================
    // VALIDACIÓN INDIVIDUAL POR DETALLE
    // ============================================

    /**
     * Marca el inicio de validación de un detalle (captura timestamp inicial)
     */
    async iniciarValidacion(detalleId: number, usuarioId: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['notaIngreso', 'item'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado !== EstadoDetalle.PENDIENTE) {
            throw new BadRequestException(
                `El detalle ya fue procesado. Estado actual: ${this.obtenerNombreEstadoDetalle(detalle.estado)}`,
            );
        }

        detalle.inicioValidacion = new Date();
        await this.detalleRepo.save(detalle);

        return {
            exito: true,
            mensaje: `Validación iniciada para el item ${detalle.item?.descripcion || detalle.codItem}`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadEsperada: detalle.cantidadEsperada || detalle.cantidad,
                item: detalle.item ? {
                    codigo: detalle.item.codigo,
                    descripcion: detalle.item.descripcion,
                } : null,
            },
            inicioValidacion: detalle.inicioValidacion,
        };
    }

    /**
     * Valida un detalle específico con la cantidad recibida
     */
    async validarDetalle(detalleId: number, cantidadRecibida: number, usuarioId: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['notaIngreso', 'notaIngreso.detalles', 'item'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado !== EstadoDetalle.PENDIENTE) {
            throw new BadRequestException(
                `El detalle ya fue procesado. Estado actual: ${this.obtenerNombreEstadoDetalle(detalle.estado)}`,
            );
        }

        const ahora = new Date();

        // Calcular tiempo de validación si se inició previamente
        let tiempoValidacion: number | null = null;
        if (detalle.inicioValidacion) {
            tiempoValidacion = Math.round((ahora.getTime() - detalle.inicioValidacion.getTime()) / 1000);
        }

        // Actualizar detalle
        detalle.estado = EstadoDetalle.VALIDADO;
        detalle.cantidadRecibida = cantidadRecibida;
        detalle.usuarioValidacion = usuarioId;
        detalle.validatedAt = ahora;
        if (tiempoValidacion !== null) {
            detalle.tiempoValidacion = tiempoValidacion;
        }
        await this.detalleRepo.save(detalle);

        // Actualizar estado de la orden padre
        await this.actualizarEstadoOrden(detalle.notaIngreso);

        return {
            exito: true,
            mensaje: `Detalle validado correctamente`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadEsperada: detalle.cantidadEsperada || detalle.cantidad,
                cantidadRecibida: cantidadRecibida,
                estado: 'VALIDADO',
                tiempoValidacion: tiempoValidacion,
            },
            orden: {
                id: detalle.notaIngreso.id,
                nroDocumento: detalle.notaIngreso.nroDocumento,
                estado: this.obtenerNombreEstado(detalle.notaIngreso.estado),
            },
            siguientePaso: 'Almacenaje',
        };
    }

    /**
     * Marca el inicio de almacenaje de un detalle
     */
    async iniciarAlmacenaje(detalleId: number, usuarioId: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['notaIngreso', 'item'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado !== EstadoDetalle.VALIDADO) {
            if (detalle.estado === EstadoDetalle.PENDIENTE) {
                throw new BadRequestException(`El detalle aún no ha sido validado`);
            }
            throw new BadRequestException(
                `El detalle ya fue almacenado. Estado actual: ${this.obtenerNombreEstadoDetalle(detalle.estado)}`,
            );
        }

        detalle.inicioAlmacenaje = new Date();
        await this.detalleRepo.save(detalle);

        return {
            exito: true,
            mensaje: `Almacenaje iniciado para el item ${detalle.item?.descripcion || detalle.codItem}`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadRecibida: detalle.cantidadRecibida,
                ubicacionSugerida: detalle.ubicacionSugerida,
                item: detalle.item ? {
                    codigo: detalle.item.codigo,
                    descripcion: detalle.item.descripcion,
                } : null,
            },
            inicioAlmacenaje: detalle.inicioAlmacenaje,
        };
    }

    /**
     * Almacena un detalle específico en una ubicación
     */
    async almacenarDetalle(detalleId: number, ubicacion: string, usuarioId: string) {
        const detalle = await this.detalleRepo.findOne({
            where: { id: detalleId },
            relations: ['notaIngreso', 'notaIngreso.detalles', 'item'],
        });

        if (!detalle) {
            throw new NotFoundException(`Detalle ${detalleId} no encontrado`);
        }

        if (detalle.estado !== EstadoDetalle.VALIDADO) {
            if (detalle.estado === EstadoDetalle.PENDIENTE) {
                throw new BadRequestException(`El detalle aún no ha sido validado`);
            }
            throw new BadRequestException(
                `El detalle ya fue almacenado. Estado actual: ${this.obtenerNombreEstadoDetalle(detalle.estado)}`,
            );
        }

        const ahora = new Date();

        // Calcular tiempo de almacenaje si se inició previamente
        let tiempoAlmacenaje: number | null = null;
        if (detalle.inicioAlmacenaje) {
            tiempoAlmacenaje = Math.round((ahora.getTime() - detalle.inicioAlmacenaje.getTime()) / 1000);
        }

        // Actualizar detalle
        detalle.estado = EstadoDetalle.ALMACENADO;
        detalle.ubicacionFinal = ubicacion;
        detalle.usuarioAlmacenaje = usuarioId;
        detalle.storedAt = ahora;
        if (tiempoAlmacenaje !== null) {
            detalle.tiempoAlmacenaje = tiempoAlmacenaje;
        }
        await this.detalleRepo.save(detalle);

        // Registrar en stock_inventario
        const cantidadStock = Number(detalle.cantidadRecibida || detalle.cantidad);
        if (cantidadStock > 0 && detalle.item) {
            await this.stockInventarioService.agregarStock({
                item: detalle.item,
                ubicacion: ubicacion,
                cantidad: cantidadStock,
                detalleIngreso: detalle,
            });
        }

        // Actualizar estado de la orden padre
        await this.actualizarEstadoOrden(detalle.notaIngreso);

        return {
            exito: true,
            mensaje: `Detalle almacenado correctamente en ${ubicacion}`,
            detalle: {
                id: detalle.id,
                codItem: detalle.codItem,
                cantidadRecibida: detalle.cantidadRecibida,
                ubicacionFinal: ubicacion,
                estado: 'ALMACENADO',
                tiempoAlmacenaje: tiempoAlmacenaje,
            },
            orden: {
                id: detalle.notaIngreso.id,
                nroDocumento: detalle.notaIngreso.nroDocumento,
                estado: this.obtenerNombreEstado(detalle.notaIngreso.estado),
            },
            stock: {
                item: detalle.item?.codigo || detalle.codItem,
                ubicacion: ubicacion,
                cantidad: cantidadStock,
            },
        };
    }

    /**
     * Actualiza el estado de la orden padre basándose en el estado de sus detalles
     */
    private async actualizarEstadoOrden(orden: NotaIngreso) {
        // Recargar los detalles para obtener estados actualizados
        const ordenActualizada = await this.notaRepo.findOne({
            where: { id: orden.id },
            relations: ['detalles'],
        });

        if (!ordenActualizada) return;

        const detalles = ordenActualizada.detalles;
        const todosPendientes = detalles.every(d => d.estado === EstadoDetalle.PENDIENTE);
        const todosValidados = detalles.every(d => d.estado === EstadoDetalle.VALIDADO);
        const todosAlmacenados = detalles.every(d => d.estado === EstadoDetalle.ALMACENADO);

        const estadoAnterior = ordenActualizada.estado;
        let nuevoEstado: number;

        if (todosPendientes) {
            nuevoEstado = EstadoIngreso.PALETIZADO;
        } else if (todosAlmacenados) {
            nuevoEstado = EstadoIngreso.ALMACENADO;
            ordenActualizada.storedAt = new Date();
        } else if (todosValidados) {
            nuevoEstado = EstadoIngreso.VALIDADO;
            ordenActualizada.validatedAt = new Date();
        } else {
            nuevoEstado = EstadoIngreso.PARCIAL;
        }

        if (estadoAnterior !== nuevoEstado) {
            ordenActualizada.estado = nuevoEstado;
            await this.notaRepo.save(ordenActualizada);

            // Registrar en historial
            await this.historialEstadoService.registrarCambio({
                notaIngresoId: ordenActualizada.id,
                estadoAnterior,
                estadoNuevo: nuevoEstado,
                usuario: 'SISTEMA',
                motivo: `Cambio automático por estado de detalles`,
            });
        }

        // Actualizar el objeto original para que el caller tenga el estado actualizado
        orden.estado = nuevoEstado;
    }

    /**
     * Obtiene métricas de productividad de un operario
     */
    async obtenerMetricasOperario(usuarioId: string) {
        // Obtener detalles validados por el usuario
        const validaciones = await this.detalleRepo.find({
            where: { usuarioValidacion: usuarioId },
            select: ['id', 'tiempoValidacion'],
        });

        // Obtener detalles almacenados por el usuario
        const almacenajes = await this.detalleRepo.find({
            where: { usuarioAlmacenaje: usuarioId },
            select: ['id', 'tiempoAlmacenaje'],
        });

        // Calcular estadísticas de validación
        const tiemposValidacion = validaciones
            .map(v => v.tiempoValidacion)
            .filter((t): t is number => t !== null && t !== undefined);

        const statsValidacion = this.calcularEstadisticas(tiemposValidacion);

        // Calcular estadísticas de almacenaje
        const tiemposAlmacenaje = almacenajes
            .map(a => a.tiempoAlmacenaje)
            .filter((t): t is number => t !== null && t !== undefined);

        const statsAlmacenaje = this.calcularEstadisticas(tiemposAlmacenaje);

        return {
            usuario: usuarioId,
            validaciones: {
                total: validaciones.length,
                conTiempo: tiemposValidacion.length,
                tiempoPromedio: statsValidacion.promedio,
                tiempoMin: statsValidacion.min,
                tiempoMax: statsValidacion.max,
            },
            almacenajes: {
                total: almacenajes.length,
                conTiempo: tiemposAlmacenaje.length,
                tiempoPromedio: statsAlmacenaje.promedio,
                tiempoMin: statsAlmacenaje.min,
                tiempoMax: statsAlmacenaje.max,
            },
        };
    }

    private calcularEstadisticas(tiempos: number[]): { promedio: number | null; min: number | null; max: number | null } {
        if (tiempos.length === 0) {
            return { promedio: null, min: null, max: null };
        }

        const suma = tiempos.reduce((acc, t) => acc + t, 0);
        return {
            promedio: Math.round(suma / tiempos.length),
            min: Math.min(...tiempos),
            max: Math.max(...tiempos),
        };
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
