"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Shield, Mail, Bell, Database, Globe, Key, Save, RefreshCw, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "SGLA WMS",
    supportEmail: "soporte@sgla.com",
    maxUsersPerOrg: "100",
    maxStoragePerOrg: "50",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    systemAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
  })

  const [security, setSecurity] = useState({
    twoFactorRequired: false,
    sessionTimeout: "30",
    passwordMinLength: "8",
    maxLoginAttempts: "5",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1">Ajustes globales de la plataforma SGLA</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="data-[state=active]:bg-orange-600">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-orange-600">
            <Shield className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-600">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-600">
            <Globe className="w-4 h-4 mr-2" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajustes básicos de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nombre de la Plataforma</Label>
                  <Input
                    id="platformName"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Máximo de Usuarios por Organización</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={generalSettings.maxUsersPerOrg}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, maxUsersPerOrg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStorage">Almacenamiento Máximo (GB)</Label>
                  <Input
                    id="maxStorage"
                    type="number"
                    value={generalSettings.maxStoragePerOrg}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, maxStoragePerOrg: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Base de Datos
              </CardTitle>
              <CardDescription>Estado y mantenimiento de la base de datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tamaño Total</p>
                  <p className="text-2xl font-bold">2.4 GB</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Último Backup</p>
                  <p className="text-2xl font-bold">Hace 3h</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Conexiones Activas</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ejecutar Backup
                </Button>
                <Button variant="outline">Optimizar Base de Datos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Políticas de seguridad y autenticación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">Requerir 2FA para todos los usuarios</p>
                </div>
                <Switch
                  checked={security.twoFactorRequired}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorRequired: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    value={security.passwordMinLength}
                    onChange={(e) => setSecurity({ ...security, passwordMinLength: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Intentos Máximos de Login</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription>Acciones que pueden afectar todo el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div>
                  <p className="font-medium">Resetear Caché Global</p>
                  <p className="text-sm text-muted-foreground">Limpia toda la caché del sistema</p>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent">
                  Ejecutar
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div>
                  <p className="font-medium">Modo Mantenimiento</p>
                  <p className="text-sm text-muted-foreground">Deshabilita el acceso para usuarios normales</p>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent">
                  Activar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>Gestiona las alertas del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "emailAlerts",
                  label: "Alertas por Email",
                  desc: "Recibir notificaciones importantes por email",
                },
                { key: "systemAlerts", label: "Alertas del Sistema", desc: "Notificaciones de estado del servidor" },
                {
                  key: "billingAlerts",
                  label: "Alertas de Facturación",
                  desc: "Notificaciones de pagos y suscripciones",
                },
                { key: "securityAlerts", label: "Alertas de Seguridad", desc: "Intentos de acceso sospechosos" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label>Emails de Notificación (separados por coma)</Label>
                <Textarea placeholder="admin@sgla.com, soporte@sgla.com" />
              </div>

              <div className="flex justify-end">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Gestiona las claves de API para integraciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Key de Producción</p>
                    <p className="text-xs text-muted-foreground">Creada: 2024-01-15</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerar
                  </Button>
                </div>
                <Input value="sk_live_****************************" readOnly className="font-mono text-sm" />
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Key de Desarrollo</p>
                    <p className="text-xs text-muted-foreground">Creada: 2024-03-20</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerar
                  </Button>
                </div>
                <Input value="sk_test_****************************" readOnly className="font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Integración de Email
              </CardTitle>
              <CardDescription>Configuración del servidor de correo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input placeholder="smtp.ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label>Puerto</Label>
                  <Input placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Input placeholder="noreply@sgla.com" />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Probar Conexión</Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
