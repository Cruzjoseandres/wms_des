const API_URL = "http://localhost:3001/almacen";

export interface AlmacenBackend {
    id: number;
    codigo: string;
    descripcion: string;
    sucursalId?: number;
    estado?: number;
}

export const AlmacenService = {
    /**
     * Obtiene todos los almacenes
     */
    async getAll(): Promise<AlmacenBackend[]> {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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
    async getById(id: number): Promise<AlmacenBackend> {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Almacén no encontrado");
        return await res.json();
    },
};
