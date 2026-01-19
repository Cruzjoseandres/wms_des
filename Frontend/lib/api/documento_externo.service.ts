import { API_ENDPOINTS } from "./config";

export interface DetalleDocumentoExterno {
    id: number;
    codItem: string;
    descripcion: string;
    cantidad: string;
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

export const DocumentoExternoService = {
    /**
     * Lista documentos externos con filtro opcional.
     * @param filtro Texto para filtrar por número de documento (opcional)
     * @param tipo Tipo de fuente (API_ERP o MANUAL, opcional)
     */
    async listar(filtro?: string, tipo?: "API_ERP" | "MANUAL"): Promise<DocumentoExterno[]> {
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
     * @param numero Número del documento (ej: SAP-2024-001)
     * @param tipo Tipo de fuente (API_ERP o MANUAL)
     */
    async buscar(numero: string, tipo: "API_ERP" | "MANUAL"): Promise<DocumentoExterno> {
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
