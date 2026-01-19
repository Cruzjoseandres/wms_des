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
     * Si ya existe stock en esa ubicación para ese SKU, suma la cantidad
     */
    async agregarStock(datos: {
        sku: string;
        ubicacion: string;
        cantidad: number;
        detalleIngreso?: DetalleIngreso;
    }): Promise<StockInventario> {
        // Buscar si ya existe stock en esa ubicación
        const existente = await this.stockRepo.findOne({
            where: {
                sku: datos.sku,
                ubicacion: datos.ubicacion,
            },
        });

        if (existente) {
            existente.cantidad = Number(existente.cantidad) + Number(datos.cantidad);
            existente.ultimoMovimiento = new Date();
            return await this.stockRepo.save(existente);
        }

        const stock = this.stockRepo.create({
            sku: datos.sku,
            ubicacion: datos.ubicacion,
            cantidad: datos.cantidad,
            detalleIngreso: datos.detalleIngreso,
            estado: 'DISPONIBLE',
        });
        return await this.stockRepo.save(stock);
    }

    /**
     * Obtiene stock por SKU (con datos del detalle)
     */
    async obtenerPorSku(sku: string): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { sku },
            relations: ['detalle_ingreso'],
            order: { ubicacion: 'ASC' },
        });
    }

    /**
     * Obtiene stock por ubicación (con datos del detalle)
     */
    async obtenerPorUbicacion(ubicacion: string): Promise<StockInventario[]> {
        return await this.stockRepo.find({
            where: { ubicacion },
            relations: ['detalleIngreso'],
            order: { sku: 'ASC' },
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
            order: { ubicacion: 'ASC', sku: 'ASC' },
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

