import type { ItemResumen } from './item.model';
import type { Almacen } from './almacen.model';

/**
 * Estado individual de cada detalle
 */
export enum EstadoDetalle {
    PENDIENTE = 0,
    VALIDADO = 1,
    ALMACENADO = 2,
}

/**
 * Nombres de estado para mostrar en UI
 */
export const EstadoDetalleNombre: Record<EstadoDetalle, string> = {
    [EstadoDetalle.PENDIENTE]: 'Pendiente',
    [EstadoDetalle.VALIDADO]: 'Validado',
    [EstadoDetalle.ALMACENADO]: 'Almacenado',
};

/**
 * Detalle de una orden para operaciones móviles
 */
export interface DetalleMovil {
    id: number;
    codItem: string;
    cantidad: number;
    cantidadEsperada: number;
    cantidadRecibida?: number;
    lote: string | null;
    estado: EstadoDetalle;
    estadoNombre?: string;
    usuarioValidacion?: string;
    usuarioAlmacenaje?: string;
    validatedAt?: string;
    storedAt?: string;
    tiempoValidacion?: number;
    tiempoAlmacenaje?: number;
    item: ItemResumen;
}

/**
 * Resumen de estados de detalles en una orden
 */
export interface ResumenOrden {
    totalDetalles: number;
    pendientes: number;
    validados: number;
    almacenados: number;
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
    resumen?: ResumenOrden;
}

/**
 * Respuesta de inicio de validación
 */
export interface IniciarValidacionResponse {
    exito: boolean;
    mensaje: string;
    detalle: {
        id: number;
        codItem: string;
        cantidadEsperada: number;
        item: ItemResumen;
    };
    inicioValidacion: string;
}

/**
 * Respuesta de validación de detalle
 */
export interface ValidarDetalleResponse {
    exito: boolean;
    mensaje: string;
    detalle: {
        id: number;
        codItem: string;
        cantidadEsperada: number;
        cantidadRecibida: number;
        estado: string;
        tiempoValidacion: number;
    };
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
    };
    siguientePaso: string;
}

/**
 * Respuesta de inicio de almacenaje
 */
export interface IniciarAlmacenajeResponse {
    exito: boolean;
    mensaje: string;
    detalle: {
        id: number;
        codItem: string;
        cantidadRecibida: number;
        ubicacionSugerida?: string;
        item: ItemResumen;
    };
    inicioAlmacenaje: string;
}

/**
 * Respuesta de almacenaje de detalle
 */
export interface AlmacenarDetalleResponse {
    exito: boolean;
    mensaje: string;
    detalle: {
        id: number;
        codItem: string;
        cantidadRecibida: number;
        ubicacionFinal: string;
        estado: string;
        tiempoAlmacenaje: number;
    };
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

/**
 * Métricas de operario
 */
export interface MetricasOperario {
    usuario: string;
    validaciones: {
        total: number;
        conTiempo: number;
        tiempoPromedio: number;
        tiempoMin: number;
        tiempoMax: number;
    };
    almacenajes: {
        total: number;
        conTiempo: number;
        tiempoPromedio: number;
        tiempoMin: number;
        tiempoMax: number;
    };
}

// Legacy types for backward compatibility
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
