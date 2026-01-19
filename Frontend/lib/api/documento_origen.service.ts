import { API_ENDPOINTS } from "./config";

/**
 * Servicio para documentos de origen (SAP, API externa)
 * Conecta con /documento-origen y /api/ingreso
 */

export interface ItemDocumentoOrigenBackend {
    id: number;
    codigoBarra: string;
    sku: string;
    codigoFabrica: string;
    codigoSistema: string;
    descripcion: string;
    cantidadTotal: number;
    unidadMedida: string;
}

export interface DocumentoOrigenBackend {
    id: number;
    nroDocumento: string;
    descripcion: string;
    origen: string; // SAP, MANUAL, API
    estado: string; // PENDIENTE, PROCESADO
    datosRaw: Record<string, unknown> | null;
    createdAt: string;
    items: ItemDocumentoOrigenBackend[];
}

export interface CrearDesdeDocumentoPayload {
    documentoId: number;
    almacenId: number;
    usuario?: string;
}

export const DocumentoOrigenService = {
    /**
     * Obtiene todos los documentos
     */
    async getAll(): Promise<DocumentoOrigenBackend[]> {
        const res = await fetch(API_ENDPOINTS.documentoOrigen, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener documentos");
        return await res.json();
    },

    /**
     * Obtiene documentos pendientes de procesar
     */
    async getPendientes(): Promise<DocumentoOrigenBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.documentoOrigen}/pendientes`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener documentos pendientes");
        return await res.json();
    },

    /**
     * Busca documentos por número o descripción
     */
    async buscar(query: string): Promise<DocumentoOrigenBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.documentoOrigen}/buscar?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al buscar documentos");
        return await res.json();
    },

    /**
     * Obtiene un documento por número
     */
    async getByNumero(nroDocumento: string): Promise<DocumentoOrigenBackend | null> {
        const res = await fetch(`${API_ENDPOINTS.documentoOrigen}/${encodeURIComponent(nroDocumento)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return null;
        return await res.json();
    },

    /**
     * Crea una orden de ingreso desde un documento de origen
     * Usa el endpoint /api/ingreso/crear
     */
    async crearOrdenDesdeDocumento(payload: CrearDesdeDocumentoPayload): Promise<unknown> {
        const res = await fetch(`${API_ENDPOINTS.ingresoApi}/crear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al crear orden desde documento");
        }

        return await res.json();
    },
};
