import { API_ENDPOINTS } from "./config";
import type {
    OrdenSalida,
    CreateOrdenSalidaPayload,
    ImportarERPPayload,
} from "@/lib/models";

/**
 * Servicio para Órdenes de Salida
 */
export const SalidaService = {
    /**
     * Obtiene todas las órdenes de salida
     * @param estado - Filtro opcional por estado (0=Pendiente, 1=EnPicking, etc)
     */
    async getAll(estado?: number): Promise<OrdenSalida[]> {
        const params = estado !== undefined ? `?estado=${estado}` : "";
        const res = await fetch(`${API_ENDPOINTS.salida}/ordenes${params}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Error al obtener las órdenes de salida");
        }

        return await res.json();
    },

    /**
     * Obtiene una orden de salida por ID
     */
    async getById(id: number): Promise<OrdenSalida> {
        const res = await fetch(`${API_ENDPOINTS.salida}/ordenes/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            throw new Error("Orden de salida no encontrada");
        }

        return await res.json();
    },

    /**
     * Crea una nueva orden de salida manualmente
     */
    async create(payload: CreateOrdenSalidaPayload): Promise<OrdenSalida> {
        const res = await fetch(`${API_ENDPOINTS.salida}/ordenes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al crear la orden de salida";
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = res.statusText;
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    },

    /**
     * Importa una orden desde sistema ERP externo
     */
    async importar(payload: ImportarERPPayload): Promise<OrdenSalida> {
        const res = await fetch(`${API_ENDPOINTS.salida}/importar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al importar orden desde ERP";
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = res.statusText;
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    },
};
