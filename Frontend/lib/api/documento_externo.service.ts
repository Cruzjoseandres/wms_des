import { API_ENDPOINTS } from "./config";
import type { DocumentoExterno, TipoFuenteDocumento } from "@/lib/models";

// Cache para los documentos de API ERP
let apiErpDocumentsCache: DocumentoExterno[] | null = null;

/**
 * Carga los documentos de la API ERP desde el archivo JSON local
 */
async function loadApiErpDocuments(): Promise<DocumentoExterno[]> {
    if (apiErpDocumentsCache) {
        return apiErpDocumentsCache;
    }

    try {
        const res = await fetch("/api-erp-documents.json", {
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Error cargando documentos API ERP:", res.status);
            return [];
        }

        apiErpDocumentsCache = await res.json();
        return apiErpDocumentsCache || [];
    } catch (error) {
        console.error("Error cargando documentos API ERP:", error);
        return [];
    }
}

/**
 * Invalida el cache de documentos API ERP
 */
export function invalidateApiErpCache(): void {
    apiErpDocumentsCache = null;
}

/**
 * Servicio para Documentos Externos
 */
export const DocumentoExternoService = {
    /**
     * Lista documentos externos con filtro opcional
     */
    async listar(filtro?: string, tipo?: TipoFuenteDocumento): Promise<DocumentoExterno[]> {
        // Si es API_ERP, leer del JSON local
        if (tipo === "API_ERP") {
            const docs = await loadApiErpDocuments();
            if (!filtro) return docs;

            const filtroLower = filtro.toLowerCase();
            return docs.filter(
                (doc) =>
                    doc.nroDocumento.toLowerCase().includes(filtroLower) ||
                    doc.descripcion?.toLowerCase().includes(filtroLower) ||
                    doc.proveedor?.toLowerCase().includes(filtroLower)
            );
        }

        // Si es MANUAL o sin tipo, ir al backend
        const params = new URLSearchParams();
        if (filtro) params.append("filtro", filtro);
        if (tipo) params.append("tipo", tipo);

        const url = params.toString()
            ? `${API_ENDPOINTS.documentosExternos}?${params.toString()}`
            : API_ENDPOINTS.documentosExternos;

        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al listar documentos");
        }

        return await res.json();
    },

    /**
     * Busca un documento externo por número y tipo de fuente
     */
    async buscar(numero: string, tipo: TipoFuenteDocumento): Promise<DocumentoExterno> {
        // Si es API_ERP, buscar en el JSON local
        if (tipo === "API_ERP") {
            const docs = await loadApiErpDocuments();
            const doc = docs.find((d) =>
                d.nroDocumento.toLowerCase().includes(numero.toLowerCase())
            );

            if (!doc) {
                throw new Error("Documento no encontrado en sistema API ERP");
            }

            return doc;
        }

        // Si es MANUAL, ir al backend
        const params = new URLSearchParams({ numero, tipo });

        const res = await fetch(`${API_ENDPOINTS.documentosExternos}/buscar?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Documento no encontrado");
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al buscar el documento");
        }

        return await res.json();
    },
};
