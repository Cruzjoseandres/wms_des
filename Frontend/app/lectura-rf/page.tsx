"use client"

import { useState, useEffect, useCallback } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Radio,
  Wifi,
  WifiOff,
  Play,
  Square,
  Trash2,
  Download,
  RefreshCw,
  Settings,
  Signal,
  Zap,
  Package,
  MapPin,
  Clock,
  AlertTriangle,
  History,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react"

interface RFIDTag {
  id: string
  epc: string
  rssi: number
  timestamp: string
  producto?: string
  ubicacion?: string
  estado: "Nuevo" | "Conocido" | "Alerta"
}

interface DispositivoRF {
  id: string
  nombre: string
  tipo: "Fijo" | "Portatil"
  estado: "Conectado" | "Desconectado" | "Error"
  ip?: string
  bateria?: number
  ultimaLectura?: string
}

interface LecturaHistorial {
  id: string
  fecha: string
  tipo: "Inventario" | "Ingreso" | "Salida" | "Verificacion"
  tagsLeidos: number
  dispositivo: string
  usuario: string
  duracion: string
}

const dispositivosData: DispositivoRF[] = [
  {
    id: "1",
    nombre: "Lector Fijo Portal 1",
    tipo: "Fijo",
    estado: "Conectado",
    ip: "192.168.1.100",
    ultimaLectura: "Hace 2 min",
  },
  {
    id: "2",
    nombre: "Lector Fijo Portal 2",
    tipo: "Fijo",
    estado: "Conectado",
    ip: "192.168.1.101",
    ultimaLectura: "Hace 5 min",
  },
  {
    id: "3",
    nombre: "Colector Portatil 001",
    tipo: "Portatil",
    estado: "Conectado",
    bateria: 85,
    ultimaLectura: "Hace 1 min",
  },
  { id: "4", nombre: "Colector Portatil 002", tipo: "Portatil", estado: "Desconectado", bateria: 45 },
  { id: "5", nombre: "Lector Mesa Empaque", tipo: "Fijo", estado: "Error", ip: "192.168.1.102" },
]

const historialData: LecturaHistorial[] = [
  {
    id: "1",
    fecha: "2025-01-08 14:30",
    tipo: "Inventario",
    tagsLeidos: 1245,
    dispositivo: "Colector Portatil 001",
    usuario: "Carlos M.",
    duracion: "45 min",
  },
  {
    id: "2",
    fecha: "2025-01-08 11:15",
    tipo: "Ingreso",
    tagsLeidos: 328,
    dispositivo: "Lector Fijo Portal 1",
    usuario: "Sistema",
    duracion: "12 min",
  },
  {
    id: "3",
    fecha: "2025-01-08 09:45",
    tipo: "Salida",
    tagsLeidos: 156,
    dispositivo: "Lector Fijo Portal 2",
    usuario: "Sistema",
    duracion: "8 min",
  },
  {
    id: "4",
    fecha: "2025-01-07 16:00",
    tipo: "Verificacion",
    tagsLeidos: 89,
    dispositivo: "Colector Portatil 002",
    usuario: "Maria L.",
    duracion: "15 min",
  },
]

export default function LecturaRFPage() {
  const [activeTab, setActiveTab] = useState("lectura")
  const [dispositivos, setDispositivos] = useState<DispositivoRF[]>(dispositivosData)
  const [tagsLeidos, setTagsLeidos] = useState<RFIDTag[]>([])
  const [isReading, setIsReading] = useState(false)
  const [selectedDispositivo, setSelectedDispositivo] = useState<string>("")
  const [modoLectura, setModoLectura] = useState<"continuo" | "individual">("continuo")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [filtrarDuplicados, setFiltrarDuplicados] = useState(true)
  const [potencia, setPotencia] = useState(75)

  // Simulación de lectura RFID
  const simulateRFIDRead = useCallback(() => {
    const epcs = [
      "E200001234567890ABCD",
      "E200001234567890ABCE",
      "E200001234567890ABCF",
      "E200009876543210DCBA",
      "E200009876543210DCBB",
      "E200005555666677778888",
    ]
    const productos = ["Producto A Premium", "Producto B Estándar", "Producto C Básico", "Producto D Premium", null]
    const ubicaciones = ["A-01-01", "A-01-02", "B-02-03", "C-01-01", null]

    const randomEpc = epcs[Math.floor(Math.random() * epcs.length)]
    const existingTag = tagsLeidos.find((t) => t.epc === randomEpc)

    if (filtrarDuplicados && existingTag) {
      // Actualizar RSSI del tag existente
      setTagsLeidos((prev) =>
        prev.map((t) =>
          t.epc === randomEpc
            ? { ...t, rssi: -20 - Math.floor(Math.random() * 40), timestamp: new Date().toLocaleTimeString() }
            : t,
        ),
      )
    } else if (!filtrarDuplicados || !existingTag) {
      const newTag: RFIDTag = {
        id: Date.now().toString(),
        epc: randomEpc,
        rssi: -20 - Math.floor(Math.random() * 40),
        timestamp: new Date().toLocaleTimeString(),
        producto: productos[Math.floor(Math.random() * productos.length)] || undefined,
        ubicacion: ubicaciones[Math.floor(Math.random() * ubicaciones.length)] || undefined,
        estado: Math.random() > 0.8 ? "Alerta" : Math.random() > 0.3 ? "Conocido" : "Nuevo",
      }
      setTagsLeidos((prev) => [newTag, ...prev].slice(0, 100))
    }
  }, [tagsLeidos, filtrarDuplicados])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isReading && modoLectura === "continuo") {
      interval = setInterval(simulateRFIDRead, 500)
    }
    return () => clearInterval(interval)
  }, [isReading, modoLectura, simulateRFIDRead])

  const handleStartReading = () => {
    if (!selectedDispositivo) return
    setIsReading(true)
  }

  const handleStopReading = () => {
    setIsReading(false)
  }

  const handleClearTags = () => {
    setTagsLeidos([])
  }

  const handleSingleRead = () => {
    if (!selectedDispositivo) return
    simulateRFIDRead()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Conectado":
        return <Badge className="bg-green-600 text-white">Conectado</Badge>
      case "Desconectado":
        return <Badge className="bg-gray-500 text-white">Desconectado</Badge>
      case "Error":
        return <Badge className="bg-red-600 text-white">Error</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getTagEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Nuevo":
        return <Badge className="bg-blue-600 text-white">Nuevo</Badge>
      case "Conocido":
        return <Badge className="bg-green-600 text-white">Conocido</Badge>
      case "Alerta":
        return <Badge className="bg-red-600 text-white">Alerta</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getRSSIColor = (rssi: number) => {
    if (rssi > -30) return "text-green-500"
    if (rssi > -50) return "text-amber-500"
    return "text-red-500"
  }

  const getRSSIBars = (rssi: number) => {
    if (rssi > -30) return 4
    if (rssi > -40) return 3
    if (rssi > -50) return 2
    return 1
  }

  const conectados = dispositivos.filter((d) => d.estado === "Conectado").length
  const tagsUnicos = new Set(tagsLeidos.map((t) => t.epc)).size
  const tagsAlerta = tagsLeidos.filter((t) => t.estado === "Alerta").length

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Lectura de Radiofrecuencia (RF)"
          description="Control y monitoreo de dispositivos RFID"
          icon={<Radio className="h-6 w-6" />}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-green-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Dispositivos</p>
                  <p className="text-3xl font-bold text-white">
                    {conectados}/{dispositivos.length}
                  </p>
                </div>
                <Wifi className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tags Leídos</p>
                  <p className="text-3xl font-bold text-white">{tagsLeidos.length}</p>
                </div>
                <Radio className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Tags Únicos</p>
                  <p className="text-3xl font-bold text-white">{tagsUnicos}</p>
                </div>
                <Package className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Alertas</p>
                  <p className="text-3xl font-bold text-white">{tagsAlerta}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className={`border-0 ${isReading ? "bg-green-600 animate-pulse" : "bg-gray-600"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isReading ? "text-green-100" : "text-gray-300"}`}>Estado</p>
                  <p className="text-xl font-bold text-white">{isReading ? "Leyendo..." : "Detenido"}</p>
                </div>
                {isReading ? (
                  <Zap className="h-10 w-10 text-green-200" />
                ) : (
                  <WifiOff className="h-10 w-10 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="lectura" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Radio className="h-4 w-4 mr-2" />
              Lectura RFID
            </TabsTrigger>
            <TabsTrigger
              value="dispositivos"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Dispositivos
            </TabsTrigger>
            <TabsTrigger value="historial" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Tab Lectura RFID */}
          <TabsContent value="lectura" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Panel de Control */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    Control de Lectura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Dispositivo</Label>
                    <Select value={selectedDispositivo} onValueChange={setSelectedDispositivo}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Seleccionar dispositivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {dispositivos
                          .filter((d) => d.estado === "Conectado")
                          .map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              <div className="flex items-center gap-2">
                                {d.tipo === "Fijo" ? <Wifi className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
                                {d.nombre}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Modo de Lectura</Label>
                    <Select value={modoLectura} onValueChange={(v) => setModoLectura(v as "continuo" | "individual")}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuo">Continuo</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Potencia: {potencia}%</Label>
                    <Input
                      type="range"
                      min={10}
                      max={100}
                      value={potencia}
                      onChange={(e) => setPotencia(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Filtrar Duplicados</Label>
                    <Switch checked={filtrarDuplicados} onCheckedChange={setFiltrarDuplicados} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Sonido</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={soundEnabled ? "text-green-500" : "text-muted-foreground"}
                    >
                      {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                  </div>

                  <div className="space-y-2 pt-4">
                    {modoLectura === "continuo" ? (
                      <>
                        {!isReading ? (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleStartReading}
                            disabled={!selectedDispositivo}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Lectura
                          </Button>
                        ) : (
                          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleStopReading}>
                            <Square className="h-4 w-4 mr-2" />
                            Detener Lectura
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={handleSingleRead}
                        disabled={!selectedDispositivo}
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Leer Una Vez
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleClearTags}
                      disabled={tagsLeidos.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar Lista
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" disabled={tagsLeidos.length === 0}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Tags Leídos */}
              <div className="lg:col-span-3">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-foreground">Tags RFID Leídos</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Última actualización: {tagsLeidos[0]?.timestamp || "--:--:--"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tagsLeidos.length === 0 ? (
                      <div className="text-center py-12">
                        <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay tags leídos</p>
                        <p className="text-sm text-muted-foreground">Selecciona un dispositivo e inicia la lectura</p>
                      </div>
                    ) : (
                      <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead className="text-muted-foreground">EPC</TableHead>
                              <TableHead className="text-muted-foreground">Producto</TableHead>
                              <TableHead className="text-muted-foreground">Ubicación</TableHead>
                              <TableHead className="text-muted-foreground">RSSI</TableHead>
                              <TableHead className="text-muted-foreground">Hora</TableHead>
                              <TableHead className="text-muted-foreground">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tagsLeidos.map((tag) => (
                              <TableRow key={tag.id} className="border-border">
                                <TableCell className="text-foreground font-mono text-xs">{tag.epc}</TableCell>
                                <TableCell className="text-foreground">
                                  {tag.producto ? (
                                    <div className="flex items-center gap-1">
                                      <Package className="h-3 w-3 text-muted-foreground" />
                                      {tag.producto}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {tag.ubicacion ? (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      {tag.ubicacion}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4].map((bar) => (
                                        <div
                                          key={bar}
                                          className={`w-1 rounded-full ${
                                            bar <= getRSSIBars(tag.rssi)
                                              ? getRSSIColor(tag.rssi).replace("text-", "bg-")
                                              : "bg-muted"
                                          }`}
                                          style={{ height: `${bar * 4}px` }}
                                        />
                                      ))}
                                    </div>
                                    <span className={`text-sm ${getRSSIColor(tag.rssi)}`}>{tag.rssi} dBm</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-foreground">{tag.timestamp}</TableCell>
                                <TableCell>{getTagEstadoBadge(tag.estado)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Dispositivos */}
          <TabsContent value="dispositivos" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Dispositivos RFID</CardTitle>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dispositivos.map((dispositivo) => (
                    <Card
                      key={dispositivo.id}
                      className={`border ${
                        dispositivo.estado === "Conectado"
                          ? "border-green-500/30 bg-green-500/5"
                          : dispositivo.estado === "Error"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-border bg-muted/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {dispositivo.tipo === "Fijo" ? (
                              <Wifi
                                className={`h-5 w-5 ${dispositivo.estado === "Conectado" ? "text-green-500" : "text-muted-foreground"}`}
                              />
                            ) : (
                              <Radio
                                className={`h-5 w-5 ${dispositivo.estado === "Conectado" ? "text-green-500" : "text-muted-foreground"}`}
                              />
                            )}
                            <span className="font-medium text-foreground">{dispositivo.nombre}</span>
                          </div>
                          {getEstadoBadge(dispositivo.estado)}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="text-foreground">{dispositivo.tipo}</span>
                          </div>
                          {dispositivo.ip && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IP:</span>
                              <span className="text-foreground font-mono">{dispositivo.ip}</span>
                            </div>
                          )}
                          {dispositivo.bateria !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Batería:</span>
                                <span
                                  className={`${dispositivo.bateria > 50 ? "text-green-500" : dispositivo.bateria > 20 ? "text-amber-500" : "text-red-500"}`}
                                >
                                  {dispositivo.bateria}%
                                </span>
                              </div>
                              <Progress value={dispositivo.bateria} className="h-1" />
                            </div>
                          )}
                          {dispositivo.ultimaLectura && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Última lectura:</span>
                              <span className="text-foreground">{dispositivo.ultimaLectura}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
                          </Button>
                          {dispositivo.estado === "Conectado" && (
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                              <Signal className="h-3 w-3 mr-1" />
                              Test
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Historial */}
          <TabsContent value="historial" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Historial de Lecturas</CardTitle>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Fecha/Hora</TableHead>
                      <TableHead className="text-muted-foreground">Tipo</TableHead>
                      <TableHead className="text-muted-foreground">Dispositivo</TableHead>
                      <TableHead className="text-muted-foreground">Tags Leídos</TableHead>
                      <TableHead className="text-muted-foreground">Duración</TableHead>
                      <TableHead className="text-muted-foreground">Usuario</TableHead>
                      <TableHead className="text-muted-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historialData.map((lectura) => (
                      <TableRow key={lectura.id} className="border-border">
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {lectura.fecha}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              lectura.tipo === "Inventario"
                                ? "border-purple-500 text-purple-500"
                                : lectura.tipo === "Ingreso"
                                  ? "border-green-500 text-green-500"
                                  : lectura.tipo === "Salida"
                                    ? "border-blue-500 text-blue-500"
                                    : "border-amber-500 text-amber-500"
                            }
                          >
                            {lectura.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">{lectura.dispositivo}</TableCell>
                        <TableCell className="text-foreground font-medium">
                          {lectura.tagsLeidos.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-foreground">{lectura.duracion}</TableCell>
                        <TableCell className="text-foreground">{lectura.usuario}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Ver Detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
