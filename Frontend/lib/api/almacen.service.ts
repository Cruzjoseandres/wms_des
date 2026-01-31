import { API_ENDPOINTS } from "./config";
import type { Almacen } from "@/lib/models";

/**
 * Servicio para Almacenes
 */
export const AlmacenService = {
    /**
     * Obtiene todos los almacenes
     */
    async getAll(): Promise<Almacen[]> {
        const res = await fetch(API_ENDPOINTS.almacen, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Error al obtener los almacenes");
        }

        return await res.json();
    },

    /**
     * Obtiene un almacén por ID
     */
    async getById(id: number): Promise<Almacen> {
        const res = await fetch(`${API_ENDPOINTS.almacen}/${id}`);
        if (!res.ok) throw new Error("Almacén no encontrado");
        return await res.json();
    },
};
