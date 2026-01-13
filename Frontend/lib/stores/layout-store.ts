import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ShapeType = "rack" | "zone" | "obstacle" | "access-point"

export interface LayoutShape {
  // Visual data (for canvas rendering)
  id: string
  type: ShapeType
  x: number // Canvas pixels
  y: number // Canvas pixels
  width: number // Canvas pixels
  height: number // Canvas pixels
  rotation: number
  color: string

  // Logical data (for WMS operations)
  name: string
  realWorldX?: number // Meters
  realWorldY?: number // Meters
  realWorldWidth?: number // Meters
  realWorldHeight?: number // Meters

  // Rack-specific
  levels?: number
  positionsPerLevel?: number
  capacity?: number // Total capacity in pallets/units

  // Zone-specific
  zoneType?: "reception" | "shipping" | "storage" | "buffer"

  // Obstacle-specific
  obstacleType?: "column" | "office" | "wall"

  // Access point-specific
  accessType?: "loading" | "unloading" | "emergency"
}

interface LayoutState {
  shapes: LayoutShape[]
  selectedShapeId: string | null
  zoom: number
  stagePosition: { x: number; y: number }
  gridSize: number
  snapToGrid: boolean
  pixelsPerMeter: number // Scale reference: 50px = 1 meter for real-world calculations

  // Actions
  addShape: (shape: LayoutShape) => void
  updateShape: (id: string, updates: Partial<LayoutShape>) => void
  deleteShape: (id: string) => void
  selectShape: (id: string | null) => void
  setZoom: (zoom: number) => void
  setStagePosition: (position: { x: number; y: number }) => void
  setSnapToGrid: (snap: boolean) => void
  clearLayout: () => void
  loadLayout: (shapes: LayoutShape[]) => void

  pixelsToMeters: (pixels: number) => number
  metersToPixels: (meters: number) => number
  snapToGridCoordinate: (value: number, gridSize: number) => number
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      shapes: [],
      selectedShapeId: null,
      zoom: 1,
      stagePosition: { x: 400, y: 300 },
      gridSize: 20, // Grid size of 20px = 0.4m (good for visual alignment)
      snapToGrid: true,
      pixelsPerMeter: 50, // Scale: 50 pixels = 1 meter

      addShape: (shape) =>
        set((state) => {
          const realWorldWidth = state.pixelsToMeters(shape.width)
          const realWorldHeight = state.pixelsToMeters(shape.height)
          const realWorldX = state.pixelsToMeters(shape.x)
          const realWorldY = state.pixelsToMeters(shape.y)

          return {
            shapes: [
              ...state.shapes,
              {
                ...shape,
                realWorldWidth,
                realWorldHeight,
                realWorldX,
                realWorldY,
              },
            ],
            selectedShapeId: shape.id,
          }
        }),

      updateShape: (id, updates) =>
        set((state) => {
          const updatedShape = state.shapes.find((s) => s.id === id)
          if (!updatedShape) return state

          const realWorldUpdates: Partial<LayoutShape> = { ...updates }

          if (updates.x !== undefined || updates.y !== undefined) {
            realWorldUpdates.realWorldX = state.pixelsToMeters(updates.x ?? updatedShape.x)
            realWorldUpdates.realWorldY = state.pixelsToMeters(updates.y ?? updatedShape.y)
          }

          if (updates.width !== undefined) {
            realWorldUpdates.realWorldWidth = state.pixelsToMeters(updates.width)
          }

          if (updates.height !== undefined) {
            realWorldUpdates.realWorldHeight = state.pixelsToMeters(updates.height)
          }

          return {
            shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...realWorldUpdates } : s)),
          }
        }),

      deleteShape: (id) =>
        set((state) => ({
          shapes: state.shapes.filter((s) => s.id !== id),
          selectedShapeId: state.selectedShapeId === id ? null : state.selectedShapeId,
        })),

      selectShape: (id) => set({ selectedShapeId: id }),

      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),

      setStagePosition: (position) => set({ stagePosition: position }),

      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      clearLayout: () => set({ shapes: [], selectedShapeId: null }),

      loadLayout: (shapes) => set({ shapes, selectedShapeId: null }),

      pixelsToMeters: (pixels: number) => {
        const state = get()
        return Number((pixels / state.pixelsPerMeter).toFixed(2))
      },

      metersToPixels: (meters: number) => {
        const state = get()
        return meters * state.pixelsPerMeter
      },

      snapToGridCoordinate: (value: number, gridSize: number) => {
        return Math.round(value / gridSize) * gridSize
      },
    }),
    {
      name: "warehouse-layout-storage",
    },
  ),
)
