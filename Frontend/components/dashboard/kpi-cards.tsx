"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Package, PackagePlus, PackageX, Server, AlertCircle, Building } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Card, CardContent } from "@/components/ui/card"

type KPI = {
  label: string
  value: string
  icon: React.ElementType
  color: string
  borderColor: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

const kpisByOrg: Record<string, KPI[]> = {
  "org-001": [
    {
      label: "Stock Total",
      value: "14,250",
      icon: Package,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      change: "+2.5%",
      changeType: "positive",
    },
    {
      label: "Pedidos Hoy",
      value: "124",
      icon: PackagePlus,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      change: "+12%",
      changeType: "positive",
    },
    { label: "Pendientes", value: "8", icon: PackageX, color: "text-amber-400", borderColor: "border-amber-500/30" },
  ],
  "org-002": [
    {
      label: "Stock Total",
      value: "8,420",
      icon: Package,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      change: "+1.2%",
      changeType: "positive",
    },
    {
      label: "Pedidos Hoy",
      value: "67",
      icon: PackagePlus,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      change: "+8%",
      changeType: "positive",
    },
    { label: "Pendientes", value: "3", icon: PackageX, color: "text-amber-400", borderColor: "border-amber-500/30" },
  ],
}

const defaultClientKpis: KPI[] = [
  {
    label: "Stock Total",
    value: "14,250",
    icon: Package,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    change: "+2.5%",
    changeType: "positive",
  },
  {
    label: "Pedidos Hoy",
    value: "124",
    icon: PackagePlus,
    color: "text-green-400",
    borderColor: "border-green-500/30",
    change: "+12%",
    changeType: "positive",
  },
  { label: "Pendientes", value: "8", icon: PackageX, color: "text-amber-400", borderColor: "border-amber-500/30" },
]

const superAdminKpis: KPI[] = [
  {
    label: "Tenants Activos",
    value: "12",
    icon: Building,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    change: "+2",
    changeType: "positive",
  },
  {
    label: "Estado Servidor",
    value: "99.9%",
    icon: Server,
    color: "text-green-400",
    borderColor: "border-green-500/30",
  },
  {
    label: "Errores Hoy",
    value: "3",
    icon: AlertCircle,
    color: "text-red-400",
    borderColor: "border-red-500/30",
    change: "-5",
    changeType: "positive",
  },
]

export function KPICards() {
  const { impersonatingOrgId, isSuperAdmin } = useAdminStore()

  const kpis =
    impersonatingOrgId && kpisByOrg[impersonatingOrgId]
      ? kpisByOrg[impersonatingOrgId]
      : isSuperAdmin && !impersonatingOrgId
        ? superAdminKpis
        : defaultClientKpis

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 h-full">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className={cn("bg-card border transition-colors hover:bg-muted/50", kpi.borderColor)}>
          <CardContent className="p-4 sm:p-5 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center",
                  kpi.color,
                  "bg-current/10",
                )}
              >
                <kpi.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", kpi.color)} />
              </div>
              {kpi.change && (
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    kpi.changeType === "positive"
                      ? "text-green-400 bg-green-500/10"
                      : kpi.changeType === "negative"
                        ? "text-red-400 bg-red-500/10"
                        : "text-muted-foreground bg-muted",
                  )}
                >
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
