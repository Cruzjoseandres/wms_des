"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Activity,
  Search,
  UserPlus,
  LogIn,
  LogOut,
  Settings,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react"

interface ActivityLog {
  id: string
  type: "login" | "logout" | "create" | "update" | "delete" | "error" | "system"
  action: string
  user: string
  organization: string
  timestamp: string
  details?: string
  ip?: string
}

const activityLogs: ActivityLog[] = [
  {
    id: "1",
    type: "login",
    action: "Inicio de sesión",
    user: "Carlos Rodríguez",
    organization: "Distribuidora Central",
    timestamp: "Hace 5 min",
    ip: "192.168.1.100",
  },
  {
    id: "2",
    type: "create",
    action: "Nuevo ingreso creado",
    user: "María García",
    organization: "Logística Express",
    timestamp: "Hace 12 min",
    details: "Ingreso #ING-2024-001234",
  },
  {
    id: "3",
    type: "update",
    action: "Producto actualizado",
    user: "Juan Pérez",
    organization: "Almacenes del Sur",
    timestamp: "Hace 25 min",
    details: "SKU: PRD-00542",
  },
  {
    id: "4",
    type: "error",
    action: "Error en sincronización",
    user: "Sistema",
    organization: "Comercial Norte",
    timestamp: "Hace 1 hora",
    details: "Timeout en conexión con API externa",
  },
  {
    id: "5",
    type: "delete",
    action: "Usuario eliminado",
    user: "Admin Principal",
    organization: "Importadora Global",
    timestamp: "Hace 2 horas",
    details: "Usuario: operador_temp@importadora.com",
  },
  {
    id: "6",
    type: "system",
    action: "Backup automático completado",
    user: "Sistema",
    organization: "Global",
    timestamp: "Hace 3 horas",
    details: "Backup #BKP-20250108-0300",
  },
  {
    id: "7",
    type: "logout",
    action: "Cierre de sesión",
    user: "Ana López",
    organization: "Comercial Norte",
    timestamp: "Hace 4 horas",
    ip: "192.168.2.50",
  },
  {
    id: "8",
    type: "create",
    action: "Nuevo almacén creado",
    user: "Roberto Sánchez",
    organization: "Importadora Global",
    timestamp: "Hace 5 horas",
    details: "Almacén: Bodega Norte #4",
  },
]

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.organization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || log.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-green-500" />
      case "logout":
        return <LogOut className="w-4 h-4 text-gray-500" />
      case "create":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case "update":
        return <Settings className="w-4 h-4 text-orange-500" />
      case "delete":
        return <Package className="w-4 h-4 text-red-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "system":
        return <CheckCircle className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type: ActivityLog["type"]) => {
    const styles: Record<string, string> = {
      login: "bg-green-500/20 text-green-400",
      logout: "bg-gray-500/20 text-gray-400",
      create: "bg-blue-500/20 text-blue-400",
      update: "bg-orange-500/20 text-orange-400",
      delete: "bg-red-500/20 text-red-400",
      error: "bg-red-500/20 text-red-400",
      system: "bg-purple-500/20 text-purple-400",
    }
    return <Badge className={styles[type] || "bg-gray-500/20 text-gray-400"}>{type}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Actividad del Sistema</h1>
          <p className="text-muted-foreground mt-1">Registro de todas las acciones en la plataforma</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <LogIn className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-muted-foreground">Inicios de sesión hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground">Operaciones hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Errores hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por acción, usuario o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "login", "create", "update", "delete", "error", "system"].map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={typeFilter === type ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {type === "all" ? "Todos" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Registro de Actividad
          </CardTitle>
          <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 bg-background rounded-lg">{getTypeIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{log.action}</p>
                    {getTypeBadge(log.type)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px] bg-orange-500/20 text-orange-500">
                        {log.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{log.user}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{log.organization}</span>
                  </div>
                  {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                  {log.ip && <p className="text-xs text-muted-foreground">IP: {log.ip}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
