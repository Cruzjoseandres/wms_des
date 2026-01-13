"use client"

import { useState } from "react"
import {
  Settings,
  Globe,
  Bell,
  Palette,
  Database,
  Shield,
  Printer,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MainLayout } from "@/components/layout/main-layout"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    language: "es",
    timezone: "America/Mexico_City",
    dateFormat: "DD/MM/YYYY",
    currency: "MXN",
  })

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Configuración
            </h1>
            <p className="text-sm text-muted-foreground">Personaliza la aplicación según tus preferencias</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exportar Configuración</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="general" className="flex-1 sm:flex-none text-xs sm:text-sm">
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Integraciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Preferencias Regionales
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configura idioma, zona horaria y formatos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Idioma</Label>
                    <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Zona Horaria</Label>
                    <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Formato de Fecha</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(v) => setSettings({ ...settings, dateFormat: v })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Moneda</Label>
                    <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                        <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Impresión y Etiquetado
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configura impresoras y formatos de etiquetas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Impresora de Etiquetas</Label>
                    <Select defaultValue="zebra">
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zebra">Zebra ZD420</SelectItem>
                        <SelectItem value="brother">Brother QL-820NWB</SelectItem>
                        <SelectItem value="dymo">Dymo LabelWriter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Tamaño de Etiqueta</Label>
                    <Select defaultValue="2x1">
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x1">2" x 1"</SelectItem>
                        <SelectItem value="4x2">4" x 2"</SelectItem>
                        <SelectItem value="4x6">4" x 6"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Tema de la Aplicación
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Elige entre modo claro, oscuro o automático
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-colors",
                      theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-colors",
                      theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">Oscuro</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-colors",
                      theme === "system" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white to-slate-900 border border-gray-300 flex items-center justify-center">
                      <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">Sistema</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Personalización</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ajusta la interfaz a tu gusto</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Sidebar compacto</p>
                    <p className="text-xs text-muted-foreground">Reduce el ancho del menú lateral</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Animaciones</p>
                    <p className="text-xs text-muted-foreground">Habilitar transiciones y animaciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Fuente grande</p>
                    <p className="text-xs text-muted-foreground">Aumentar tamaño de texto</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Canales de Notificación
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configura cómo recibir alertas</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                {[
                  {
                    label: "Notificaciones en App",
                    desc: "Mostrar notificaciones dentro de la aplicación",
                    enabled: true,
                  },
                  { label: "Notificaciones Email", desc: "Enviar alertas por correo electrónico", enabled: true },
                  { label: "Notificaciones Push", desc: "Recibir notificaciones en el navegador", enabled: false },
                  { label: "Sonidos", desc: "Reproducir sonido al recibir notificaciones", enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Integraciones Activas
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Conexiones con sistemas externos</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                {[
                  { name: "SAP Business One", status: "Conectado", color: "text-green-400" },
                  { name: "Sistema de Facturación", status: "Conectado", color: "text-green-400" },
                  { name: "API de Transporte", status: "Pendiente", color: "text-yellow-400" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border last:border-0 gap-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className={`text-xs ${item.color}`}>{item.status}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                      Configurar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Respaldo de Datos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Exportar e importar configuraciones</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
