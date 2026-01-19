import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentoOrigenService } from './documento_origen.service';

@Controller('documentos-externos')
export class DocumentoOrigenController {
    constructor(private readonly documentoOrigenService: DocumentoOrigenService) { }

    /**
     * GET /documentos-externos
     * Obtiene todos los documentos
     */
    @Get()
    obtenerTodos() {
        return this.documentoOrigenService.obtenerTodos();
    }

    /**
     * GET /documentos-externos/pendientes
     * Obtiene documentos pendientes de procesar
     */
    @Get('pendientes')
    obtenerPendientes() {
        return this.documentoOrigenService.obtenerPendientes();
    }

    /**
     * GET /documentos-externos/buscar?numero=SAP-2024-001&tipo=API_ERP
     * Busca documentos por número y tipo de fuente
     */
    @Get('buscar')
    buscar(
        @Query('numero') numero: string,
        @Query('tipo') tipo: string,
        @Query('q') q: string,
    ) {
        // Si viene el parámetro numero (formato requerido por frontend)
        if (numero) {
            return this.documentoOrigenService.buscarPorNumeroYTipo(numero, tipo);
        }
        // Compatibilidad con formato anterior usando q
        if (q) {
            return this.documentoOrigenService.buscar(q, tipo);
        }
        return this.documentoOrigenService.obtenerPendientes();
    }

    /**
     * GET /documentos-externos/:nroDocumento
     * Obtiene un documento específico por su número
     */
    @Get(':nroDocumento')
    buscarPorNumero(@Param('nroDocumento') nroDocumento: string) {
        return this.documentoOrigenService.buscarPorNumero(nroDocumento);
    }
}
