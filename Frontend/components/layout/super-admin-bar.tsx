"use client"

import { AlertTriangle, X } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Button } from "@/components/ui/button"

export function SuperAdminBar() {
  const { isSuperAdmin, viewMode, setViewMode } = useAdminStore()

  if (!isSuperAdmin || viewMode !== "SUPER_ADMIN") return null

  return (
    <div className="relative z-[100] h-11 bg-red-600 text-white flex items-center justify-center px-4 shadow-lg shrink-0">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 animate-pulse" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide">MODO SUPER ADMIN - ACCESO TOTAL</span>
        <AlertTriangle className="w-4 h-4 animate-pulse" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode("CLIENT")}
        className="absolute right-2 h-7 w-7 text-white/80 hover:text-white hover:bg-red-700"
      >
        <X className="w-4 h-4" />
        <span className="sr-only">Cerrar modo admin</span>
      </Button>
    </div>
  )
}
