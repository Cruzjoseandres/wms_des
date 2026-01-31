/**
 * Item dentro de un Documento de Origen
 */
export interface ItemDocumentoOrigen {
    id: number;
    codigoBarra: string;
    sku: string;
    codigoFabrica: string;
    codigoSistema: string;
    descripcion: string;
    cantidadTotal: number;
    unidadMedida: string;
}

/**
 * Documento de Origen (SAP, API externa)
 */
export interface DocumentoOrigen {
    id: number;
    nroDocumento: string;
    descripcion: string;
    origen: string; // SAP, MANUAL, API
    estado: string; // PENDIENTE, PROCESADO
    datosRaw: Record<string, unknown> | null;
    createdAt: string;
    items: ItemDocumentoOrigen[];
}

/**
 * Payload para crear orden desde documento
 */
export interface CrearDesdeDocumentoPayload {
    documentoId: number;
    almacenId: number;
    usuario?: string;
}
