import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoOrigen } from './entities/documento_origen.entity';

@Injectable()
export class DocumentoOrigenService {
    constructor(
        @InjectRepository(DocumentoOrigen)
        private readonly documentoRepo: Repository<DocumentoOrigen>,
    ) { }

    /**
     * Busca un documento por su número (ej: SAP-2024-001)
     */
    async buscarPorNumero(nroDocumento: string): Promise<DocumentoOrigen | null> {
        return await this.documentoRepo.findOne({
            where: { nroDocumento },
            relations: ['items'],
        });
    }

    /**
     * Busca documentos que coincidan parcialmente con el término de búsqueda
     */
    async buscar(query: string): Promise<DocumentoOrigen[]> {
        return await this.documentoRepo
            .createQueryBuilder('doc')
            .leftJoinAndSelect('doc.items', 'items')
            .where('doc.nroDocumento ILIKE :query', { query: `%${query}%` })
            .orWhere('doc.descripcion ILIKE :query', { query: `%${query}%` })
            .andWhere('doc.estado = :estado', { estado: 'PENDIENTE' })
            .getMany();
    }

    /**
     * Obtiene todos los documentos pendientes
     */
    async obtenerPendientes(): Promise<DocumentoOrigen[]> {
        return await this.documentoRepo.find({
            where: { estado: 'PENDIENTE' },
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Marca un documento como procesado
     */
    async marcarProcesado(id: number): Promise<DocumentoOrigen> {
        const doc = await this.documentoRepo.findOneBy({ id });
        if (!doc) {
            throw new NotFoundException(`Documento con ID ${id} no encontrado`);
        }
        doc.estado = 'PROCESADO';
        return await this.documentoRepo.save(doc);
    }

    /**
     * Obtiene todos los documentos (para administración)
     */
    async obtenerTodos(): Promise<DocumentoOrigen[]> {
        return await this.documentoRepo.find({
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Obtiene un documento por ID
     */
    async obtenerPorId(id: number): Promise<DocumentoOrigen | null> {
        return await this.documentoRepo.findOne({
            where: { id },
            relations: ['items'],
        });
    }
}
