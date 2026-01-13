"use client"

import { useState, useRef, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScannerInput } from "@/components/scanner/scanner-input"
import {
  ScanLine,
  Package,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  Smartphone,
  RotateCcw,
  ChevronRight,
  Hash,
} from "lucide-react"

interface ConteoItem {
  id: string
  codigo: string
  descripcion: string
  ubicacion: string
  stockSistema: number
  conteoFisico: number
  diferencia: number
  estado: "Pendiente" | "Contado" | "Verificado"
}

const conteosData: ConteoItem[] = [
  {
    id: "1",
    codigo: "PROD-001",
    descripcion: "Producto A Premium - Caja x 24 unidades",
    ubicacion: "A-01-01",
    stockSistema: 150,
    conteoFisico: 0,
    diferencia: 0,
    estado: "Pendiente",
  },
  {
    id: "2",
    codigo: "PROD-002",
    descripcion: "Producto B Estándar - Pack x 12",
    ubicacion: "A-01-02",
    stockSistema: 280,
    conteoFisico: 0,
    diferencia: 0,
    estado: "Pendiente",
  },
  {
    id: "3",
    codigo: "PROD-003",
    descripcion: "Producto C Básico - Unidad",
    ubicacion: "A-02-01",
    stockSistema: 95,
    conteoFisico: 0,
    diferencia: 0,
    estado: "Pendiente",
  },
]

type ScanStep = "ubicacion" | "producto" | "cantidad"

export default function CapturaInventarioPage() {
  const [conteos, setConteos] = useState<ConteoItem[]>(conteosData)
  const [selectedInventario, setSelectedInventario] = useState("INV-2025-001")
  const [currentStep, setCurrentStep] = useState<ScanStep>("ubicacion")
  const [scannedUbicacion, setScannedUbicacion] = useState("")
  const [scannedProducto, setScannedProducto] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [currentItem, setCurrentItem] = useState<ConteoItem | null>(null)
  const [lastValidation, setLastValidation] = useState<{ step: ScanStep; valid: boolean } | null>(null)

  const cantidadRef = useRef<HTMLInputElement>(null)

  const pendientes = conteos.filter((c) => c.estado === "Pendiente").length
  const contados = conteos.filter((c) => c.estado === "Contado").length
  const verificados = conteos.filter((c) => c.estado === "Verificado").length

  // Auto-focus on cantidad when step changes
  useEffect(() => {
    if (currentStep === "cantidad" && cantidadRef.current) {
      cantidadRef.current.focus()
    }
  }, [currentStep])

  const handleUbicacionScan = (value: string) => {
    setScannedUbicacion(value)
    const item = conteos.find((c) => c.ubicacion.toUpperCase() === value.toUpperCase() && c.estado === "Pendiente")
    if (item) {
      setCurrentItem(item)
      setCurrentStep("producto")
      setLastValidation({ step: "ubicacion", valid: true })
    }
  }

  const handleProductoScan = (value: string) => {
    setScannedProducto(value)
    if (currentItem && value.toUpperCase() === currentItem.codigo.toUpperCase()) {
      setCurrentStep("cantidad")
      setLastValidation({ step: "producto", valid: true })
    }
  }

  const handleProductoValidation = (isValid: boolean) => {
    setLastValidation({ step: "producto", valid: isValid })
    if (!isValid) {
      // Stay on producto step for retry
      setScannedProducto("")
    }
  }

  const handleGuardarConteo = () => {
    if (!currentItem || !cantidad) return

    const cantidadNum = Number.parseInt(cantidad)
    setConteos(
      conteos.map((c) =>
        c.id === currentItem.id
          ? {
              ...c,
              conteoFisico: cantidadNum,
              diferencia: cantidadNum - c.stockSistema,
              estado: "Contado" as const,
            }
          : c,
      ),
    )

    // Reset for next item
    handleReset()
  }

  const handleReset = () => {
    setCurrentStep("ubicacion")
    setScannedUbicacion("")
    setScannedProducto("")
    setCantidad("")
    setCurrentItem(null)
    setLastValidation(null)
  }

  const getStepIndicator = (step: ScanStep, index: number) => {
    const steps: ScanStep[] = ["ubicacion", "producto", "cantidad"]
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    if (stepIndex < currentIndex) {
      return (
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
      )
    } else if (stepIndex === currentIndex) {
      return (
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-lg">{index + 1}</span>
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground font-bold text-lg">{index + 1}</span>
        </div>
      )
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Captura de Inventario"
          description="Conteo físico mediante escaneo industrial (PDA)"
          icon={<ScanLine className="h-6 w-6" />}
        />

        {/* Stats - Touch friendly */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-amber-500 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs sm:text-sm">Pendientes</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{pendientes}</p>
                </div>
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Contados</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{contados}</p>
                </div>
                <Package className="h-8 w-8 sm:h-10 sm:w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Verificados</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">{verificados}</p>
                </div>
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-600 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Progreso</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">
                    {Math.round(((contados + verificados) / conteos.length) * 100)}%
                  </p>
                </div>
                <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Scanner Panel - Industrial PDA Style */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <ScanLine className="h-6 w-6 text-orange-500" />
                Panel de Escaneo
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedInventario} onValueChange={setSelectedInventario}>
                  <SelectTrigger className="w-[180px] sm:w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INV-2025-001">INV-2025-001 - General</SelectItem>
                    <SelectItem value="INV-2025-002">INV-2025-002 - Parcial</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                {getStepIndicator("ubicacion", 0)}
                <span
                  className={`text-sm font-medium ${currentStep === "ubicacion" ? "text-orange-500" : "text-muted-foreground"}`}
                >
                  Ubicación
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                {getStepIndicator("producto", 1)}
                <span
                  className={`text-sm font-medium ${currentStep === "producto" ? "text-orange-500" : "text-muted-foreground"}`}
                >
                  Producto
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                {getStepIndicator("cantidad", 2)}
                <span
                  className={`text-sm font-medium ${currentStep === "cantidad" ? "text-orange-500" : "text-muted-foreground"}`}
                >
                  Cantidad
                </span>
              </div>
            </div>

            {/* Current Item Info */}
            {currentItem && (
              <Card className="bg-muted/30 border-orange-500/30 mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-2">Item Actual</Badge>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{currentItem.codigo}</h3>
                      <p className="text-base sm:text-lg text-muted-foreground">{currentItem.descripcion}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="font-mono text-foreground">{currentItem.ubicacion}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 text-center sm:text-right">
                      <div className="bg-background p-3 sm:p-4 rounded-lg flex-1 sm:flex-none">
                        <p className="text-xs text-muted-foreground">Stock Sistema</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{currentItem.stockSistema}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scanner Inputs - Large Touch-Friendly */}
            <div className="space-y-6">
              {/* Step 1: Ubicación */}
              <ScannerInput
                label="1. Escanear Ubicación"
                value={scannedUbicacion}
                onScan={handleUbicacionScan}
                placeholder="Escanee el código de ubicación (ej: A-01-01)"
                disabled={currentStep !== "ubicacion"}
                autoFocus={currentStep === "ubicacion"}
                readOnly={true}
              />

              {/* Step 2: Producto */}
              <ScannerInput
                label="2. Escanear Producto"
                value={scannedProducto}
                expectedValue={currentItem?.codigo}
                onScan={handleProductoScan}
                onValidation={handleProductoValidation}
                placeholder="Escanee el código del producto"
                disabled={currentStep !== "producto"}
                autoFocus={currentStep === "producto"}
                readOnly={true}
              />

              {/* Step 3: Cantidad */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  3. Ingresar Cantidad Contada
                </Label>
                <div className="flex gap-3">
                  <Input
                    ref={cantidadRef}
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0"
                    disabled={currentStep !== "cantidad"}
                    className="h-14 text-2xl sm:text-3xl font-mono text-center flex-1"
                    min="0"
                  />
                  <Button
                    onClick={handleGuardarConteo}
                    disabled={currentStep !== "cantidad" || !cantidad}
                    className="h-14 px-6 sm:px-8 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List - Touch friendly */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Items Pendientes de Conteo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {conteos
                .filter((c) => c.estado === "Pendiente")
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleReset()
                      setScannedUbicacion(item.ubicacion)
                      setCurrentItem(item)
                      setCurrentStep("producto")
                    }}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Package className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base sm:text-lg">{item.codigo}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.descripcion}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-mono">{item.ubicacion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{item.stockSistema}</p>
                    </div>
                  </button>
                ))}
              {conteos.filter((c) => c.estado === "Pendiente").length === 0 && (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground">Todos los items han sido contados</p>
                  <p className="text-sm text-muted-foreground">No hay items pendientes de conteo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
