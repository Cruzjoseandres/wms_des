import { API_ENDPOINTS } from "./config";

export interface DetalleDocumentoExterno {
    cod_item: string;
    descripcion: string;
    cantidad: number;
    lote?: string | null;
    fecha_vencimiento?: string | null;
}

export interface DocumentoExterno {
    numero_documento: string;
    tipo_fuente: "API_ERP" | "MANUAL";
    proveedor: string;
    fecha_documento?: string; // Puede venir o no
    detalles: DetalleDocumentoExterno[];
}

export const DocumentoExternoService = {
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
