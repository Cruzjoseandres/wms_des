import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { IngresoApiService } from './ingreso_api.service';

class CrearDesdeDocumentoDto {
    documentoId: number;
    almacenId: number;
    usuario?: string;
}

@Controller('api/ingreso')
export class IngresoApiController {
    constructor(private readonly ingresoApiService: IngresoApiService) { }

    /**
     * GET /api/ingreso/buscar?q=SAP-2024&origen=manual
     * Busca documentos de origen por número o descripción
     */
    @Get('buscar')
    async buscar(
        @Query('q') query: string,
        @Query('origen') origen: 'manual' | 'api' = 'manual',
    ) {
        if (!query) {
            return await this.ingresoApiService.obtenerPendientes();
        }
        return await this.ingresoApiService.buscarDocumentos(query, origen);
    }

    /**
     * GET /api/ingreso/pendientes
     * Obtiene documentos pendientes de procesar
     */
    @Get('pendientes')
    async obtenerPendientes() {
        return await this.ingresoApiService.obtenerPendientes();
    }

    /**
     * GET /api/ingreso/documento/:nroDocumento
     * Obtiene un documento específico
     */
    @Get('documento/:nroDocumento')
    async obtenerDocumento(@Param('nroDocumento') nroDocumento: string) {
        return await this.ingresoApiService.obtenerDocumento(nroDocumento);
    }

    /**
     * POST /api/ingreso/crear
     * Crea una orden de ingreso desde un documento de origen
     */
    @Post('crear')
    async crearDesdeDocumento(@Body() dto: CrearDesdeDocumentoDto) {
        return await this.ingresoApiService.crearDesdeDocumento(
            dto.documentoId,
            dto.almacenId,
            dto.usuario || 'WEB',
        );
    }
}
