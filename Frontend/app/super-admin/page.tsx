"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Building2, Users, CreditCard, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function SuperAdminDashboard() {
  const { organizations } = useAdminStore()

  const stats = {
    totalOrgs: organizations.length,
    activeOrgs: organizations.filter((o) => o.isActive).length,
    totalUsers: organizations.reduce((acc, o) => acc + o.usersCount, 0),
    totalWarehouses: organizations.reduce((acc, o) => acc + o.warehousesCount, 0),
    enterprisePlans: organizations.filter((o) => o.plan === "enterprise").length,
    proPlans: organizations.filter((o) => o.plan === "pro").length,
    freePlans: organizations.filter((o) => o.plan === "free").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel Super Administrador</h1>
        <p className="text-muted-foreground mt-1">Gestión global del sistema SGLA WMS</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Empresas</p>
                <p className="text-3xl font-bold text-white">{stats.totalOrgs}</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Usuarios Totales</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Almacenes Activos</p>
                <p className="text-3xl font-bold text-white">{stats.totalWarehouses}</p>
              </div>
              <Activity className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">MRR Estimado</p>
                <p className="text-3xl font-bold text-white">$12,450</p>
              </div>
              <CreditCard className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Distribución de Planes
            </CardTitle>
            <CardDescription>Empresas por tipo de plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <span className="text-sm font-medium">Enterprise</span>
              <span className="text-lg font-bold text-yellow-500">{stats.enterprisePlans}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <span className="text-sm font-medium">Pro</span>
              <span className="text-lg font-bold text-blue-500">{stats.proPlans}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg border border-gray-500/30">
              <span className="text-sm font-medium">Free</span>
              <span className="text-lg font-bold text-gray-400">{stats.freePlans}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>Salud general de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Base de Datos</p>
                <p className="text-xs text-muted-foreground">Operando normalmente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">API</p>
                <p className="text-xs text-muted-foreground">Latencia: 45ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Cola de Tareas</p>
                <p className="text-xs text-muted-foreground">12 trabajos pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Alertas Recientes
            </CardTitle>
            <CardDescription>Eventos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-500/10 rounded-lg border-l-4 border-red-500">
              <p className="text-sm font-medium">Alta carga en servidor</p>
              <p className="text-xs text-muted-foreground">Hace 2 horas</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm font-medium">Plan por vencer: Logística Express</p>
              <p className="text-xs text-muted-foreground">Hace 1 día</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-medium">Nueva empresa registrada</p>
              <p className="text-xs text-muted-foreground">Hace 3 días</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Nueva empresa registrada",
                org: "Comercial Norte",
                time: "Hace 2 horas",
                type: "success",
              },
              { action: "Plan actualizado a Pro", org: "Almacenes del Sur", time: "Hace 5 horas", type: "info" },
              {
                action: "Usuario eliminado",
                org: "Logística Express",
                time: "Hace 1 día",
                type: "warning",
              },
              {
                action: "Nuevo almacén creado",
                org: "Distribuidora Central",
                time: "Hace 2 días",
                type: "success",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      item.type === "success" && "bg-green-500",
                      item.type === "info" && "bg-blue-500",
                      item.type === "warning" && "bg-yellow-500",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.org}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
