import { API_ENDPOINTS } from "./config";
import type { Item } from "@/lib/models";

/**
 * Servicio para Items del catálogo
 */
export const ItemService = {
    /**
     * Obtiene todos los items del catálogo
     */
    async getAll(): Promise<Item[]> {
        const res = await fetch(API_ENDPOINTS.item, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Error al obtener los items");
        }

        return await res.json();
    },

    /**
     * Obtiene un item por ID
     */
    async getById(id: number): Promise<Item> {
        const res = await fetch(`${API_ENDPOINTS.item}/${id}`);
        if (!res.ok) throw new Error("Item no encontrado");
        return await res.json();
    },

    /**
     * Busca items por código
     */
    async searchByCode(codigo: string): Promise<Item[]> {
        const res = await fetch(`${API_ENDPOINTS.item}/search?q=${encodeURIComponent(codigo)}`);
        if (!res.ok) throw new Error("Error al buscar items");
        return await res.json();
    },

    /**
     * Obtiene un item por código de barras
     */
    async getByCodigoBarra(codigoBarra: string): Promise<Item | null> {
        const res = await fetch(`${API_ENDPOINTS.item}/barcode/${encodeURIComponent(codigoBarra)}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Error al buscar por código de barras");
        }
        return await res.json();
    },

    /**
     * Obtiene un item por código
     */
    async getByCodigo(codigo: string): Promise<Item | null> {
        const res = await fetch(`${API_ENDPOINTS.item}/codigo/${encodeURIComponent(codigo)}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Error al buscar por código");
        }
        return await res.json();
    },
};
