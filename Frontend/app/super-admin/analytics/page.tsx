"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStore } from "@/lib/stores/admin-store"
import { BarChart3, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const { organizations } = useAdminStore()

  const metrics = [
    {
      label: "Operaciones Totales",
      value: "156,432",
      change: "+12.5%",
      positive: true,
      icon: Activity,
    },
    {
      label: "Items Procesados",
      value: "89,231",
      change: "+8.3%",
      positive: true,
      icon: Package,
    },
    {
      label: "Usuarios Activos",
      value: "847",
      change: "+15.2%",
      positive: true,
      icon: Users,
    },
    {
      label: "Tasa de Error",
      value: "0.12%",
      change: "-0.05%",
      positive: true,
      icon: TrendingUp,
    },
  ]

  const topOrgs = [...organizations].sort((a, b) => b.warehousesCount - a.warehousesCount).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analíticas Globales</h1>
        <p className="text-muted-foreground mt-1">Métricas y estadísticas de toda la plataforma</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.positive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={metric.positive ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Operaciones por Mes
            </CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Dic", "Nov", "Oct", "Sep", "Ago", "Jul"].map((month, index) => {
                const value = [95, 88, 82, 78, 72, 65][index]
                return (
                  <div key={month} className="flex items-center gap-4">
                    <span className="w-12 text-sm text-muted-foreground">{month}</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm font-medium text-right">{(value * 1643).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Empresas por Actividad
            </CardTitle>
            <CardDescription>Empresas más activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrgs.map((org, index) => (
                <div key={org.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.usersCount} usuarios • {org.warehousesCount} almacenes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(org.warehousesCount * 2341).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">operaciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Feature */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Funcionalidad</CardTitle>
          <CardDescription>Distribución del uso de módulos en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Ingresos", usage: 92, color: "bg-blue-500" },
              { name: "Salidas", usage: 88, color: "bg-green-500" },
              { name: "Inventarios", usage: 75, color: "bg-purple-500" },
              { name: "Picking", usage: 82, color: "bg-orange-500" },
              { name: "Packing", usage: 70, color: "bg-pink-500" },
              { name: "RFID", usage: 45, color: "bg-cyan-500" },
            ].map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${feature.usage * 2.2} 220`}
                      className={feature.color.replace("bg-", "text-")}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{feature.usage}%</span>
                  </div>
                </div>
                <p className="text-sm mt-2 font-medium">{feature.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
