import { Controller, Post, Get, Body } from '@nestjs/common';
import { MovilService } from './movil.service';

class EscanearValidarDto {
    codigoBarra: string;
    usuarioId?: string;
}

class EscanearAlmacenarDto {
    codigoBarra: string;
    ubicacionDestino: string;
    usuarioId?: string;
}

class ConfirmarIngresoDto {
    notaIngresoId: number;
    detalles: { detalleId: number; cantidadRecibida: number; ubicacion?: string }[];
    observacion?: string;
    usuarioId?: string;
}

@Controller('api/movil')
export class MovilController {
    constructor(private readonly movilService: MovilService) { }

    /**
     * POST /api/movil/validar
     * Operario 1: Valida un item por código de barra
     * Cambia estado de PALETIZADO -> VALIDADO
     */
    @Post('validar')
    async escanearValidar(@Body() dto: EscanearValidarDto) {
        return await this.movilService.escanearValidar(
            dto.codigoBarra,
            dto.usuarioId || 'USUARIO_MOVIL',
        );
    }

    /**
     * POST /api/movil/almacenar
     * Operario 2: Almacena un item en una ubicación
     * Cambia estado de VALIDADO -> ALMACENADO
     * Registra stock en stock_inventario
     */
    @Post('almacenar')
    async escanearAlmacenar(@Body() dto: EscanearAlmacenarDto) {
        return await this.movilService.escanearAlmacenar(
            dto.codigoBarra,
            dto.ubicacionDestino,
            dto.usuarioId || 'USUARIO_MOVIL',
        );
    }

    /**
     * POST /api/movil/confirmar
     * Confirma ingreso con cantidades reales y actualiza stock
     */
    @Post('confirmar')
    async confirmarIngreso(@Body() dto: ConfirmarIngresoDto) {
        return await this.movilService.confirmarIngreso(
            dto.notaIngresoId,
            dto.detalles,
            dto.observacion || null,
            dto.usuarioId || 'USUARIO_MOVIL',
        );
    }

    /**
     * GET /api/movil/ordenes/por-validar
     * Obtiene órdenes pendientes de validar
     */
    @Get('ordenes/por-validar')
    async obtenerPorValidar() {
        return await this.movilService.obtenerPorValidar();
    }

    /**
     * GET /api/movil/ordenes/por-almacenar
     * Obtiene órdenes pendientes de almacenar
     */
    @Get('ordenes/por-almacenar')
    async obtenerPorAlmacenar() {
        return await this.movilService.obtenerPorAlmacenar();
    }
}
