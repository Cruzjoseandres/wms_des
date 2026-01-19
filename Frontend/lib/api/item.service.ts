import { API_ENDPOINTS } from "./config";

export interface ItemBackend {
    id: number;
    codigo: string;
    descripcion: string;
    unidadMedida?: string;
    precio?: number;
    codSubcategoria?: string;
    estado: number;
    stock?: number;
}

export const ItemService = {
    /**
     * Obtiene todos los items del catálogo
     */
    async getAll(): Promise<ItemBackend[]> {
        const res = await fetch(API_ENDPOINTS.item, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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
    async getById(id: number): Promise<ItemBackend> {
        const res = await fetch(`${API_ENDPOINTS.item}/${id}`);
        if (!res.ok) throw new Error("Item no encontrado");
        return await res.json();
    },

    /**
     * Busca items por código
     */
    async searchByCode(codigo: string): Promise<ItemBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.item}/search?q=${encodeURIComponent(codigo)}`);
        if (!res.ok) throw new Error("Error al buscar items");
        return await res.json();
    },
};
