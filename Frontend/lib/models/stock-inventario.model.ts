import type { ItemResumen } from './item.model';

/**
 * Referencia a un detalle de ingreso en el stock
 */
export interface DetalleIngresoRef {
    id: number;
    codItem: string;
    lote: string | null;
    fechaVencimiento: string | null;
    cantidad: number;
}

/**
 * Stock de Inventario
 */
export interface StockInventario {
    id: number;
    item: ItemResumen;
    ubicacion: string;
    cantidad: number;
    estado: string;
    ultimoMovimiento: string;
    detalleIngreso: DetalleIngresoRef | null;
}
