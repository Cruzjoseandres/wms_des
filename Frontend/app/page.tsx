"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { AIPredictionCard } from "@/components/dashboard/ai-prediction-card"
import { ChatFAB } from "@/components/chat/chat-fab"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Loader2, Warehouse, PackagePlus, PackageX, ClipboardList, FileText, ScanBarcode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  const isClientView = viewMode === "CLIENT"

  const features = [
    {
      title: "Almacenes",
      description: "Gestión de bodegas y stock",
      icon: Warehouse,
      href: "/almacen",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Nuevos Ingresos",
      description: "Registro y recepción de mercancía",
      icon: PackagePlus,
      href: "/ingresos",
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-400",
    },
    {
      title: "Gestión de Salidas",
      description: "Picking, packing y despachos",
      icon: PackageX,
      href: "/salidas",
      color: "bg-orange-500",
      gradient: "from-orange-500 to-amber-400",
    },
    {
      title: "Inventario",
      description: "Control de existencias y ajustes",
      icon: ClipboardList,
      href: "/inventario",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-400",
    },
    {

      title: "Escáner Móvil",
      description: "Lector de códigos con cámara",
      icon: ScanBarcode,
      href: "/ingresos/mobile-scanner",
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-violet-400",
    },

    {
      title: "Reportes",
      description: "Métricas y análisis operativo",
      icon: FileText,
      href: "/reportes",
      color: "bg-slate-500",
      gradient: "from-slate-600 to-slate-400",
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-2xl border border-muted/20 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Bienvenido a SGLA WMS v2
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {isClientView
                ? impersonatingOrg
                  ? `Gestionando: ${impersonatingOrg.name}`
                  : "Panel de control operativo y logístico."
                : "Gestión Global del Sistema"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/lectura-rf")} variant="secondary" className="shadow-lg shadow-secondary/10 hover:shadow-secondary/20 transition-all">
              <ScanBarcode className="mr-2 h-4 w-4" />
              Escáner RF
            </Button>
            <Button onClick={() => router.push("/ingresos/mobile-scanner")} variant="secondary" className="shadow-lg shadow-secondary/10 hover:shadow-secondary/20 transition-all">
              <ScanBarcode className="mr-2 h-4 w-4" />
              Escáner Móvil
            </Button>
            <Button onClick={() => router.push("/ingresos/nuevo")} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <PackagePlus className="mr-2 h-4 w-4" />
              Nuevo Ingreso
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICards />
        </div>

        {/* Access Modules - Symmetrical Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight px-1">Acceso Rápido</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-muted/40 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-card/50 backdrop-blur-sm h-full"
                onClick={() => router.push(feature.href)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br", feature.gradient)} />

                <CardHeader className="pb-2">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-lg transition-transform duration-300 group-hover:scale-110 text-white bg-gradient-to-br", feature.gradient)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-[400px]">
            <SalesChart />
          </div>
          <div className="lg:col-span-1 min-h-[400px]">
            <AIPredictionCard />
          </div>
        </div>
      </div>

      <ChatFAB />
    </MainLayout>
  )
}
