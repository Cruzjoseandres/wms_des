import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PickingService } from './picking.service';
import { IsNumber, IsString, IsOptional } from 'class-validator';

// ============================================
// DTOs
// ============================================

class IniciarOrdenDto {
    @IsNumber()
    ordenId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class IniciarDetalleDto {
    @IsNumber()
    detalleId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class PickearDetalleDto {
    @IsNumber()
    detalleId: number;

    @IsNumber()
    cantidadPickeada: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class CompletarOrdenDto {
    @IsNumber()
    ordenId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

@Controller('api/picking')
export class PickingController {
    constructor(private readonly service: PickingService) { }

    /**
     * GET /api/picking/ordenes/pendientes
     * Listar órdenes pendientes de picking
     */
    @Get('ordenes/pendientes')
    async obtenerOrdenesPendientes() {
        return this.service.obtenerOrdenesPendientes();
    }

    /**
     * POST /api/picking/iniciar-orden
     * Iniciar picking de una orden
     */
    @Post('iniciar-orden')
    async iniciarOrden(@Body() dto: IniciarOrdenDto) {
        return this.service.iniciarOrden(
            dto.ordenId,
            dto.usuario || 'PICKER_MOVIL',
        );
    }

    /**
     * POST /api/picking/iniciar-detalle
     * Iniciar picking de un detalle (captura tiempo)
     */
    @Post('iniciar-detalle')
    async iniciarDetalle(@Body() dto: IniciarDetalleDto) {
        return this.service.iniciarDetalle(
            dto.detalleId,
            dto.usuario || 'PICKER_MOVIL',
        );
    }

    /**
     * POST /api/picking/pickear-detalle
     * Confirmar picking de un detalle
     */
    @Post('pickear-detalle')
    async pickearDetalle(@Body() dto: PickearDetalleDto) {
        return this.service.pickearDetalle(
            dto.detalleId,
            dto.cantidadPickeada,
            dto.usuario || 'PICKER_MOVIL',
        );
    }

    /**
     * POST /api/picking/completar-orden
     * Completar picking de una orden
     */
    @Post('completar-orden')
    async completarOrden(@Body() dto: CompletarOrdenDto) {
        return this.service.completarOrden(
            dto.ordenId,
            dto.usuario || 'PICKER_MOVIL',
        );
    }

    /**
     * GET /api/picking/metricas/:usuarioId
     * Obtener métricas de productividad
     */
    @Get('metricas/:usuarioId')
    async obtenerMetricas(@Param('usuarioId') usuarioId: string) {
        return this.service.obtenerMetricas(usuarioId);
    }
}
