/**
 * Detalle de un Documento Externo
 */
export interface DetalleDocumentoExterno {
    id: number;
    codItem: string;
    descripcion: string;
    cantidad: string | number;
    lote: string | null;
    fechaVencimiento: string | null;
    codigoBarra: string | null;
    sku: string | null;
    codigoFabrica: string | null;
    codigoSistema: string | null;
    unidadMedida: string | null;
    createdAt: string | null;
}

/**
 * Tipo de fuente de un documento externo
 */
export type TipoFuenteDocumento = "API_ERP" | "MANUAL";

/**
 * Documento Externo (API ERP o Manual)
 */
export interface DocumentoExterno {
    id: number;
    nroDocumento: string;
    tipoFuente: TipoFuenteDocumento;
    proveedor: string;
    fechaDocumento: string | null;
    descripcion: string | null;
    estado: string | null;
    datosRaw: Record<string, unknown> | null;
    createdAt: string | null;
    items: DetalleDocumentoExterno[];
}
