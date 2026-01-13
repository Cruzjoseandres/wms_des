"use client"

import { Shield, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/lib/stores/admin-store"
import { cn } from "@/lib/utils"

export function ModeSwitcher() {
  const { isSuperAdmin, viewMode, toggleViewMode } = useAdminStore()

  // Only show for super admins
  if (!isSuperAdmin) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleViewMode}
      className={cn(
        "h-8 gap-2 text-xs font-medium transition-all duration-300",
        viewMode === "SUPER_ADMIN"
          ? "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          : "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20",
      )}
    >
      {viewMode === "SUPER_ADMIN" ? (
        <>
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SUPER ADMIN</span>
        </>
      ) : (
        <>
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CLIENTE</span>
        </>
      )}
    </Button>
  )
}
