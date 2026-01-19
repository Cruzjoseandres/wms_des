"use client"

import React, { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { SuperAdminBar } from "@/components/layout/super-admin-bar"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useUIStore } from "@/lib/stores/ui-store" // Importado para manejar densidad
import { cn } from "@/lib/utils"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, viewMode, sidebarCollapsed } = useAdminStore()
  const { density } = useUIStore() // Obtener densidad del store

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hasAdminBar = isSuperAdmin && viewMode === "SUPER_ADMIN"

  return (
    <div className="flex min-h-screen bg-background text-foreground ui-comfortable">
      {/* Super Admin warning bar - now part of document flow */}
      <SuperAdminBar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out",
          // Margin left based on sidebar state (desktop only)
          mounted && sidebarCollapsed ? "lg:ml-20" : "lg:ml-72",
          // No margin on mobile (sidebar is drawer)
          "ml-0",
        )}
      >
        <Header />
        <main
          className={cn(
            "flex-1 overflow-x-hidden",
            density === "compact" ? "p-2 sm:p-3" : density === "spacious" ? "p-4 sm:p-8" : "p-3 sm:p-4 lg:p-6",
          )}
        >
          {children}
        </main>
      </div>

      <OfflineIndicator />
    </div>
  )
}
