import type { Almacen } from './almacen.model';

/**
 * Inventario
 */
export interface Inventario {
    id: number;
    codigo: string;
    tipo: string;
    estado: string;
    fechaApertura: string;
    fechaCierre: string | null;
    bodega: string | null;
    itemsContados: number;
    itemsTotales: number;
    diferencias: number;
    responsable: string;
    almacen: Almacen;
}

/**
 * Payload para crear un Inventario
 */
export interface CreateInventarioPayload {
    codigo: string;
    tipo: string;
    fechaApertura: string;
    almacenId: number;
    bodega?: string;
    responsable: string;
    itemsTotales: number;
}
