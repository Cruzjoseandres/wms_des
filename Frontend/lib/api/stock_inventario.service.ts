import { API_ENDPOINTS } from "./config";
import type { StockInventario } from "@/lib/models";

/**
 * Servicio para Stock de Inventario
 */
export const StockInventarioService = {
    /**
     * Obtiene todo el stock
     */
    async getAll(): Promise<StockInventario[]> {
        const res = await fetch(API_ENDPOINTS.stockInventario, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener stock");
        return await res.json();
    },

    /**
     * Obtiene stock disponible (no bloqueado)
     */
    async getDisponible(): Promise<StockInventario[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/disponible`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener stock disponible");
        return await res.json();
    },

    /**
     * Obtiene stock por Item ID
     */
    async getByItemId(itemId: number): Promise<StockInventario[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/por-item/${itemId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener stock por Item");
        return await res.json();
    },

    /**
     * Obtiene stock por ubicación
     */
    async getByUbicacion(ubicacion: string): Promise<StockInventario[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/por-ubicacion/${encodeURIComponent(ubicacion)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener stock por ubicación");
        return await res.json();
    },
};
