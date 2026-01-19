import { API_ENDPOINTS } from "./config";

// Interfaces que reflejan la estructura real del backend
export interface ProductCodesBackend {
  barcode?: string;
  sku?: string;
  factoryCode?: string;
  systemCode?: string;
}

export interface DetalleBackend {
  id: number;
  codItem: string;
  cantidad: number;
  cantidadEsperada: number;
  lote: string | null;
  fechaVencimiento: string | null;
  serie: string | null;
  productCodes: ProductCodesBackend | null;
  ubicacionSugerida: string | null;
  ubicacionFinal: string | null;
}

export interface AlmacenBackend {
  id: number;
  codigo: string;
  descripcion: string;
  sucursalId?: number;
  estado?: number;
}

export interface NotaIngresoBackend {
  id: number;
  nroDocumento: string;
  fechaIngreso: string;
  origen: string;
  usuarioCreacion: string;
  usuarioValidacion: string | null;
  usuarioAlmacenaje: string | null;
  validatedAt: string | null;
  storedAt: string | null;
  estado: number; // 0: Paletizado, 1: Validado, 2: Almacenado, 3: Anulado
  almacen: AlmacenBackend;
  detalles: DetalleBackend[];
  observacion: string | null;
  sourceDocId: number | null;
  createdAt: string;
}

// Mapeo de estados numéricos a strings para el frontend
const estadoMap: Record<number, string> = {
  0: "paletizado",
  1: "validado",
  2: "almacenado",
  3: "anulado",
};

// Función para mapear datos del backend al formato del frontend store
export function mapBackendToFrontend(nota: NotaIngresoBackend) {
  return {
    id: String(nota.id),
    documento: nota.nroDocumento,
    tipo: "produccion" as const,
    origen: nota.origen || "",
    fecha: nota.fechaIngreso ? new Date(nota.fechaIngreso).toLocaleDateString("es-ES") : "",
    items: nota.detalles.map((d) => ({
      id: String(d.id),
      producto: d.codItem,
      descripcion: d.codItem,
      cantidad: Number(d.cantidad),
      cantidadEsperada: Number(d.cantidadEsperada) || Number(d.cantidad),
      lote: d.lote || "",
      vencimiento: d.fechaVencimiento || "",
      productCodes: d.productCodes,
      ubicacionSugerida: d.ubicacionSugerida || "",
      ubicacionFinal: d.ubicacionFinal || "",
    })),
    estado: (estadoMap[nota.estado] || "paletizado") as "paletizado" | "validado" | "almacenado" | "anulado",
    observaciones: nota.observacion || "",
    usuarioCreacion: nota.usuarioCreacion,
    usuarioValidacion: nota.usuarioValidacion || undefined,
    usuarioAlmacenaje: nota.usuarioAlmacenaje || undefined,
    validatedAt: nota.validatedAt,
    storedAt: nota.storedAt,
    almacenId: nota.almacen ? String(nota.almacen.id) : "",
    sourceDocId: nota.sourceDocId,
  };
}

export interface CreateDetallePayload {
  productoId: string;
  cantidad: number;
  cantidadEsperada?: number;
  lote?: string;
  fechaVencimiento?: string;
  serie?: string;
  productCodes?: ProductCodesBackend;
  ubicacionSugerida?: string;
}

export interface CreateIngresoPayload {
  nroDocumento: string;
  origen: string;
  almacenId: number;
  usuario?: string;
  sourceDocId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  detalles: CreateDetallePayload[];
}

// 3. El Servicio con los métodos estáticos
export const NotaIngresoService = {
  /**
   * Obtiene todos los ingresos (Listado)
   */
  async getAll(): Promise<NotaIngresoBackend[]> {
    const res = await fetch(API_ENDPOINTS.notaIngreso, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error al obtener los ingresos");
    }

    return await res.json();
  },

  /**
   * Obtiene un ingreso por ID (Detalle)
   */
  async getById(id: number): Promise<NotaIngresoBackend> {
    const res = await fetch(`${API_ENDPOINTS.notaIngreso}/${id}`);
    if (!res.ok) throw new Error("Ingreso no encontrado");
    return await res.json();
  },

  /**
   * Crea un nuevo ingreso
   */
  async create(payload: CreateIngresoPayload): Promise<NotaIngresoBackend> {
    const res = await fetch(API_ENDPOINTS.notaIngreso, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al crear el ingreso");
    }

    return await res.json();
  },

  /**
   * Actualiza el estado de un ingreso
   * @param id - ID de la nota de ingreso
   * @param estado - Nuevo estado (0: paletizado, 1: validado, 2: almacenado, 3: anulado)
   * @param usuario - Usuario que realiza el cambio (opcional)
   */
  async updateEstado(id: number, estado: number, usuario?: string): Promise<NotaIngresoBackend> {
    const res = await fetch(`${API_ENDPOINTS.notaIngreso}/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado, usuario }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al actualizar el estado");
    }

    return await res.json();
  },
};