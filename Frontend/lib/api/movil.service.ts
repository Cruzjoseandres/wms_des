import { API_ENDPOINTS } from "./config";

/**
 * Servicio para operaciones móviles (PDA/Scanner)
 * Conecta con /api/movil
 */

export interface OrdenMovilBackend {
    id: number;
    nroDocumento: string;
    origen: string;
    estado: string;
    createdAt: string;
    validatedAt?: string;
    almacen: {
        id: number;
        codigo: string;
        descripcion: string;
    };
    detalles: Array<{
        id: number;
        codItem: string;
        cantidad: number;
        lote: string | null;
        productCodes: {
            barcode?: string;
            sku?: string;
        } | null;
    }>;
}

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
        sku: string;
        ubicacion: string;
        cantidad: number;
    };
}

export const MovilService = {
    /**
     * Valida un item por código de barra (Operario 1)
     * Cambia estado: PALETIZADO → VALIDADO
     */
    async validar(codigoBarra: string, usuarioId?: string): Promise<ValidarResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/validar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigoBarra,
                usuarioId: usuarioId || "MOBILE_USER",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al validar");
        }

        return await res.json();
    },

    /**
     * Almacena un item en una ubicación (Operario 2)
     * Cambia estado: VALIDADO → ALMACENADO
     * Registra stock en inventory
     */
    async almacenar(codigoBarra: string, ubicacionDestino: string, usuarioId?: string): Promise<AlmacenarResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/almacenar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigoBarra,
                ubicacionDestino,
                usuarioId: usuarioId || "MOBILE_USER",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al almacenar");
        }

        return await res.json();
    },

    /**
     * Obtiene órdenes pendientes de validar
     */
    async getOrdenesPorValidar(): Promise<OrdenMovilBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.movil}/ordenes/por-validar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener órdenes por validar");
        return await res.json();
    },

    /**
     * Obtiene órdenes pendientes de almacenar
     */
    async getOrdenesPorAlmacenar(): Promise<OrdenMovilBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.movil}/ordenes/por-almacenar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener órdenes por almacenar");
        return await res.json();
    },
};
