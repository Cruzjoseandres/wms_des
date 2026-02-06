"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, CheckCircle, ScanLine, Play, Pause, Check, Layers, Loader2, RefreshCw, ScanBarcode, Camera, Keyboard, Printer, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PickingService } from "@/lib/api/picking.service"
import {
  type OrdenSalida,
  type DetalleSalida,
  EstadoDetalleSalida,
  EstadoOrdenSalida
} from "@/lib/models"
import { toast } from "sonner"
import { useScanDetection } from "@/hooks/use-scan-detection"
import { ScannerModal } from "@/components/scanner/scanner-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Tipo para el comprobante de picking
interface ComprobantePickingItem {
  codItem: string
  descripcion: string
  cantidadSolicitada: number
  cantidadPickeada: number
  ubicacionOrigen: string
  tiempoPicking: number | null
}

interface ComprobantePicking {
  nroComprobante: string
  fechaEmision: string
  orden: {
    id: number
    nroDocumento: string
    cliente: string
    destino: string
    almacen: string
    observacion: string
  }
  picking: {
    usuarioPicking: string
    iniciadoEn: string
    completadoEn: string
    tiempoTotalSegundos: number
    tiempoFormateado: string
  }
  items: ComprobantePickingItem[]
  totales: {
    totalItems: number
    totalUnidades: number
  }
}

// Usuario hardcodeado para demo - en producción vendría de auth
const CURRENT_USER = "PICKER_DEMO"

type ScanMode = "zebra" | "camera" | "manual"

export default function PickingPage() {
  const [ordenes, setOrdenes] = useState<OrdenSalida[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrden, setSelectedOrden] = useState<OrdenSalida | null>(null)
  const [scanInput, setScanInput] = useState("")
  const [activeTab, setActiveTab] = useState("individual")
  const [processing, setProcessing] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>("zebra")
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [zebraConnected, setZebraConnected] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Estado local para tracking de picking incremental
  // Key: detalleId, Value: cantidadPickeadaLocal
  const [localPickingProgress, setLocalPickingProgress] = useState<Record<number, number>>({})

  // Estado para el comprobante/voucher
  const [comprobante, setComprobante] = useState<ComprobantePicking | null>(null)
  const [showComprobante, setShowComprobante] = useState(false)

  // Hook para detección de escáner Zebra
  useScanDetection({
    onComplete: async (code: string) => {
      if (selectedOrden && scanMode === "zebra") {
        console.log("[Zebra] Código escaneado:", code)
        setLastScan(code)
        setZebraConnected(true)
        await processScannedCode(code)
      }
    },
    minLength: 3,
  })

  // Cargar órdenes pendientes para picking
  const loadOrdenes = async () => {
    try {
      setLoading(true)
      const data = await PickingService.getOrdenesPendientes()
      setOrdenes(data)

      // Si hay una orden seleccionada, actualizarla
      if (selectedOrden) {
        const updated = data.find(o => o.id === selectedOrden.id)
        if (updated) {
          setSelectedOrden(updated)
        } else {
          setSelectedOrden(null)
        }
      }
    } catch (error) {
      console.error("Error cargando órdenes:", error)
      toast.error("Error al cargar órdenes para picking")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrdenes()
  }, [])

  // Efecto para mantener foco en el input cuando hay orden seleccionada
  useEffect(() => {
    if (selectedOrden && scanMode === "manual" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedOrden, scanMode])

  const getProgreso = (orden: OrdenSalida) => {
    if (!orden.detalles || orden.detalles.length === 0) return 0
    const pickeados = orden.detalles.filter(d => d.estado === EstadoDetalleSalida.PICKEADO).length
    return Math.round((pickeados / orden.detalles.length) * 100)
  }

  const getEstadoLabel = (orden: OrdenSalida) => {
    if (orden.estado === EstadoOrdenSalida.COMPLETADA) return "Completado"
    if (orden.estado === EstadoOrdenSalida.EN_PICKING) return "En Proceso"
    return "Pendiente"
  }

  const getEstadoColor = (orden: OrdenSalida) => {
    if (orden.estado === EstadoOrdenSalida.COMPLETADA) return "bg-green-600"
    if (orden.estado === EstadoOrdenSalida.EN_PICKING) return "bg-blue-600"
    return "bg-yellow-600"
  }

  const handleIniciarPicking = async (orden: OrdenSalida) => {
    try {
      setProcessing(true)
      await PickingService.iniciarOrden(orden.id, CURRENT_USER)
      toast.success(`Picking iniciado para ${orden.nroDocumento}`)
      await loadOrdenes()
      // Actualizar la orden seleccionada con los datos frescos
      const updated = await PickingService.getOrdenesPendientes()
      const ordenActualizada = updated.find(o => o.id === orden.id)
      if (ordenActualizada) {
        setSelectedOrden(ordenActualizada)
      }
    } catch (error) {
      console.error("Error iniciando picking:", error)
      toast.error(error instanceof Error ? error.message : "Error al iniciar picking")
    } finally {
      setProcessing(false)
    }
  }

  // Obtener cantidad pickeada (local + backend)
  const getCantidadPickeada = (detalle: DetalleSalida): number => {
    const backendCantidad = detalle.cantidadPickeada || 0
    const localCantidad = localPickingProgress[detalle.id] || 0
    return backendCantidad + localCantidad
  }

  // Verificar si un detalle está completo
  const isDetalleCompleto = (detalle: DetalleSalida): boolean => {
    return getCantidadPickeada(detalle) >= detalle.cantidadSolicitada ||
      detalle.estado === EstadoDetalleSalida.PICKEADO
  }

  // Función central para procesar el código escaneado (Zebra o Manual+Confirmar)
  const processScannedCode = async (code: string) => {
    if (!selectedOrden || !code.trim()) return

    // Buscar el detalle que coincide con el código escaneado
    const detalle = selectedOrden.detalles.find(d =>
      d.codItem.toLowerCase() === code.toLowerCase() ||
      d.ubicacionOrigen?.toLowerCase() === code.toLowerCase() ||
      d.item?.codigoBarra?.toLowerCase() === code.toLowerCase()
    )

    if (!detalle) {
      toast.error("Código no encontrado en esta orden")
      setScanInput("")
      return
    }

    // Si ya está marcado como PICKEADO en backend, no hacer nada más
    if (detalle.estado === EstadoDetalleSalida.PICKEADO) {
      toast.warning("Este item ya fue confirmado como OK")
      setScanInput("")
      return
    }

    // Usar updater function para evitar stale closure
    setLocalPickingProgress(prev => {
      console.log('[Picking Debug] processScannedCode called')
      console.log('[Picking Debug] detalle.id:', detalle.id)
      console.log('[Picking Debug] prev state:', JSON.stringify(prev))

      const cantidadBackend = detalle.cantidadPickeada || 0
      const cantidadLocal = prev[detalle.id] || 0
      const cantidadActual = cantidadBackend + cantidadLocal

      console.log('[Picking Debug] cantidadBackend:', cantidadBackend)
      console.log('[Picking Debug] cantidadLocal:', cantidadLocal)
      console.log('[Picking Debug] cantidadActual:', cantidadActual)
      console.log('[Picking Debug] cantidadSolicitada:', detalle.cantidadSolicitada)

      // Validar que no exceda la cantidad solicitada
      if (cantidadActual >= detalle.cantidadSolicitada) {
        console.log('[Picking Debug] BLOCKED - cantidad ya completa')
        toast.warning(`${detalle.codItem} ya tiene la cantidad completa (${cantidadActual}/${detalle.cantidadSolicitada}). Presione OK para confirmar.`)
        return prev // No cambiar estado
      }

      // Incrementar contador
      const nuevaCantidadLocal = cantidadLocal + 1
      const nuevaCantidadTotal = cantidadBackend + nuevaCantidadLocal

      console.log('[Picking Debug] nuevaCantidadLocal:', nuevaCantidadLocal)
      console.log('[Picking Debug] nuevaCantidadTotal:', nuevaCantidadTotal)

      // Mostrar progreso
      toast.success(`${detalle.codItem}: ${nuevaCantidadTotal}/${detalle.cantidadSolicitada} unidades`)

      const newState = {
        ...prev,
        [detalle.id]: nuevaCantidadLocal
      }
      console.log('[Picking Debug] New state:', JSON.stringify(newState))
      return newState
    })

    // Limpiar input
    setScanInput("")
  }


  const handleScan = async () => {
    await processScannedCode(scanInput)
  }

  // Callback del modal de cámara
  const handleCameraScan = async (code: string) => {
    setIsScannerModalOpen(false)
    await processScannedCode(code)
  }

  // Sumar +1 al pickeado (botón check en fila cuando está incompleto)
  const handlePickearDirecto = async (detalle: DetalleSalida) => {
    if (!selectedOrden) return

    // Si ya está marcado como PICKEADO en backend, no hacer nada
    if (detalle.estado === EstadoDetalleSalida.PICKEADO) {
      toast.warning("Este item ya fue confirmado como OK")
      return
    }

    // Usar updater function para evitar stale closure
    setLocalPickingProgress(prev => {
      const cantidadBackend = detalle.cantidadPickeada || 0
      const cantidadLocal = prev[detalle.id] || 0
      const cantidadActual = cantidadBackend + cantidadLocal

      // Validar que no exceda la cantidad solicitada
      if (cantidadActual >= detalle.cantidadSolicitada) {
        toast.warning(`${detalle.codItem} ya tiene la cantidad completa. Presione OK para confirmar.`)
        return prev // No cambiar estado
      }

      // Incrementar contador
      const nuevaCantidadLocal = cantidadLocal + 1
      const nuevaCantidadTotal = cantidadBackend + nuevaCantidadLocal

      // Mostrar progreso
      toast.success(`${detalle.codItem}: ${nuevaCantidadTotal}/${detalle.cantidadSolicitada} unidades`)

      return {
        ...prev,
        [detalle.id]: nuevaCantidadLocal
      }
    })
  }

  // Manejar click en fila para poner código en input
  const handleRowClick = (detalle: DetalleSalida) => {
    // Usar código de barra si existe, sino usar código de item
    const codigo = detalle.item?.codigoBarra || detalle.codItem
    setScanInput(codigo)
    // Enfocar el input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Marcar item como OK (enviar al backend cuando está listo)
  const handleMarcarOK = async (detalle: DetalleSalida) => {
    if (!selectedOrden) return

    const cantidadTotal = getCantidadPickeada(detalle)

    // Solo permitir marcar OK si la cantidad está completa
    if (cantidadTotal < detalle.cantidadSolicitada) {
      toast.warning(`Falta completar ${detalle.cantidadSolicitada - cantidadTotal} unidades`)
      return
    }

    // Si ya está marcado como PICKEADO en backend, no hacer nada
    if (detalle.estado === EstadoDetalleSalida.PICKEADO) {
      toast.info("Este item ya está marcado como OK")
      return
    }

    try {
      setProcessing(true)

      // Si es el primer registro, iniciar tiempo
      if ((detalle.cantidadPickeada || 0) === 0) {
        await PickingService.iniciarDetalle(detalle.id, CURRENT_USER)
      }

      // Enviar cantidad total al backend
      await PickingService.pickearDetalle(detalle.id, cantidadTotal, CURRENT_USER)

      toast.success(`✓ ${detalle.codItem} marcado como OK`)

      // Limpiar progreso local para este detalle
      setLocalPickingProgress(prev => {
        const { [detalle.id]: _, ...rest } = prev
        return rest
      })

      await loadOrdenes()
    } catch (error) {
      console.error("Error marcando como OK:", error)
      toast.error(error instanceof Error ? error.message : "Error al marcar item como OK")
    } finally {
      setProcessing(false)
    }
  }



  const handleFinalizarPicking = async () => {
    if (!selectedOrden) return

    try {
      setProcessing(true)
      const result = await PickingService.completarOrden(selectedOrden.id, CURRENT_USER)
      toast.success(`Picking completado para ${selectedOrden.nroDocumento}`)

      // Mostrar comprobante si viene en la respuesta
      if (result.comprobante) {
        setComprobante(result.comprobante as ComprobantePicking)
        setShowComprobante(true)
      }

      setSelectedOrden(null)
      await loadOrdenes()
    } catch (error) {
      console.error("Error finalizando picking:", error)
      toast.error(error instanceof Error ? error.message : "Error al finalizar picking")
    } finally {
      setProcessing(false)
    }
  }

  const handlePrintComprobante = () => {
    window.print()
  }

  return (
    <MainLayout>
      <PageHeader
        title="Picking de Pedidos"
        description="Preparación de pedidos para despacho"
      >
        <div className="flex items-center gap-2">
          {/* Indicador de estado Zebra */}
          <Badge className={zebraConnected ? "bg-green-600" : "bg-gray-600"}>
            <ScanBarcode className="w-3 h-3 mr-1" />
            {zebraConnected ? "Conectado" : "Zebra"}
          </Badge>
          <Button
            variant="outline"
            className="bg-secondary border-border"
            onClick={loadOrdenes}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Picking por Pedido
          </TabsTrigger>
          <TabsTrigger value="consolidado" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Picking Consolidado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Órdenes List */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Órdenes para Picking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : ordenes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay órdenes pendientes</p>
                    </div>
                  ) : (
                    ordenes.map((orden) => (
                      <div
                        key={orden.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedOrden?.id === orden.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/50 hover:bg-secondary"
                          }`}
                        onClick={() => setSelectedOrden(orden)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{orden.nroDocumento}</span>
                          <Badge className={getEstadoColor(orden)}>
                            {getEstadoLabel(orden)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{orden.cliente}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{orden.detalles?.length || 0} items</span>
                            <span>{getProgreso(orden)}%</span>
                          </div>
                          <Progress value={getProgreso(orden)} className="h-2" />
                        </div>
                        {orden.estado === EstadoOrdenSalida.PENDIENTE && (
                          <Button
                            size="sm"
                            className="w-full mt-3 bg-primary text-primary-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIniciarPicking(orden)
                            }}
                            disabled={processing}
                          >
                            {processing ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-1" />
                            )}
                            Iniciar Picking
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Picking Detail */}
            <div className="lg:col-span-2">
              {selectedOrden ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {selectedOrden.nroDocumento}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{selectedOrden.cliente}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEstadoColor(selectedOrden)}>
                          {getProgreso(selectedOrden)}% Completado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scanner Section */}
                    {selectedOrden.estado !== EstadoOrdenSalida.COMPLETADA && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                        {/* Selector de modo de escaneo */}
                        <div className="flex items-center justify-between mb-3">
                          <Label className="flex items-center gap-2">
                            <ScanLine className="w-4 h-4 text-primary" />
                            Modo de Escaneo
                          </Label>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={scanMode === "zebra" ? "default" : "outline"}
                              onClick={() => setScanMode("zebra")}
                              className={`h-8 ${scanMode === "zebra" ? "bg-primary" : "bg-secondary"}`}
                            >
                              <ScanBarcode className="w-4 h-4 mr-1" />
                              Zebra
                            </Button>
                            <Button
                              size="sm"
                              variant={scanMode === "camera" ? "default" : "outline"}
                              onClick={() => {
                                setScanMode("camera")
                                setIsScannerModalOpen(true)
                              }}
                              className={`h-8 ${scanMode === "camera" ? "bg-primary" : "bg-secondary"}`}
                            >
                              <Camera className="w-4 h-4 mr-1" />
                              Cámara
                            </Button>
                            <Button
                              size="sm"
                              variant={scanMode === "manual" ? "default" : "outline"}
                              onClick={() => setScanMode("manual")}
                              className={`h-8 ${scanMode === "manual" ? "bg-primary" : "bg-secondary"}`}
                            >
                              <Keyboard className="w-4 h-4 mr-1" />
                              Manual
                            </Button>
                          </div>
                        </div>

                        {/* Información del modo actual */}
                        {scanMode === "zebra" && (
                          <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-600/50 mb-3">
                            <div className="flex items-center gap-2">
                              <ScanBarcode className="w-5 h-5 text-blue-400" />
                              <div>
                                <p className="text-sm font-medium text-blue-400">Escáner Zebra Activo</p>
                                <p className="text-xs text-blue-400/70">
                                  Escanea cualquier código de producto o ubicación
                                </p>
                              </div>
                            </div>
                            {lastScan && (
                              <div className="mt-2 p-2 bg-black/20 rounded">
                                <span className="text-xs text-muted-foreground">Último escaneo: </span>
                                <span className="text-sm font-mono text-green-400">{lastScan}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {scanMode === "camera" && (
                          <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-600/50 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-purple-400" />
                                <div>
                                  <p className="text-sm font-medium text-purple-400">Cámara del dispositivo</p>
                                  <p className="text-xs text-purple-400/70">
                                    Usa la cámara para escanear códigos
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => setIsScannerModalOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Abrir Cámara
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Input siempre visible para todos los modos */}
                        <div className="flex gap-2">
                          <Input
                            ref={inputRef}
                            placeholder={
                              scanMode === "zebra"
                                ? "Escanea con Zebra o escribe aquí..."
                                : scanMode === "camera"
                                  ? "Usa cámara o escribe aquí..."
                                  : "Ingrese código de producto o ubicación..."
                            }
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleScan()}
                            className="bg-secondary border-border"
                            disabled={processing}
                          />
                          <Button
                            onClick={handleScan}
                            className="bg-primary text-primary-foreground"
                            disabled={processing || !scanInput.trim()}
                          >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary hover:bg-secondary">
                            <TableHead>Producto</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-center">Pickeado</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-20">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrden.detalles?.map((detalle) => (
                            <TableRow
                              key={detalle.id}
                              className={`cursor-pointer transition-colors ${detalle.estado === EstadoDetalleSalida.PICKEADO
                                ? "bg-green-600/10"
                                : "hover:bg-secondary/50"
                                }`}
                              onClick={() => handleRowClick(detalle)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{detalle.codItem}</p>
                                  <p className="text-xs text-muted-foreground">{detalle.item?.descripcion || "-"}</p>
                                  {detalle.item?.codigoBarra && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {detalle.item.codigoBarra}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {detalle.ubicacionOrigen || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-bold">{detalle.cantidadSolicitada}</TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={
                                    isDetalleCompleto(detalle)
                                      ? "text-green-400 font-bold"
                                      : (localPickingProgress[detalle.id] || 0) > 0
                                        ? "text-blue-400"
                                        : "text-yellow-400"
                                  }
                                >
                                  {Math.round(getCantidadPickeada(detalle))}
                                </span>
                              </TableCell>
                              <TableCell>
                                {detalle.estado === EstadoDetalleSalida.PICKEADO ? (
                                  <Badge className="bg-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    OK
                                  </Badge>
                                ) : getCantidadPickeada(detalle) >= detalle.cantidadSolicitada ? (
                                  <Badge className="bg-orange-500">Listo</Badge>
                                ) : (localPickingProgress[detalle.id] || 0) > 0 ? (
                                  <Badge className="bg-blue-600">En Progreso</Badge>
                                ) : (
                                  <Badge className="bg-yellow-600">Pendiente</Badge>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {detalle.estado === EstadoDetalleSalida.PICKEADO ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : getCantidadPickeada(detalle) >= detalle.cantidadSolicitada ? (
                                  /* Cantidad completa - mostrar botón para marcar OK */
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleMarcarOK(detalle)}
                                    disabled={processing}
                                  >
                                    {processing ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        OK
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  /* Cantidad incompleta - botón para sumar +1 */
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handlePickearDirecto(detalle)}
                                    disabled={processing}
                                  >
                                    {processing ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Actions */}
                    {selectedOrden.estado !== EstadoOrdenSalida.COMPLETADA && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="bg-secondary border-border">
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                        <Button
                          onClick={handleFinalizarPicking}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processing}
                        >
                          {processing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Finalizar Picking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Seleccione una orden para iniciar el picking</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consolidado">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Picking Consolidado</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>El picking consolidado agrupa múltiples pedidos para optimizar la preparación</p>
              <Button className="mt-4 bg-primary text-primary-foreground">Crear Consolidado</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scanner Modal para cámara */}
      <ScannerModal
        open={isScannerModalOpen}
        onOpenChange={setIsScannerModalOpen}
        onScanSuccess={handleCameraScan}
      />

      {/* Modal de Comprobante de Picking */}
      <Dialog open={showComprobante} onOpenChange={setShowComprobante}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Comprobante de Picking
              </span>
            </DialogTitle>
          </DialogHeader>

          {comprobante && (
            <div className="space-y-6 print:space-y-4">
              {/* Header del comprobante */}
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nro. Comprobante</p>
                    <p className="font-mono font-bold text-primary">{comprobante.nroComprobante}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                    <p className="font-medium">
                      {new Date(comprobante.fechaEmision).toLocaleString('es-PE')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info de la orden */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Orden de Salida</p>
                  <p className="font-bold text-lg">{comprobante.orden.nroDocumento}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{comprobante.orden.cliente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Destino</p>
                  <p className="font-medium">{comprobante.orden.destino || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Almacén</p>
                  <p className="font-medium">{comprobante.orden.almacen}</p>
                </div>
              </div>

              {/* Info del picking */}
              <div className="bg-green-600/10 rounded-lg p-4 border border-green-600/30">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Picker</p>
                    <p className="font-medium">{comprobante.picking.usuarioPicking}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tiempo Total</p>
                    <p className="font-bold text-green-400">{comprobante.picking.tiempoFormateado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completado</p>
                    <p className="font-medium">
                      {new Date(comprobante.picking.completadoEn).toLocaleTimeString('es-PE')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de items */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead>Producto</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-center">Solicitado</TableHead>
                      <TableHead className="text-center">Pickeado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprobante.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <p className="font-medium">{item.codItem}</p>
                          <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.ubicacionOrigen || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.cantidadSolicitada}</TableCell>
                        <TableCell className="text-center font-bold text-green-400">
                          {item.cantidadPickeada}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totales */}
              <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-4 border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="font-bold text-xl">{comprobante.totales.totalItems}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Unidades</p>
                  <p className="font-bold text-xl text-primary">{comprobante.totales.totalUnidades}</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 print:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowComprobante(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar
                </Button>
                <Button
                  onClick={handlePrintComprobante}
                  className="bg-primary"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
