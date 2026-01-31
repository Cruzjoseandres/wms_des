import type { Almacen } from './almacen.model';
import type { DetalleIngreso, DetalleIngresoFrontend } from './detalle-ingreso.model';

/**
 * Estados de una Nota de Ingreso
 */
export type EstadoIngreso = 'paletizado' | 'validado' | 'almacenado' | 'anulado';
export type TipoIngreso = 'produccion' | 'traspaso' | 'reingreso' | 'anulacion';

/**
 * Nota de Ingreso - Respuesta del Backend
 */
export interface NotaIngreso {
    id: number;
    nroDocumento: string;
    fechaIngreso: string;
    origen: string;
    usuarioCreacion: string;
    usuarioValidacion: string | null;
    usuarioAlmacenaje: string | null;
    validatedAt: string | null;
    storedAt: string | null;
    estado: number;
    almacen: Almacen;
    detalles: DetalleIngreso[];
    observacion: string | null;
    sourceDocId: number | null;
    createdAt: string;
}

/**
 * Nota de Ingreso - Formato del Store Frontend
 */
export interface NotaIngresoFrontend {
    id: string;
    documento: string;
    tipo: TipoIngreso;
    origen: string;
    fecha: string;
    items: DetalleIngresoFrontend[];
    estado: EstadoIngreso;
    observaciones: string | null;
    usuarioCreacion: string;
    usuarioValidacion: string | null;
    usuarioAlmacenaje: string | null;
    validatedAt: string | null;
    storedAt: string | null;
    almacenId: string;
    sourceDocId: number | null;
}

/**
 * Payload para crear una Nota de Ingreso
 */
export interface CreateNotaIngresoPayload {
    nroDocumento: string;
    origen: string;
    almacenId: number;
    usuario?: string;
    sourceDocId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    detalles: CreateDetallePayload[];
}

/**
 * Payload para crear un Detalle de Ingreso
 */
export interface CreateDetallePayload {
    productoId: string;
    cantidad: number;
    cantidadEsperada?: number;
    lote?: string;
    fechaVencimiento?: string;
    serie?: string;
    ubicacionSugerida?: string;
}
