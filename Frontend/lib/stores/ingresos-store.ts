import { create } from "zustand"
import { persist } from "zustand/middleware"
import { NotaIngresoService, mapBackendToFrontend, type CreateIngresoPayload } from "@/lib/api/nota_ingreso.service"

export type IngresoStatus = "paletizado" | "validado" | "almacenado" | "anulado"
export type IngresoTipo = "produccion" | "traspaso" | "reingreso" | "anulacion"

// Mapeo de estado string a número para el backend
const estadoToNumber: Record<IngresoStatus, number> = {
  paletizado: 0,
  validado: 1,
  almacenado: 2,
  anulado: 3,
}

export interface ProductCodes {
  barcode?: string;
  sku?: string;
  factoryCode?: string;
  systemCode?: string;
}

export interface IngresoItem {
  id: string
  producto: string
  descripcion?: string
  cantidad: number
  cantidadEsperada?: number
  lote: string
  vencimiento: string
  productCodes?: ProductCodes | null
  ubicacionSugerida?: string
  ubicacionFinal?: string
}

export interface Ingreso {
  id: string
  documento: string
  tipo: IngresoTipo
  origen: string
  fecha: string
  items: IngresoItem[]
  estado: IngresoStatus
  observaciones: string
  usuarioCreacion: string
  usuarioValidacion?: string
  usuarioAlmacenaje?: string
  validatedAt?: string | null
  storedAt?: string | null
  almacenId: string
  sourceDocId?: number | null
}

interface IngresosState {
  ingresos: Ingreso[]
  selectedAlmacenId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  getIngresos: (almacenId?: string) => Ingreso[]
  addIngreso: (ingreso: Ingreso) => void
  setIngresos: (ingresos: Ingreso[]) => void
  fetchIngresos: () => Promise<void>
  updateIngresoStatus: (ingresoId: string, status: IngresoStatus) => void
  simulateValidation: (ingresoId: string, operadorName: string) => void
  simulateAlmacenaje: (ingresoId: string, operadorName: string) => void
  setSelectedAlmacen: (almacenId: string) => void
  getStatsCounts: (almacenId: string) => Record<IngresoStatus, number>

  // Backend-connected actions
  createIngresoBackend: (payload: CreateIngresoPayload) => Promise<void>
  updateEstadoBackend: (ingresoId: string, nuevoEstado: IngresoStatus, usuario?: string) => Promise<void>
}

export const useIngresosStore = create<IngresosState>()(
  persist(
    (set, get) => ({
      ingresos: [],
      selectedAlmacenId: null,
      isLoading: false,
      error: null,

      getIngresos: (almacenId?: string) => {
        const state = get()
        const id = almacenId || state.selectedAlmacenId
        if (!id) return state.ingresos
        return state.ingresos.filter((i) => i.almacenId === id)
      },

      addIngreso: (ingreso) => {
        set((state) => ({
          ingresos: [ingreso, ...state.ingresos],
        }))
      },

      setIngresos: (ingresos) => {
        set({ ingresos })
      },

      fetchIngresos: async () => {
        set({ isLoading: true, error: null })
        try {
          console.log("[Store] Fetching ingresos from backend...")
          const data = await NotaIngresoService.getAll()
          console.log("[Store] Backend response:", data)
          const mapped = data.map(mapBackendToFrontend)
          console.log("[Store] Mapped data:", mapped)
          set({ ingresos: mapped as Ingreso[], isLoading: false })
          console.log("[Store] State updated with", mapped.length, "ingresos")
        } catch (error) {
          console.error("[Store] Error fetching ingresos:", error)
          set({
            error: error instanceof Error ? error.message : "Error al cargar ingresos",
            isLoading: false
          })
        }
      },

      updateIngresoStatus: (ingresoId, status) => {
        set((state) => ({
          ingresos: state.ingresos.map((i) => (i.id === ingresoId ? { ...i, estado: status } : i)),
        }))
      },

      simulateValidation: (ingresoId, operadorName) => {
        set((state) => ({
          ingresos: state.ingresos.map((i) =>
            i.id === ingresoId ? { ...i, estado: "validado" as const, usuarioValidacion: operadorName } : i,
          ),
        }))
      },

      simulateAlmacenaje: (ingresoId, operadorName) => {
        set((state) => ({
          ingresos: state.ingresos.map((i) =>
            i.id === ingresoId ? { ...i, estado: "almacenado" as const, usuarioAlmacenaje: operadorName } : i,
          ),
        }))
      },

      setSelectedAlmacen: (almacenId) => {
        set({ selectedAlmacenId: almacenId })
      },

      getStatsCounts: (almacenId) => {
        const state = get()
        const filtered = state.ingresos.filter((i) => i.almacenId === almacenId)
        return {
          paletizado: filtered.filter((i) => i.estado === "paletizado").length,
          validado: filtered.filter((i) => i.estado === "validado").length,
          almacenado: filtered.filter((i) => i.estado === "almacenado").length,
          anulado: filtered.filter((i) => i.estado === "anulado").length,
        }
      },

      createIngresoBackend: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          await NotaIngresoService.create(payload)
          // Recargar la lista desde el backend
          const data = await NotaIngresoService.getAll()
          const mapped = data.map(mapBackendToFrontend)
          set({ ingresos: mapped as Ingreso[], isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al crear el ingreso",
            isLoading: false,
          })
          throw error // Re-lanzar para que el componente pueda manejarlo
        }
      },

      updateEstadoBackend: async (ingresoId, nuevoEstado, usuario) => {
        set({ isLoading: true, error: null })
        try {
          await NotaIngresoService.updateEstado(
            Number(ingresoId),
            estadoToNumber[nuevoEstado],
            usuario
          )
          // Recargar la lista desde el backend
          const data = await NotaIngresoService.getAll()
          const mapped = data.map(mapBackendToFrontend)
          set({ ingresos: mapped as Ingreso[], isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al actualizar el estado",
            isLoading: false,
          })
          throw error // Re-lanzar para que el componente pueda manejarlo
        }
      },
    }),
    {
      name: "ingresos-storage",
    }
  )
)
