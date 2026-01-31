import type { ItemResumen } from './item.model';
import type { Almacen } from './almacen.model';

/**
 * Detalle de una orden para operaciones móviles
 */
export interface DetalleMovil {
    id: number;
    codItem: string;
    cantidad: number;
    lote: string | null;
    item: ItemResumen;
}

/**
 * Orden para operaciones móviles (PDA/Scanner)
 */
export interface OrdenMovil {
    id: number;
    nroDocumento: string;
    origen: string;
    estado: string;
    createdAt: string;
    validatedAt: string | null;
    almacen: Almacen;
    detalles: DetalleMovil[];
}

/**
 * Respuesta de validación móvil
 */
export interface ValidarResponse {
    exito: boolean;
    mensaje: string;
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
    };
    siguientePaso: string;
}

/**
 * Respuesta de almacenaje móvil
 */
export interface AlmacenarResponse {
    exito: boolean;
    mensaje: string;
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
    };
    stock: {
        item: string;
        ubicacion: string;
        cantidad: number;
    };
}
