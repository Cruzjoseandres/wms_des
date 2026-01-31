import { API_ENDPOINTS } from "./config";
import type {
    DocumentoOrigen,
    CrearDesdeDocumentoPayload,
} from "@/lib/models";

/**
 * Servicio para Documentos de Origen (SAP, API externa)
 */
export const DocumentoOrigenService = {
    /**
     * Obtiene todos los documentos
     */
    async getAll(): Promise<DocumentoOrigen[]> {
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
    async getPendientes(): Promise<DocumentoOrigen[]> {
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
    async buscar(query: string): Promise<DocumentoOrigen[]> {
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
    async getByNumero(nroDocumento: string): Promise<DocumentoOrigen | null> {
        const res = await fetch(`${API_ENDPOINTS.documentoOrigen}/${encodeURIComponent(nroDocumento)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return null;
        return await res.json();
    },

    /**
     * Crea una orden de ingreso desde un documento de origen
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
