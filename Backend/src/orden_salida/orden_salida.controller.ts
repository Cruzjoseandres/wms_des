import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { OrdenSalidaService } from './orden_salida.service';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// DTOs
// ============================================

class DetalleCrearDto {
    @IsString()
    codItem: string;

    @IsNumber()
    cantidad: number;
}

class CrearOrdenDto {
    @IsString()
    nroDocumento: string;

    @IsString()
    cliente: string;

    @IsOptional()
    @IsString()
    destino?: string;

    @IsOptional()
    @IsNumber()
    prioridad?: number;

    @IsOptional()
    @IsString()
    almacenCodigo?: string;

    @IsOptional()
    @IsString()
    observacion?: string;

    @IsOptional()
    @IsString()
    usuarioCreacion?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleCrearDto)
    detalles: DetalleCrearDto[];
}

class ItemERPDto {
    @IsString()
    codigo: string;

    @IsNumber()
    cantidad: number;
}

class ImportarERPDto {
    @IsString()
    nroDocumento: string;

    @IsString()
    cliente: string;

    @IsOptional()
    @IsString()
    destino?: string;

    @IsOptional()
    @IsNumber()
    prioridad?: number;

    @IsOptional()
    @IsString()
    almacenCodigo?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemERPDto)
    items: ItemERPDto[];
}

@Controller('api/salida')
export class OrdenSalidaController {
    constructor(private readonly service: OrdenSalidaService) { }

    /**
     * GET /api/salida/ordenes
     * Listar todas las órdenes de salida
     * Query: ?estado=0 para filtrar por estado
     */
    @Get('ordenes')
    async listarOrdenes(@Query('estado') estado?: string) {
        const estadoNum = estado !== undefined ? parseInt(estado, 10) : undefined;
        const ordenes = await this.service.listarOrdenes(estadoNum);
        return ordenes.map(orden => ({
            ...orden,
            estadoNombre: this.service.obtenerNombreEstado(orden.estado),
            resumen: {
                totalDetalles: orden.detalles?.length || 0,
                pendientes: orden.detalles?.filter(d => d.estado === 0).length || 0,
                pickeados: orden.detalles?.filter(d => d.estado === 1).length || 0,
            },
        }));
    }

    /**
     * GET /api/salida/ordenes/:id
     * Obtener detalle de una orden
     */
    @Get('ordenes/:id')
    async obtenerOrden(@Param('id') id: string) {
        const orden = await this.service.obtenerOrden(parseInt(id, 10));
        return {
            ...orden,
            estadoNombre: this.service.obtenerNombreEstado(orden.estado),
        };
    }

    /**
     * POST /api/salida/ordenes
     * Crear orden manualmente
     */
    @Post('ordenes')
    async crearOrden(@Body() dto: CrearOrdenDto) {
        return this.service.crearOrden(dto);
    }

    /**
     * POST /api/salida/importar
     * Simular importación desde sistema ERP externo
     */
    @Post('importar')
    async importarDesdeERP(@Body() dto: ImportarERPDto) {
        return this.service.importarDesdeERP(dto);
    }
}
