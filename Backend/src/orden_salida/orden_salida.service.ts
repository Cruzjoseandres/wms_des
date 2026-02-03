import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenSalida, EstadoSalida, TipoFuenteSalida } from './entities/orden_salida.entity';
import { DetalleSalida, EstadoDetalleSalida } from '../detalle_salida/entities/detalle_salida.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';
import { Item } from '../item/entities/item.entity';
import { Almacen } from '../almacen/entities/almacen.entity';

@Injectable()
export class OrdenSalidaService {
    constructor(
        @InjectRepository(OrdenSalida)
        private ordenRepo: Repository<OrdenSalida>,
        @InjectRepository(DetalleSalida)
        private detalleRepo: Repository<DetalleSalida>,
        @InjectRepository(StockInventario)
        private stockRepo: Repository<StockInventario>,
        @InjectRepository(Item)
        private itemRepo: Repository<Item>,
        @InjectRepository(Almacen)
        private almacenRepo: Repository<Almacen>,
    ) { }

    // ============================================
    // CRUD ÓRDENES
    // ============================================

    async listarOrdenes(estado?: number) {
        const where: any = {};
        if (estado !== undefined) {
            where.estado = estado;
        }
        return this.ordenRepo.find({
            where,
            relations: ['almacen', 'detalles', 'detalles.item'],
            order: { prioridad: 'ASC', fechaSalida: 'ASC' },
        });
    }

    async obtenerOrden(id: number) {
        const orden = await this.ordenRepo.findOne({
            where: { id },
            relations: ['almacen', 'detalles', 'detalles.item', 'detalles.stockInventario'],
        });
        if (!orden) {
            throw new NotFoundException(`Orden ${id} no encontrada`);
        }
        return orden;
    }

    async crearOrden(data: {
        nroDocumento: string;
        cliente: string;
        destino?: string;
        prioridad?: number;
        almacenCodigo?: string;
        observacion?: string;
        usuarioCreacion?: string;
        detalles: { codItem: string; cantidad: number }[];
    }) {
        // Verificar documento único
        const existe = await this.ordenRepo.findOneBy({ nroDocumento: data.nroDocumento });
        if (existe) {
            throw new BadRequestException(`Ya existe orden con documento ${data.nroDocumento}`);
        }

        // Buscar almacén
        let almacen: Almacen | undefined = undefined;
        if (data.almacenCodigo) {
            const found = await this.almacenRepo.findOneBy({ codigo: data.almacenCodigo });
            if (found) almacen = found;
        }

        // Crear orden
        const orden = new OrdenSalida();
        orden.nroDocumento = data.nroDocumento;
        orden.cliente = data.cliente;
        orden.destino = data.destino || '';
        orden.prioridad = data.prioridad || 2;
        orden.tipoFuente = TipoFuenteSalida.MANUAL;
        orden.observacion = data.observacion || '';
        orden.usuarioCreacion = data.usuarioCreacion || 'SISTEMA';
        orden.estado = EstadoSalida.PENDIENTE;
        if (almacen) orden.almacen = almacen;

        const ordenGuardada = await this.ordenRepo.save(orden);

        // Crear detalles con ubicaciones sugeridas (FEFO/FIFO)
        for (const det of data.detalles) {
            const ubicacionSugerida = await this.sugerirUbicacion(det.codItem, det.cantidad);
            const item = await this.itemRepo.findOneBy({ codigo: det.codItem });

            const detalle = new DetalleSalida();
            detalle.codItem = det.codItem;
            detalle.cantidadSolicitada = det.cantidad;
            detalle.cantidadPickeada = 0;
            detalle.ubicacionOrigen = ubicacionSugerida?.ubicacion || '';
            detalle.estado = EstadoDetalleSalida.PENDIENTE;
            detalle.ordenSalida = ordenGuardada;
            if (item) detalle.item = item;
            if (ubicacionSugerida) detalle.stockInventario = ubicacionSugerida;

            await this.detalleRepo.save(detalle);
        }

        return this.obtenerOrden(ordenGuardada.id);
    }

    // ============================================
    // IMPORTAR DESDE ERP (Simular sistema externo)
    // ============================================

    async importarDesdeERP(data: {
        nroDocumento: string;
        cliente: string;
        destino?: string;
        prioridad?: number;
        almacenCodigo?: string;
        items: { codigo: string; cantidad: number }[];
    }) {
        // Similar a crearOrden pero marca como API_ERP
        const existe = await this.ordenRepo.findOneBy({ nroDocumento: data.nroDocumento });
        if (existe) {
            return { exito: false, mensaje: `Orden ${data.nroDocumento} ya existe`, orden: existe };
        }

        let almacen: Almacen | undefined = undefined;
        if (data.almacenCodigo) {
            const found = await this.almacenRepo.findOneBy({ codigo: data.almacenCodigo });
            if (found) almacen = found;
        }

        const orden = new OrdenSalida();
        orden.nroDocumento = data.nroDocumento;
        orden.cliente = data.cliente;
        orden.destino = data.destino || '';
        orden.prioridad = data.prioridad || 2;
        orden.tipoFuente = TipoFuenteSalida.API_ERP;
        orden.usuarioCreacion = 'API_ERP';
        orden.estado = EstadoSalida.PENDIENTE;
        if (almacen) orden.almacen = almacen;

        const ordenGuardada = await this.ordenRepo.save(orden);

        for (const itemData of data.items) {
            const ubicacionSugerida = await this.sugerirUbicacion(itemData.codigo, itemData.cantidad);
            const item = await this.itemRepo.findOneBy({ codigo: itemData.codigo });

            const detalle = new DetalleSalida();
            detalle.codItem = itemData.codigo;
            detalle.cantidadSolicitada = itemData.cantidad;
            detalle.cantidadPickeada = 0;
            detalle.ubicacionOrigen = ubicacionSugerida?.ubicacion || '';
            detalle.estado = EstadoDetalleSalida.PENDIENTE;
            detalle.ordenSalida = ordenGuardada;
            if (item) detalle.item = item;
            if (ubicacionSugerida) detalle.stockInventario = ubicacionSugerida;

            await this.detalleRepo.save(detalle);
        }

        return {
            exito: true,
            mensaje: `Orden ${data.nroDocumento} importada correctamente`,
            orden: await this.obtenerOrden(ordenGuardada.id),
        };
    }

    // ============================================
    // SUGERENCIA DE UBICACIÓN (FEFO/FIFO)
    // ============================================

    private async sugerirUbicacion(codItem: string, cantidad: number): Promise<StockInventario | null> {
        // Buscar item primero
        const item = await this.itemRepo.findOneBy({ codigo: codItem });
        if (!item) return null;

        // Buscar stock disponible, ordenado por:
        // 1. Items con fecha de vencimiento más próxima (FEFO)
        // 2. Si no tiene vencimiento, por fecha de movimiento más antigua (FIFO)
        const stocks = await this.stockRepo
            .createQueryBuilder('stock')
            .leftJoinAndSelect('stock.item', 'item')
            .leftJoinAndSelect('stock.detalleIngreso', 'detalle')
            .where('stock.item.id = :itemId', { itemId: item.id })
            .andWhere('stock.cantidad >= :cantidad', { cantidad })
            .andWhere('stock.estado = :estado', { estado: 'DISPONIBLE' })
            .orderBy('detalle.fechaVencimiento', 'ASC', 'NULLS LAST')
            .addOrderBy('stock.ultimoMovimiento', 'ASC')
            .getMany();

        return stocks.length > 0 ? stocks[0] : null;
    }

    // ============================================
    // HELPERS
    // ============================================

    obtenerNombreEstado(estado: number): string {
        const nombres: Record<number, string> = {
            [EstadoSalida.PENDIENTE]: 'PENDIENTE',
            [EstadoSalida.EN_PICKING]: 'EN_PICKING',
            [EstadoSalida.COMPLETADA]: 'COMPLETADA',
            [EstadoSalida.DESPACHADA]: 'DESPACHADA',
            [EstadoSalida.ANULADA]: 'ANULADA',
        };
        return nombres[estado] || 'DESCONOCIDO';
    }
}
