"use client"

import { useState } from "react"
import { User, Mail, Phone, Building2, Shield, Calendar, Camera, Save, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MainLayout } from "@/components/layout/main-layout"
import { useAdminStore } from "@/lib/stores/admin-store"

export default function PerfilPage() {
  const { currentUser } = useAdminStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "Super Usuario",
    email: currentUser?.email || "admin@sgla.com",
    phone: "+52 55 1234 5678",
    department: "Operaciones",
    position: "Administrador de Almacén",
  })

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">Administra tu información personal y preferencias</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Guardar Cambios</span>
                <span className="sm:hidden">Guardar</span>
              </>
            ) : (
              "Editar Perfil"
            )}
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-semibold">{formData.fullName}</h2>
                <p className="text-sm text-muted-foreground">{formData.position}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                    <Shield className="w-3 h-3" />
                    {currentUser?.role === "super_admin" ? "Super Admin" : "Administrador"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                    Activo
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro desde: Enero 2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Almacén: PT9 NUEVO CEDIS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="info" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Información
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Actividad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Información Personal</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Tu información básica de cuenta</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm">
                      Nombre Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs sm:text-sm">
                      Departamento
                    </Label>
                    <Select disabled={!isEditing} value={formData.department}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operaciones">Operaciones</SelectItem>
                        <SelectItem value="Logística">Logística</SelectItem>
                        <SelectItem value="Administración">Administración</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Cambiar Contraseña</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Actualiza tu contraseña regularmente para mayor seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-xs sm:text-sm">
                      Contraseña Actual
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="currentPassword" type="password" className="pl-10 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-xs sm:text-sm">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="newPassword" type="password" className="pl-10 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" className="pl-10 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">Actualizar Contraseña</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Autenticación de Dos Factores</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Añade una capa extra de seguridad a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      Estado: <span className="text-yellow-500">No configurado</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Protege tu cuenta con verificación en dos pasos
                    </p>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Configurar 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Preferencias de Notificaciones</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configura cómo y cuándo recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                {[
                  { label: "Nuevos pedidos", desc: "Notificar cuando se registren nuevos pedidos" },
                  { label: "Stock bajo", desc: "Alertas cuando el inventario esté por debajo del mínimo" },
                  { label: "Ingresos pendientes", desc: "Recordatorios de ingresos por validar" },
                  { label: "Reportes diarios", desc: "Resumen de actividad al final del día" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={i < 2} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Actividad Reciente</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Historial de acciones en tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-4">
                  {[
                    { action: "Inicio de sesión", date: "Hoy, 09:30 AM", ip: "192.168.1.100" },
                    { action: "Cambio de contraseña", date: "Hace 3 días", ip: "192.168.1.100" },
                    { action: "Actualización de perfil", date: "Hace 1 semana", ip: "192.168.1.105" },
                    { action: "Inicio de sesión", date: "Hace 2 semanas", ip: "192.168.1.100" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border last:border-0 gap-1"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">IP: {item.ip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
