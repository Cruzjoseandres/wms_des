import { API_ENDPOINTS } from "./config";
import type {
    OrdenSalida,
    IniciarPickingOrdenResponse,
    PickearDetalleResponse,
    CompletarPickingResponse,
    MetricasPicker,
} from "@/lib/models";

/**
 * Servicio para operaciones de Picking
 */
export const PickingService = {
    /**
     * Obtiene órdenes pendientes para picking
     */
    async getOrdenesPendientes(): Promise<OrdenSalida[]> {
        const res = await fetch(`${API_ENDPOINTS.picking}/ordenes/pendientes`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Error al obtener órdenes para picking");
        }

        return await res.json();
    },

    /**
     * Inicia el picking de una orden
     */
    async iniciarOrden(ordenId: number, usuario: string): Promise<IniciarPickingOrdenResponse> {
        const payload = {
            ordenId: Number(ordenId),
            usuario: String(usuario),
        };
        console.log("[PickingService] iniciarOrden payload:", payload);

        const res = await fetch(`${API_ENDPOINTS.picking}/iniciar-orden`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al iniciar picking";
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
     * Captura tiempo de inicio para un item
     */
    async iniciarDetalle(detalleId: number, usuario: string): Promise<{ exito: boolean; mensaje: string }> {
        const payload = {
            detalleId: Number(detalleId),
            usuario: String(usuario),
        };

        const res = await fetch(`${API_ENDPOINTS.picking}/iniciar-detalle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al iniciar detalle de picking";
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
     * Confirma recogida de un producto
     */
    async pickearDetalle(
        detalleId: number,
        cantidadPickeada: number,
        usuario: string
    ): Promise<PickearDetalleResponse> {
        const payload = {
            detalleId: Number(detalleId),
            cantidadPickeada: Number(cantidadPickeada),
            usuario: String(usuario),
        };
        console.log("[PickingService] pickearDetalle payload:", payload);

        const res = await fetch(`${API_ENDPOINTS.picking}/pickear-detalle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al pickear detalle";
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
     * Finaliza el picking de una orden
     */
    async completarOrden(ordenId: number, usuario: string): Promise<CompletarPickingResponse> {
        const payload = {
            ordenId: Number(ordenId),
            usuario: String(usuario),
        };
        console.log("[PickingService] completarOrden payload:", payload);

        const res = await fetch(`${API_ENDPOINTS.picking}/completar-orden`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al completar picking";
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
     * Obtiene métricas del picker
     */
    async getMetricas(usuarioId: string): Promise<MetricasPicker> {
        const res = await fetch(`${API_ENDPOINTS.picking}/metricas/${encodeURIComponent(usuarioId)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            throw new Error("Error al obtener métricas del picker");
        }

        return await res.json();
    },
};
