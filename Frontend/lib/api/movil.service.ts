import { API_ENDPOINTS } from "./config";
import type {
    OrdenMovil,
    ValidarResponse,
    AlmacenarResponse,
    IniciarValidacionResponse,
    ValidarDetalleResponse,
    IniciarAlmacenajeResponse,
    AlmacenarDetalleResponse,
    MetricasOperario,
} from "@/lib/models";

/**
 * Servicio para operaciones móviles (PDA/Scanner)
 */
export const MovilService = {
    // ========================================
    // NUEVOS ENDPOINTS - Validación Individual
    // ========================================

    /**
     * Inicia el proceso de validación de un detalle
     * Captura timestamp para métricas de productividad
     */
    async iniciarValidacion(detalleId: number, usuario: string): Promise<IniciarValidacionResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/iniciar-validacion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ detalleId, usuario }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al iniciar validación");
        }

        return await res.json();
    },

    /**
     * Valida un detalle específico con cantidad recibida
     * Cambia estado: PENDIENTE → VALIDADO
     */
    async validarDetalle(
        detalleId: number,
        cantidadRecibida: number,
        usuario: string
    ): Promise<ValidarDetalleResponse> {
        // Asegurar tipos correctos para el backend
        const payload = {
            detalleId: Number(detalleId),
            cantidadRecibida: Number(cantidadRecibida),
            usuario: String(usuario)
        };
        console.log("[MovilService] validarDetalle payload:", payload);

        const res = await fetch(`${API_ENDPOINTS.movil}/validar-detalle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error al validar detalle";
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || "Error desconocido del servidor";
                // Chequeo específico para error de validación de NestJS (whitelist)
                if (Array.isArray(errorData.message) && errorData.message[0]?.includes("should not exist")) {
                    errorMessage = "Error Backend: El DTO no acepta estos campos. Faltan decoradores @IsNumber/@IsString en el Backend.";
                }
            } catch (e) {
                errorMessage = res.statusText;
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    },

    /**
     * Inicia el proceso de almacenaje de un detalle
     * Captura timestamp para métricas de productividad
     */
    async iniciarAlmacenaje(detalleId: number, usuario: string): Promise<IniciarAlmacenajeResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/iniciar-almacenaje`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ detalleId, usuario }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al iniciar almacenaje");
        }

        return await res.json();
    },

    /**
     * Almacena un detalle específico en una ubicación
     * Cambia estado: VALIDADO → ALMACENADO
     */
    async almacenarDetalle(
        detalleId: number,
        ubicacion: string,
        usuario: string
    ): Promise<AlmacenarDetalleResponse> {
        // Asegurar tipos correctos
        const payload = {
            detalleId: Number(detalleId),
            ubicacion: String(ubicacion),
            usuario: String(usuario)
        };
        console.log("[MovilService] almacenarDetalle payload:", payload);

        const res = await fetch(`${API_ENDPOINTS.movil}/almacenar-detalle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al almacenar detalle");
        }

        return await res.json();
    },

    /**
     * Obtiene métricas de productividad de un operario
     */
    async getMetricasOperario(usuarioId: string): Promise<MetricasOperario> {
        const res = await fetch(`${API_ENDPOINTS.movil}/metricas-operario/${usuarioId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener métricas");
        return await res.json();
    },

    // ========================================
    // ENDPOINTS EXISTENTES (Actualizados)
    // ========================================

    /**
     * Legacy: Valida un item por código de barra
     * @deprecated Usar validarDetalle para validación individual
     */
    async validar(codigoBarra: string, usuarioId?: string): Promise<ValidarResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/validar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigoBarra,
                usuarioId: usuarioId || "MOBILE_USER",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al validar");
        }

        return await res.json();
    },

    /**
     * Legacy: Almacena un item en una ubicación
     * @deprecated Usar almacenarDetalle para almacenaje individual
     */
    async almacenar(codigoBarra: string, ubicacionDestino: string, usuarioId?: string): Promise<AlmacenarResponse> {
        const res = await fetch(`${API_ENDPOINTS.movil}/almacenar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigoBarra,
                ubicacionDestino,
                usuarioId: usuarioId || "MOBILE_USER",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al almacenar");
        }

        return await res.json();
    },

    /**
     * Obtiene órdenes con detalles pendientes de validar
     * Ahora incluye estado individual de cada detalle y resumen
     */
    async getOrdenesPorValidar(): Promise<OrdenMovil[]> {
        const res = await fetch(`${API_ENDPOINTS.movil}/ordenes/por-validar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener órdenes por validar");
        return await res.json();
    },

    /**
     * Obtiene órdenes con detalles validados pendientes de almacenar
     * Solo incluye detalles en estado VALIDADO
     */
    async getOrdenesPorAlmacenar(): Promise<OrdenMovil[]> {
        const res = await fetch(`${API_ENDPOINTS.movil}/ordenes/por-almacenar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al obtener órdenes por almacenar");
        return await res.json();
    },

    /**
     * Confirma ingreso con cantidades reales recibidas
     * @deprecated Usar validarDetalle + almacenarDetalle por cada producto
     */
    async confirmarIngreso(
        notaIngresoId: number,
        detalles: { detalleId: number; cantidadRecibida: number; ubicacion?: string }[],
        observacion?: string,
        usuarioId?: string
    ): Promise<{ exito: boolean; mensaje: string }> {
        const res = await fetch(`${API_ENDPOINTS.movil}/confirmar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                notaIngresoId,
                detalles,
                observacion,
                usuarioId: usuarioId || "MOBILE_USER",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al confirmar ingreso");
        }

        return await res.json();
    },
};
