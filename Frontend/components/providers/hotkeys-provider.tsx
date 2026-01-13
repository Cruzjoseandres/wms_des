"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useHotkeys } from "@/lib/hooks/use-hotkeys"
import { useUIStore } from "@/lib/stores/ui-store"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HotkeysContextType {
  showHelp: boolean
  setShowHelp: (show: boolean) => void
}

const HotkeysContext = createContext<HotkeysContextType | null>(null)

export function useHotkeysContext() {
  const ctx = useContext(HotkeysContext)
  if (!ctx) throw new Error("useHotkeysContext must be used within HotkeysProvider")
  return ctx
}

const GLOBAL_HOTKEYS = [
  { key: "F1", description: "Mostrar ayuda de atajos" },
  { key: "F2", description: "Guardar formulario activo" },
  { key: "Escape", description: "Cancelar/Cerrar modal" },
  { key: "Ctrl+K", description: "Abrir búsqueda rápida" },
  { key: "Ctrl+S", description: "Guardar cambios" },
  { key: "Ctrl+N", description: "Nuevo registro" },
  { key: "Ctrl+E", description: "Editar seleccionado" },
  { key: "Ctrl+D", description: "Duplicar seleccionado" },
  { key: "Alt+1", description: "Ir a Dashboard" },
  { key: "Alt+2", description: "Ir a Ingresos" },
  { key: "Alt+3", description: "Ir a Salidas" },
  { key: "Alt+4", description: "Ir a Inventario" },
]

export function HotkeysProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { hotkeysEnabled } = useUIStore()
  const [showHelp, setShowHelp] = useState(false)

  // Hotkeys globales solo si están habilitados
  useHotkeys(
    hotkeysEnabled
      ? [
          // F1 - Mostrar ayuda
          {
            key: "F1",
            callback: () => setShowHelp(true),
            preventDefault: true,
          },
          // Escape - Cerrar modales/ayuda
          {
            key: "Escape",
            callback: () => setShowHelp(false),
            preventDefault: false,
          },
          // Alt+1 - Dashboard
          {
            key: "1",
            alt: true,
            callback: () => router.push("/"),
          },
          // Alt+2 - Ingresos
          {
            key: "2",
            alt: true,
            callback: () => router.push("/ingresos/registro"),
          },
          // Alt+3 - Salidas
          {
            key: "3",
            alt: true,
            callback: () => router.push("/salidas/pedidos"),
          },
          // Alt+4 - Inventario
          {
            key: "4",
            alt: true,
            callback: () => router.push("/inventario/gestion"),
          },
        ]
      : [],
  )

  return (
    <HotkeysContext.Provider value={{ showHelp, setShowHelp }}>
      {children}

      {/* Modal de ayuda de atajos */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atajos de Teclado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {GLOBAL_HOTKEYS.map((hotkey) => (
              <div key={hotkey.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">{hotkey.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">
                  {hotkey.key}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Presiona <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">F1</kbd> en cualquier momento para ver
            esta ayuda
          </p>
        </DialogContent>
      </Dialog>
    </HotkeysContext.Provider>
  )
}
