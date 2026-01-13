import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UIDensity = "compact" | "comfortable" | "spacious"

interface UIState {
  // Densidad de UI
  density: UIDensity
  setDensity: (density: UIDensity) => void

  // Audio feedback
  audioEnabled: boolean
  setAudioEnabled: (enabled: boolean) => void

  // Animaciones
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void

  // Modo offline
  isOffline: boolean
  setIsOffline: (offline: boolean) => void

  // Hotkeys habilitados
  hotkeysEnabled: boolean
  setHotkeysEnabled: (enabled: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      density: "comfortable",
      setDensity: (density) => set({ density }),

      audioEnabled: true,
      setAudioEnabled: (audioEnabled) => set({ audioEnabled }),

      animationsEnabled: true,
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),

      isOffline: false,
      setIsOffline: (isOffline) => set({ isOffline }),

      hotkeysEnabled: true,
      setHotkeysEnabled: (hotkeysEnabled) => set({ hotkeysEnabled }),
    }),
    {
      name: "sgla-ui-settings",
    },
  ),
)

// Clases de Tailwind según densidad
export const densityClasses = {
  compact: {
    padding: "p-1",
    paddingX: "px-2",
    paddingY: "py-1",
    gap: "gap-1",
    text: "text-xs",
    rowHeight: "h-8",
    buttonSize: "h-7 px-2 text-xs",
    iconSize: "w-3 h-3",
  },
  comfortable: {
    padding: "p-3",
    paddingX: "px-4",
    paddingY: "py-2",
    gap: "gap-3",
    text: "text-sm",
    rowHeight: "h-10",
    buttonSize: "h-9 px-4 text-sm",
    iconSize: "w-4 h-4",
  },
  spacious: {
    padding: "p-5",
    paddingX: "px-6",
    paddingY: "py-4",
    gap: "gap-4",
    text: "text-base",
    rowHeight: "h-14",
    buttonSize: "h-12 px-6 text-base",
    iconSize: "w-5 h-5",
  },
} as const
