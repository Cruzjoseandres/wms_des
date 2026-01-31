import { create } from "zustand";
import { NotaIngresoService, mapBackendToFrontend } from "@/lib/api/nota_ingreso.service";
import type {
  NotaIngresoFrontend,
  DetalleIngresoFrontend,
  EstadoIngreso,
  TipoIngreso,
  CreateNotaIngresoPayload,
} from "@/lib/models";

// Re-exportar tipos para uso externo
export type { NotaIngresoFrontend as Ingreso, DetalleIngresoFrontend as IngresoItem };
export type { EstadoIngreso as IngresoStatus, TipoIngreso as IngresoTipo };

// Mapeo de estado string a número para el backend
const estadoToNumber: Record<EstadoIngreso, number> = {
  paletizado: 0,
  validado: 1,
  almacenado: 2,
  anulado: 3,
};

interface IngresosState {
  ingresos: NotaIngresoFrontend[];
  selectedAlmacenId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getIngresos: (almacenId?: string) => NotaIngresoFrontend[];
  addIngreso: (ingreso: NotaIngresoFrontend) => void;
  setIngresos: (ingresos: NotaIngresoFrontend[]) => void;
  fetchIngresos: () => Promise<void>;
  updateIngresoStatus: (ingresoId: string, status: EstadoIngreso) => void;
  simulateValidation: (ingresoId: string, operadorName: string) => void;
  simulateAlmacenaje: (ingresoId: string, operadorName: string) => void;
  setSelectedAlmacen: (almacenId: string) => void;
  getStatsCounts: (almacenId: string) => Record<EstadoIngreso, number>;

  // Backend-connected actions
  createIngresoBackend: (payload: CreateNotaIngresoPayload) => Promise<void>;
  updateEstadoBackend: (ingresoId: string, nuevoEstado: EstadoIngreso, usuario?: string) => Promise<void>;
}

export const useIngresosStore = create<IngresosState>()(
  (set, get) => ({
    ingresos: [],
    selectedAlmacenId: null,
    isLoading: false,
    error: null,

    getIngresos: (almacenId?: string) => {
      const state = get();
      const id = almacenId || state.selectedAlmacenId;
      if (!id) return state.ingresos;
      return state.ingresos.filter((i) => i.almacenId === id);
    },

    addIngreso: (ingreso) => {
      set((state) => ({
        ingresos: [ingreso, ...state.ingresos],
      }));
    },

    setIngresos: (ingresos) => {
      set({ ingresos });
    },

    fetchIngresos: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log("[Store] Fetching ingresos from backend...");
        const data = await NotaIngresoService.getAll();
        console.log("[Store] Backend response:", data);
        const mapped = data.map(mapBackendToFrontend);
        console.log("[Store] Mapped data:", mapped);
        set({ ingresos: mapped, isLoading: false });
        console.log("[Store] State updated with", mapped.length, "ingresos");
      } catch (error) {
        console.error("[Store] Error fetching ingresos:", error);
        set({
          error: error instanceof Error ? error.message : "Error al cargar ingresos",
          isLoading: false,
        });
      }
    },

    updateIngresoStatus: (ingresoId, status) => {
      set((state) => ({
        ingresos: state.ingresos.map((i) => (i.id === ingresoId ? { ...i, estado: status } : i)),
      }));
    },

    simulateValidation: (ingresoId, operadorName) => {
      set((state) => ({
        ingresos: state.ingresos.map((i) =>
          i.id === ingresoId ? { ...i, estado: "validado" as const, usuarioValidacion: operadorName } : i
        ),
      }));
    },

    simulateAlmacenaje: (ingresoId, operadorName) => {
      set((state) => ({
        ingresos: state.ingresos.map((i) =>
          i.id === ingresoId ? { ...i, estado: "almacenado" as const, usuarioAlmacenaje: operadorName } : i
        ),
      }));
    },

    setSelectedAlmacen: (almacenId) => {
      set({ selectedAlmacenId: almacenId });
    },

    getStatsCounts: (almacenId) => {
      const state = get();
      const filtered = state.ingresos.filter((i) => i.almacenId === almacenId);
      return {
        paletizado: filtered.filter((i) => i.estado === "paletizado").length,
        validado: filtered.filter((i) => i.estado === "validado").length,
        almacenado: filtered.filter((i) => i.estado === "almacenado").length,
        anulado: filtered.filter((i) => i.estado === "anulado").length,
      };
    },

    createIngresoBackend: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        await NotaIngresoService.create(payload);
        const data = await NotaIngresoService.getAll();
        const mapped = data.map(mapBackendToFrontend);
        set({ ingresos: mapped, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Error al crear el ingreso",
          isLoading: false,
        });
        throw error;
      }
    },

    updateEstadoBackend: async (ingresoId, nuevoEstado, usuario) => {
      set({ isLoading: true, error: null });
      try {
        await NotaIngresoService.updateEstado(
          Number(ingresoId),
          estadoToNumber[nuevoEstado],
          usuario
        );
        const data = await NotaIngresoService.getAll();
        const mapped = data.map(mapBackendToFrontend);
        set({ ingresos: mapped, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Error al actualizar el estado",
          isLoading: false,
        });
        throw error;
      }
    },
  })
);
