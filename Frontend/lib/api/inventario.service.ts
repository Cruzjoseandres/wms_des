import { API_ENDPOINTS } from "./config";

export interface InventarioBackend {
    id: number;
    codigo: string;
    tipo: string;
    estado: string;
    fechaApertura: string;
    fechaCierre: string | null;
    bodega: string | null;
    itemsContados: number;
    itemsTotales: number;
    diferencias: number;
    responsable: string;
    almacen: {
        id: number;
        codigo: string;
        descripcion: string;
    };
}

export interface CreateInventarioPayload {
    codigo: string;
    tipo: string;
    fechaApertura: string;
    almacenId: number;
    bodega?: string;
    responsable: string;
    itemsTotales: number;
}

export const InventarioService = {
    /**
     * Obtiene todos los inventarios
     */
    async getAll(): Promise<InventarioBackend[]> {
        const res = await fetch(API_ENDPOINTS.inventario, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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
    async create(payload: CreateInventarioPayload): Promise<InventarioBackend> {
        const res = await fetch(API_ENDPOINTS.inventario, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al crear el inventario");
        }

        return await res.json();
    },

    /**
     * Actualiza un inventario (para cambio de estado o cierre)
     */
    async update(id: number, payload: Partial<InventarioBackend>): Promise<InventarioBackend> {
        const res = await fetch(`${API_ENDPOINTS.inventario}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al actualizar el inventario");
        }

        return await res.json();
    },
};
