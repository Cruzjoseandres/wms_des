import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemDocumentoOrigen } from './entities/item_documento_origen.entity';
import { DocumentoOrigen } from '../documento_origen/entities/documento_origen.entity';

@Injectable()
export class ItemDocumentoOrigenService {
    constructor(
        @InjectRepository(ItemDocumentoOrigen)
        private readonly itemRepo: Repository<ItemDocumentoOrigen>,
    ) { }

    /**
     * Busca un ítem por código de barra
     */
    async buscarPorCodigoBarra(codigoBarra: string): Promise<ItemDocumentoOrigen | null> {
        return await this.itemRepo.findOne({
            where: { codigoBarra },
            relations: ['documento'],
        });
    }

    /**
     * Busca ítems por SKU
     */
    async buscarPorSku(sku: string): Promise<ItemDocumentoOrigen[]> {
        return await this.itemRepo.find({
            where: { sku },
            relations: ['documento'],
        });
    }

    /**
     * Obtiene todos los ítems de un documento
     */
    async obtenerPorDocumento(documentoId: number): Promise<ItemDocumentoOrigen[]> {
        return await this.itemRepo.find({
            where: { documento: { id: documentoId } },
            order: { id: 'ASC' },
        });
    }

    /**
     * Crea múltiples ítems para un documento
     */
    async crearItems(documento: DocumentoOrigen, items: Partial<ItemDocumentoOrigen>[]): Promise<ItemDocumentoOrigen[]> {
        const entities = items.map(item => this.itemRepo.create({
            ...item,
            documento,
        }));
        return await this.itemRepo.save(entities);
    }
}

