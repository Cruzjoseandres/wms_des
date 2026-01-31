import { API_ENDPOINTS } from "./config";
import type {
    OrdenMovil,
    ValidarResponse,
    AlmacenarResponse,
} from "@/lib/models";

/**
 * Servicio para operaciones móviles (PDA/Scanner)
 */
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
    async getOrdenesPorValidar(): Promise<OrdenMovil[]> {
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
    async getOrdenesPorAlmacenar(): Promise<OrdenMovil[]> {
        const res = await fetch(`${API_ENDPOINTS.movil}/ordenes/por-almacenar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener órdenes por almacenar");
        return await res.json();
    },
};
