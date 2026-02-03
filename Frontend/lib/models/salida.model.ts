import type { ItemResumen } from './item.model';

/**
 * Estado de una orden de salida
 */
export enum EstadoOrdenSalida {
    PENDIENTE = 0,
    EN_PICKING = 1,
    COMPLETADA = 2,
    DESPACHADA = 3,
}

export const EstadoOrdenSalidaNombre: Record<EstadoOrdenSalida, string> = {
    [EstadoOrdenSalida.PENDIENTE]: 'Pendiente',
    [EstadoOrdenSalida.EN_PICKING]: 'En Picking',
    [EstadoOrdenSalida.COMPLETADA]: 'Completada',
    [EstadoOrdenSalida.DESPACHADA]: 'Despachada',
};

/**
 * Estado de un detalle de salida
 */
export enum EstadoDetalleSalida {
    PENDIENTE = 0,
    PICKEADO = 1,
}

export const EstadoDetalleSalidaNombre: Record<EstadoDetalleSalida, string> = {
    [EstadoDetalleSalida.PENDIENTE]: 'Pendiente',
    [EstadoDetalleSalida.PICKEADO]: 'Pickeado',
};

/**
 * Detalle de una orden de salida
 */
export interface DetalleSalida {
    id: number;
    codItem: string;
    cantidadSolicitada: number;
    cantidadPickeada?: number;
    ubicacionOrigen?: string;
    estado: EstadoDetalleSalida;
    estadoNombre?: string;
    tiempoPicking?: number;
    item: ItemResumen;
}

/**
 * Resumen de detalles en una orden de salida
 */
export interface ResumenOrdenSalida {
    totalDetalles: number;
    pendientes: number;
    pickeados: number;
}

/**
 * Orden de salida
 */
export interface OrdenSalida {
    id: number;
    nroDocumento: string;
    cliente: string;
    destino?: string;
    prioridad: number;
    estado: EstadoOrdenSalida;
    estadoNombre?: string;
    observacion?: string;
    detalles: DetalleSalida[];
    resumen?: ResumenOrdenSalida;
    pickingStartedAt?: string;
    pickingCompletedAt?: string;
    createdAt?: string;
}

/**
 * Payload para crear orden de salida
 */
export interface CreateOrdenSalidaPayload {
    nroDocumento?: string;
    cliente: string;
    destino?: string;
    prioridad?: number;
    almacenCodigo: string;
    observacion?: string;
    detalles: {
        codItem: string;
        cantidad: number;
    }[];
}

/**
 * Payload para importar desde ERP
 */
export interface ImportarERPPayload {
    nroDocumento: string;
    cliente: string;
    destino?: string;
    prioridad?: number;
    almacenCodigo: string;
    items: {
        codigo: string;
        cantidad: number;
    }[];
}

/**
 * Respuesta de iniciar picking de orden
 */
export interface IniciarPickingOrdenResponse {
    exito: boolean;
    mensaje: string;
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
    };
}

/**
 * Respuesta de pickear detalle
 */
export interface PickearDetalleResponse {
    exito: boolean;
    mensaje: string;
    detalle: {
        id: number;
        codItem: string;
        cantidadPickeada: number;
        estado: string;
        tiempoPicking?: number;
    };
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
    };
}

/**
 * Respuesta de completar picking
 */
export interface CompletarPickingResponse {
    exito: boolean;
    mensaje: string;
    orden: {
        id: number;
        nroDocumento: string;
        estado: string;
        pickingStartedAt: string;
        pickingCompletedAt: string;
    };
    siguientePaso: string;
}

/**
 * Métricas de picker
 */
export interface MetricasPicker {
    usuario: string;
    picking: {
        total: number;
        tiempoPromedio: number;
        tiempoMin: number;
        tiempoMax: number;
    };
}
