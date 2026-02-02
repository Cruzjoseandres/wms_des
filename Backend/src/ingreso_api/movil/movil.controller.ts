import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MovilService } from './movil.service';
import { IsNumber, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// DTOs para endpoints existentes
// ============================================

class EscanearValidarDto {
    @IsString()
    codigoBarra: string;

    @IsOptional()
    @IsString()
    usuarioId?: string;
}

class EscanearAlmacenarDto {
    @IsString()
    codigoBarra: string;

    @IsString()
    ubicacionDestino: string;

    @IsOptional()
    @IsString()
    usuarioId?: string;
}

class DetalleConfirmacionDto {
    @IsNumber()
    detalleId: number;

    @IsNumber()
    cantidadRecibida: number;

    @IsOptional()
    @IsString()
    ubicacion?: string;
}

class ConfirmarIngresoDto {
    @IsNumber()
    notaIngresoId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleConfirmacionDto)
    detalles: DetalleConfirmacionDto[];

    @IsOptional()
    @IsString()
    observacion?: string;

    @IsOptional()
    @IsString()
    usuarioId?: string;
}

// ============================================
// DTOs para validación individual por detalle
// ============================================

class IniciarValidacionDto {
    @IsNumber()
    detalleId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class ValidarDetalleDto {
    @IsNumber()
    detalleId: number;

    @IsNumber()
    cantidadRecibida: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class IniciarAlmacenajeDto {
    @IsNumber()
    detalleId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

class AlmacenarDetalleDto {
    @IsNumber()
    detalleId: number;

    @IsString()
    ubicacion: string;

    @IsOptional()
    @IsString()
    usuario?: string;
}

@Controller('api/movil')
export class MovilController {
    constructor(private readonly movilService: MovilService) { }

    // ============================================
    // ENDPOINTS EXISTENTES (por orden completa)
    // ============================================

    /**
     * POST /api/movil/validar
     * Operario 1: Valida un item por código de barra (orden completa)
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
     * Operario 2: Almacena un item en una ubicación (orden completa)
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

    // ============================================
    // ENDPOINTS DE VALIDACIÓN INDIVIDUAL
    // ============================================

    /**
     * POST /api/movil/iniciar-validacion
     * Marca el inicio de validación de un detalle (captura tiempo)
     */
    @Post('iniciar-validacion')
    async iniciarValidacion(@Body() dto: IniciarValidacionDto) {
        return await this.movilService.iniciarValidacion(
            dto.detalleId,
            dto.usuario || 'USUARIO_MOVIL',
        );
    }

    /**
     * POST /api/movil/validar-detalle
     * Valida un detalle específico con la cantidad recibida
     */
    @Post('validar-detalle')
    async validarDetalle(@Body() dto: ValidarDetalleDto) {
        return await this.movilService.validarDetalle(
            dto.detalleId,
            dto.cantidadRecibida,
            dto.usuario || 'USUARIO_MOVIL',
        );
    }

    /**
     * POST /api/movil/iniciar-almacenaje
     * Marca el inicio de almacenaje de un detalle (captura tiempo)
     */
    @Post('iniciar-almacenaje')
    async iniciarAlmacenaje(@Body() dto: IniciarAlmacenajeDto) {
        return await this.movilService.iniciarAlmacenaje(
            dto.detalleId,
            dto.usuario || 'USUARIO_MOVIL',
        );
    }

    /**
     * POST /api/movil/almacenar-detalle
     * Almacena un detalle específico en una ubicación
     */
    @Post('almacenar-detalle')
    async almacenarDetalle(@Body() dto: AlmacenarDetalleDto) {
        return await this.movilService.almacenarDetalle(
            dto.detalleId,
            dto.ubicacion,
            dto.usuario || 'USUARIO_MOVIL',
        );
    }

    // ============================================
    // ENDPOINTS DE CONSULTA
    // ============================================

    /**
     * GET /api/movil/ordenes/por-validar
     * Obtiene órdenes con detalles pendientes de validar
     */
    @Get('ordenes/por-validar')
    async obtenerPorValidar() {
        return await this.movilService.obtenerPorValidar();
    }

    /**
     * GET /api/movil/ordenes/por-almacenar
     * Obtiene órdenes con detalles listos para almacenar
     */
    @Get('ordenes/por-almacenar')
    async obtenerPorAlmacenar() {
        return await this.movilService.obtenerPorAlmacenar();
    }

    /**
     * GET /api/movil/metricas-operario/:usuarioId
     * Obtiene métricas de productividad de un operario
     */
    @Get('metricas-operario/:usuarioId')
    async obtenerMetricasOperario(@Param('usuarioId') usuarioId: string) {
        return await this.movilService.obtenerMetricasOperario(usuarioId);
    }
}
