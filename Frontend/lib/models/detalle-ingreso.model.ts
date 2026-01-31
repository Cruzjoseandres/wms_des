import type { ItemResumen } from './item.model';

/**
 * Detalle de una Nota de Ingreso
 */
export interface DetalleIngreso {
    id: number;
    codItem: string;
    cantidad: number;
    cantidadEsperada: number;
    lote: string | null;
    fechaVencimiento: string | null;
    serie: string | null;
    ubicacionSugerida: string | null;
    ubicacionFinal: string | null;
    item: ItemResumen;
}

/**
 * Detalle mapeado para el store del frontend
 */
export interface DetalleIngresoFrontend {
    id: string;
    producto: string;
    descripcion: string;
    cantidad: number;
    cantidadEsperada: number;
    lote: string | null;
    vencimiento: string | null;
    codigoBarra: string | null;
    codigoFabrica: string | null;
    ubicacionSugerida: string | null;
    ubicacionFinal: string | null;
}
