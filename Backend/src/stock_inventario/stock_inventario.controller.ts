import { Controller, Get, Param } from '@nestjs/common';
import { StockInventarioService } from './stock_inventario.service';

@Controller('stock-inventario')
export class StockInventarioController {
    constructor(private readonly stockInventarioService: StockInventarioService) { }

    /**
     * GET /stock-inventario
     * Obtiene todo el stock
     */
    @Get()
    obtenerTodos() {
        return this.stockInventarioService.obtenerTodos();
    }

    /**
     * GET /stock-inventario/disponible
     * Obtiene solo stock disponible
     */
    @Get('disponible')
    obtenerDisponible() {
        return this.stockInventarioService.obtenerDisponible();
    }

    /**
     * GET /stock-inventario/por-item/:itemId
     * Obtiene stock por Item ID
     */
    @Get('por-item/:itemId')
    obtenerPorItem(@Param('itemId') itemId: number) {
        return this.stockInventarioService.obtenerPorItem(itemId);
    }

    /**
     * GET /stock-inventario/por-ubicacion/:ubicacion
     * Obtiene stock por ubicación
     */
    @Get('por-ubicacion/:ubicacion')
    obtenerPorUbicacion(@Param('ubicacion') ubicacion: string) {
        return this.stockInventarioService.obtenerPorUbicacion(ubicacion);
    }
}
