import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockInventario } from './entities/stock_inventario.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';

@Injectable()
export class StockInventarioService {
    constructor(
        @InjectRepository(StockInventario)
        private readonly stockRepo: Repository<StockInventario>,
    ) { }

    /**
     * Registra stock cuando un item es almacenado
     * Si ya existe stock en esa ubicación para ese Item, suma la cantidad
     */
    async agregarStock(datos: {
        item: any; // Item entity or { id: number }
        ubicacion: string;
        cantidad: number;
        detalleIngreso?: DetalleIngreso;
    }): Promise<StockInventario> {
        // Buscar si ya existe stock en esa ubicación
        // Usamos where con itemId si está disponible o relation
        const existente = await this.stockRepo.findOne({
            where: {
                item: { id: datos.item.id },
                ubicacion: datos.ubicacion,
            },
        });

        if (existente) {
            existente.cantidad = Number(existente.cantidad) + Number(datos.cantidad);
            existente.ultimoMovimiento = new Date();
            return await this.stockRepo.save(existente);
        }

        const stock = this.stockRepo.create({
            item: datos.item, // Pasamos el objeto Item o {id}
            ubicacion: datos.ubicacion,
            cantidad: datos.cantidad,
            detalleIngreso: datos.detalleIngreso,
            estado: 'DISPONIBLE',
        });
        return await this.stockRepo.save(stock);
    }

    /**
     * Obtiene stock por Item ID
     */
    async obtenerPorItem(itemId: number): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { item: { id: itemId } },
            relations: ['detalleIngreso', 'item'],
            order: { ubicacion: 'ASC' },
        });
    }

    /**
     * Obtiene stock por código de item (para mobile scanner)
     */
    async obtenerPorCodigoItem(codigoItem: string): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { item: { codigo: codigoItem } },
            relations: ['detalleIngreso', 'item'],
            order: { cantidad: 'DESC' }, // Primero la ubicación con más stock
        });
    }

    /**
     * Obtiene stock por ubicación
     */
    async obtenerPorUbicacion(ubicacion: string): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { ubicacion },
            relations: ['detalleIngreso', 'item'],
            order: { item: { codigo: 'ASC' } }, // Ordenar por código de item
        });
    }

    /**
     * Obtiene todo el stock (con datos del detalle para lote/vencimiento)
     */
    async obtenerTodos(): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            relations: ['detalleIngreso'],
        });
    }

    /**
     * Obtiene stock disponible (no bloqueado)
     */
    async obtenerDisponible(): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { estado: 'DISPONIBLE' },
            relations: ['detalleIngreso'],
            order: { ubicacion: 'ASC', item: { codigo: 'ASC' } },
        });
    }

    /**
     * Bloquea stock
     */
    async bloquearStock(id: number): Promise<StockInventario> {
        const stock = await this.stockRepo.findOneBy({ id });
        if (stock) {
            stock.estado = 'BLOQUEADO';
            return await this.stockRepo.save(stock);
        }
        throw new Error(`Stock con ID ${id} no encontrado`);
    }

    /**
     * Desbloquea stock
     */
    async desbloquearStock(id: number): Promise<StockInventario> {
        const stock = await this.stockRepo.findOneBy({ id });
        if (stock) {
            stock.estado = 'DISPONIBLE';
            return await this.stockRepo.save(stock);
        }
        throw new Error(`Stock con ID ${id} no encontrado`);
    }

    /**
     * Reduce stock (para salidas/despachos)
     */
    async reducirStock(id: number, cantidad: number): Promise<StockInventario> {
        const stock = await this.stockRepo.findOneBy({ id });
        if (!stock) {
            throw new Error(`Stock con ID ${id} no encontrado`);
        }

        const cantidadActual = Number(stock.cantidad);
        if (cantidadActual < cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${cantidadActual}, Solicitado: ${cantidad}`);
        }

        stock.cantidad = cantidadActual - cantidad;
        stock.ultimoMovimiento = new Date();
        return await this.stockRepo.save(stock);
    }
}

