import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentoOrigenService } from './documento_origen.service';

@Controller('documento-origen')
export class DocumentoOrigenController {
    constructor(private readonly documentoOrigenService: DocumentoOrigenService) { }

    /**
     * GET /documento-origen
     * Obtiene todos los documentos
     */
    @Get()
    obtenerTodos() {
        return this.documentoOrigenService.obtenerTodos();
    }

    /**
     * GET /documento-origen/pendientes
     * Obtiene documentos pendientes de procesar
     */
    @Get('pendientes')
    obtenerPendientes() {
        return this.documentoOrigenService.obtenerPendientes();
    }

    /**
     * GET /documento-origen/buscar?q=SAP-2024
     * Busca documentos por número o descripción
     */
    @Get('buscar')
    buscar(@Query('q') query: string) {
        if (!query) {
            return this.documentoOrigenService.obtenerPendientes();
        }
        return this.documentoOrigenService.buscar(query);
    }

    /**
     * GET /documento-origen/:nroDocumento
     * Obtiene un documento específico por su número
     */
    @Get(':nroDocumento')
    buscarPorNumero(@Param('nroDocumento') nroDocumento: string) {
        return this.documentoOrigenService.buscarPorNumero(nroDocumento);
    }
}
