import { API_ENDPOINTS } from "./config";
import type {
  NotaIngreso,
  NotaIngresoFrontend,
  CreateNotaIngresoPayload,
  EstadoIngreso,
} from "@/lib/models";

// Mapeo de estados numéricos a strings
const estadoMap: Record<number, EstadoIngreso> = {
  0: "paletizado",
  1: "validado",
  2: "almacenado",
  3: "anulado",
};

/**
 * Mapea una NotaIngreso del backend al formato del frontend
 */
export function mapBackendToFrontend(nota: NotaIngreso): NotaIngresoFrontend {
  return {
    id: String(nota.id),
    documento: nota.nroDocumento,
    tipo: "produccion",
    origen: nota.origen,
    fecha: new Date(nota.fechaIngreso).toLocaleDateString("es-ES"),
    items: nota.detalles.map((d) => ({
      id: String(d.id),
      producto: d.item.codigo,
      descripcion: d.item.descripcion,
      cantidad: Number(d.cantidad),
      cantidadEsperada: Number(d.cantidadEsperada),
      lote: d.lote,
      vencimiento: d.fechaVencimiento,
      codigoBarra: d.item.codigoBarra,
      codigoFabrica: d.item.codigoFabrica,
      ubicacionSugerida: d.ubicacionSugerida,
      ubicacionFinal: d.ubicacionFinal,
    })),
    estado: estadoMap[nota.estado],
    observaciones: nota.observacion,
    usuarioCreacion: nota.usuarioCreacion,
    usuarioValidacion: nota.usuarioValidacion,
    usuarioAlmacenaje: nota.usuarioAlmacenaje,
    validatedAt: nota.validatedAt,
    storedAt: nota.storedAt,
    almacenId: String(nota.almacen.id),
    sourceDocId: nota.sourceDocId,
  };
}

/**
 * Servicio para Notas de Ingreso
 */
export const NotaIngresoService = {
  /**
   * Obtiene todas las notas de ingreso
   */
  async getAll(): Promise<NotaIngreso[]> {
    const res = await fetch(API_ENDPOINTS.notaIngreso, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error al obtener los ingresos");
    }

    return await res.json();
  },

  /**
   * Obtiene una nota de ingreso por ID
   */
  async getById(id: number): Promise<NotaIngreso> {
    const res = await fetch(`${API_ENDPOINTS.notaIngreso}/${id}`);
    if (!res.ok) throw new Error("Ingreso no encontrado");
    return await res.json();
  },

  /**
   * Crea una nueva nota de ingreso
   */
  async create(payload: CreateNotaIngresoPayload): Promise<NotaIngreso> {
    const res = await fetch(API_ENDPOINTS.notaIngreso, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al crear el ingreso");
    }

    return await res.json();
  },

  /**
   * Actualiza el estado de una nota de ingreso
   */
  async updateEstado(id: number, estado: number, usuario?: string): Promise<NotaIngreso> {
    const res = await fetch(`${API_ENDPOINTS.notaIngreso}/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, usuario }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al actualizar el estado");
    }

    return await res.json();
  },
};