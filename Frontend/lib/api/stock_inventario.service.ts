import { API_ENDPOINTS } from "./config";

/**
 * Servicio para consultar stock de inventario por ubicación
 * Conecta con /stock-inventario
 */

export interface DetalleIngresoRef {
    id: number;
    codItem: string;
    lote: string | null;
    fechaVencimiento: string | null;
    cantidad: number;
}

export interface StockInventarioBackend {
    id: number;
    sku: string;
    ubicacion: string;
    cantidad: number;
    estado: string; // DISPONIBLE, BLOQUEADO
    ultimoMovimiento: string;
    detalleIngreso: DetalleIngresoRef | null;
}

export const StockInventarioService = {
    /**
     * Obtiene todo el stock
     */
    async getAll(): Promise<StockInventarioBackend[]> {
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
    async getDisponible(): Promise<StockInventarioBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/disponible`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener stock disponible");
        return await res.json();
    },

    /**
     * Obtiene stock por SKU
     */
    async getBySku(sku: string): Promise<StockInventarioBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/por-sku/${encodeURIComponent(sku)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener stock por SKU");
        return await res.json();
    },

    /**
     * Obtiene stock por ubicación
     */
    async getByUbicacion(ubicacion: string): Promise<StockInventarioBackend[]> {
        const res = await fetch(`${API_ENDPOINTS.stockInventario}/por-ubicacion/${encodeURIComponent(ubicacion)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener stock por ubicación");
        return await res.json();
    },
};
