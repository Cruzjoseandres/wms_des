import { API_ENDPOINTS } from "./config";
import type { Inventario, CreateInventarioPayload } from "@/lib/models";

/**
 * Servicio para Inventarios
 */
export const InventarioService = {
    /**
     * Obtiene todos los inventarios
     */
    async getAll(): Promise<Inventario[]> {
        const res = await fetch(API_ENDPOINTS.inventario, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Error al obtener los inventarios");
        }

        return await res.json();
    },

    /**
     * Crea un nuevo inventario
     */
    async create(payload: CreateInventarioPayload): Promise<Inventario> {
        const res = await fetch(API_ENDPOINTS.inventario, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al crear el inventario");
        }

        return await res.json();
    },

    /**
     * Actualiza un inventario
     */
    async update(id: number, payload: Partial<Inventario>): Promise<Inventario> {
        const res = await fetch(`${API_ENDPOINTS.inventario}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al actualizar el inventario");
        }

        return await res.json();
    },
};
