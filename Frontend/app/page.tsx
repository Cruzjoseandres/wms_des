"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { StatusCards } from "@/components/dashboard/status-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { PieCharts } from "@/components/dashboard/pie-charts"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { AIPredictionCard } from "@/components/dashboard/ai-prediction-card"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { ChatFAB } from "@/components/chat/chat-fab"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isSuperAdmin, viewMode, impersonatingOrg } = useAdminStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  const isClientView = viewMode === "CLIENT"

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isClientView ? "Resumen Operativo" : "Panel Super Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isClientView
              ? impersonatingOrg
                ? `Vista simulada: ${impersonatingOrg.name}`
                : "Vista en tiempo real de tu almacén y predicciones."
              : "Gestión global de la plataforma SGLA"}
          </p>
        </div>

        {/* KPIs + AI Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 min-h-[180px]">
            <KPICards />
          </div>
          <div className="lg:col-span-1 min-h-[180px]">
            <AIPredictionCard />
          </div>
        </div>

        {/* Inventory Chart + AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InventoryChart />
          </div>
          <div className="lg:col-span-1">
            <AIInsights />
          </div>
        </div>

        {/* Status Cards */}
        <StatusCards />

        {/* Sales Chart (Historical) */}
        <SalesChart />

        {/* Pie Charts */}
        <PieCharts />
      </div>

      <ChatFAB />
    </MainLayout>
  )
}
