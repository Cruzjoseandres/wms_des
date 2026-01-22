import { API_ENDPOINTS } from "./config";

export interface DetalleDocumentoExterno {
    id: number;
    codItem: string;
    descripcion: string;
    cantidad: string | number;
    lote?: string | null;
    fechaVencimiento?: string | null;
    codigoBarra?: string | null;
    sku?: string | null;
    codigoFabrica?: string | null;
    codigoSistema?: string | null;
    unidadMedida?: string;
    createdAt?: string;
}

export interface DocumentoExterno {
    id: number;
    nroDocumento: string;
    tipoFuente: "API_ERP" | "MANUAL";
    proveedor: string;
    fechaDocumento?: string;
    descripcion?: string;
    estado?: string;
    datosRaw?: Record<string, unknown>;
    createdAt?: string;
    items: DetalleDocumentoExterno[];
}

// Cache para los documentos de API ERP (cargados del JSON local)
let apiErpDocumentsCache: DocumentoExterno[] | null = null;

/**
 * Carga los documentos de la API ERP desde el archivo JSON local
 * Simula una respuesta de sistema externo (SAP, Oracle, etc.)
 */
async function loadApiErpDocuments(): Promise<DocumentoExterno[]> {
    if (apiErpDocumentsCache) {
        return apiErpDocumentsCache;
    }

    try {
        const res = await fetch("/api-erp-documents.json", {
            cache: "no-store"
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
 * Invalida el cache de documentos API ERP (útil para pruebas)
 */
export function invalidateApiErpCache(): void {
    apiErpDocumentsCache = null;
}

export const DocumentoExternoService = {
    /**
     * Lista documentos externos con filtro opcional.
     * - API_ERP: Lee del archivo JSON local (simula API externa)
     * - MANUAL: Lee del backend/base de datos
     */
    async listar(filtro?: string, tipo?: "API_ERP" | "MANUAL"): Promise<DocumentoExterno[]> {
        // Si es API_ERP, leer del JSON local
        if (tipo === "API_ERP") {
            const docs = await loadApiErpDocuments();
            if (!filtro) return docs;

            const filtroLower = filtro.toLowerCase();
            return docs.filter(doc =>
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
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al listar documentos");
        }

        return await res.json();
    },

    /**
     * Busca un documento externo por número y tipo de fuente.
     * - API_ERP: Busca en el archivo JSON local
     * - MANUAL: Busca en el backend/base de datos
     */
    async buscar(numero: string, tipo: "API_ERP" | "MANUAL"): Promise<DocumentoExterno> {
        // Si es API_ERP, buscar en el JSON local
        if (tipo === "API_ERP") {
            const docs = await loadApiErpDocuments();
            const doc = docs.find(d =>
                d.nroDocumento.toLowerCase().includes(numero.toLowerCase())
            );

            if (!doc) {
                throw new Error("Documento no encontrado en sistema API ERP");
            }

            return doc;
        }

        // Si es MANUAL, ir al backend
        const params = new URLSearchParams({
            numero,
            tipo,
        });

        const res = await fetch(`${API_ENDPOINTS.documentosExternos}/buscar?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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

