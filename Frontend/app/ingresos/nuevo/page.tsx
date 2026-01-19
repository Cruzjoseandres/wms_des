"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useIngresosStore, type IngresoItem } from "@/lib/stores/ingresos-store"
import { Search, Loader2, CheckCircle2, AlertCircle, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { AlmacenService, type AlmacenBackend } from "@/lib/api/almacen.service"
import { cn } from "@/lib/utils"

// Mock API products (para tab externo)
const MOCK_API_DOCS: Record<string, IngresoItem[]> = {
  "SAP-2024-001": [
    {
      id: "i1",
      producto: "PRD-001",
      descripcion: "Semilla Soja Premium Variety A",
      cantidad: 100,
      lote: "L2025-100",
      vencimiento: "2026-06-30",
    },
    {
      id: "i2",
      producto: "PRD-002",
      descripcion: "Fertilizante NPK 10-10-10",
      cantidad: 50,
      lote: "L2025-101",
      vencimiento: "2026-12-31",
    },
  ],
  "SAP-2024-002": [
    {
      id: "i3",
      producto: "PRD-003",
      descripcion: "Herbicida Glifosato Standard",
      cantidad: 200,
      lote: "L2025-102",
      vencimiento: "2025-12-15",
    },
  ],
}

// Mock Internal products (para tab manual/interno)
const MOCK_INTERNAL_DOCS: Record<string, IngresoItem[]> = {
  "INT-2024-001": [
    {
      id: "m1",
      producto: "PRD-LOCAL-01",
      descripcion: "Maíz Híbrido Nacional",
      cantidad: 500,
      lote: "L-INT-001",
      vencimiento: "2025-10-20",
    }
  ]
}

export default function NuevoIngresoPage() {
  const router = useRouter()
  const createIngresoBackend = useIngresosStore((s) => s.createIngresoBackend)

  const [almacenes, setAlmacenes] = useState<AlmacenBackend[]>([])
  const [isLoadingAlmacenes, setIsLoadingAlmacenes] = useState(true)

  // Form States
  const [mode, setMode] = useState<"internal" | "api">("api") // Default to API per instructions if desired, or manual
  const [searchQuery, setSearchQuery] = useState("")
  const [tipoIngreso, setTipoIngreso] = useState("Ingreso de Produccion")
  const [isSearching, setIsSearching] = useState(false)

  const [foundItems, setFoundItems] = useState<IngresoItem[]>([])
  const [foundDocInfo, setFoundDocInfo] = useState<{ doc: string, origen: string } | null>(null)

  const [almacenId, setAlmacenId] = useState<string>("")
  const [observaciones, setObservaciones] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  // Provider Switch Logic
  const [allowWithoutProvider, setAllowWithoutProvider] = useState(false)
  const [proveedorManual, setProveedorManual] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar almacenes y fechas al montar
  useEffect(() => {
    // Set default dates
    const now = new Date();
    const nowString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setFechaInicio(nowString);
    setFechaFin(nowString);

    const loadData = async () => {
      setIsLoadingAlmacenes(true)
      try {
        const data = await AlmacenService.getAll()
        setAlmacenes(data)
        if (data.length > 0) setAlmacenId(String(data[0].id))
      } catch (error) {
        toast.error("Error al cargar almacenes")
      } finally {
        setIsLoadingAlmacenes(false)
      }
    }
    loadData()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Ingrese un número de documento para buscar")
      return
    }

    setIsSearching(true)
    setFoundItems([])
    setFoundDocInfo(null)

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000))

    let result: IngresoItem[] | undefined

    if (mode === "api") {
      result = MOCK_API_DOCS[searchQuery]
    } else {
      // Internal Mode - simulates searching "external_source_docs"
      result = MOCK_INTERNAL_DOCS[searchQuery]
    }

    if (result) {
      setFoundItems(result)
      setFoundDocInfo({
        doc: searchQuery,
        origen: mode === "api" ? "Proveedor Externo API" : "Base Interna SGLA"
      })
      toast.success("Documento encontrado")
    } else {
      toast.error("Documento no encontrado. Verifique el número o cambie de modo.")
    }

    setIsSearching(false)
  }

  const handleSubmit = async () => {
    if (!foundDocInfo || foundItems.length === 0) {
      toast.error("Debe buscar y encontrar un documento válido primero")
      return
    }

    if (!almacenId) {
      toast.error("Seleccione un almacén de destino")
      return
    }

    // Determine Provider Name
    const providerName = allowWithoutProvider ? (proveedorManual || "Sin Proveedor") : foundDocInfo.origen

    setIsSubmitting(true)
    try {
      await createIngresoBackend({
        nroDocumento: foundDocInfo.doc,
        origen: providerName,
        almacenId: Number(almacenId),
        detalles: foundItems.map(item => ({
          productoId: item.producto,
          cantidad: item.cantidad,
          lote: item.lote,
          fechaVencimiento: item.vencimiento,
        })),
        usuario: 'WEB',
        fechaInicio,
        fechaFin,
      })

      toast.success("Recepción Confirmada - Orden Generada (PALETIZADO)")
      router.push("/ingresos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar ingreso")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader title="Recepción de Mercancía" description="Busque documentos de origen para generar órdenes de ingreso." />

      <div className="flex flex-col gap-2 animate-in fade-in duration-500">

        {/* Search & Config Section */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-md">
          <CardHeader className="py-2 px-3 pb-0 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Search className="w-4 h-4 text-primary" />
                Búsqueda de Documento
              </CardTitle>
              {/* Mode Switch Tabs - Moved to Header */}
              <Tabs value={mode} onValueChange={(v) => {
                setMode(v as "internal" | "api")
                setFoundItems([])
                setFoundDocInfo(null)
              }} className="w-[300px]">
                <TabsList className="grid w-full grid-cols-2 h-7">
                  <TabsTrigger value="internal" className="text-xs h-5 px-2">Manual</TabsTrigger>
                  <TabsTrigger value="api" className="text-xs h-5 px-2">API ERP</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-2">

            {/* Tight Search Row */}
            <div className="flex flex-col md:flex-row gap-2 items-center">
              {/* Income Type Selector - Compact */}
              <div className="w-full md:w-64">
                <Select value={tipoIngreso} onValueChange={setTipoIngreso}>
                  <SelectTrigger className="bg-background h-8 text-xs w-full truncate">
                    <SelectValue placeholder="Tipo de Ingreso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingreso de Produccion">Producción</SelectItem>
                    <SelectItem value="Ingreso por Traspaso">Traspaso</SelectItem>
                    <SelectItem value="Ingreso por Importacion">Importación</SelectItem>
                    <SelectItem value="Reingreso de Producto no Despachado">Reingreso No Desp.</SelectItem>
                    <SelectItem value="Ingreso por Anulacion Factura con Devolucion Total">Devolución Total</SelectItem>
                    <SelectItem value="Ingreso por Anulacion Factura con Devolucion Parcial">Devolución Parcial</SelectItem>
                    <SelectItem value="Ingreso por Anulacion Factura con Devolucion con Cambio Producto">Cambio Producto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input - Compact */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={mode === "api" ? "Ej: SAP-2024-001" : "Ej: INT-2024-001"}
                  className="pl-8 h-8 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 shadow-inner w-full"
                />
              </div>

              {/* Action Button - Compact */}
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery}
                className="h-8 px-3 text-xs font-medium shadow-sm w-full md:w-auto"
                size="sm"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "BUSCAR"}
              </Button>

              {/* Provider Config - Compact Inline */}
              <div className="flex items-center gap-2 px-2 border-l border-border/50 ml-1">
                <Switch
                  id="allow-provider"
                  checked={allowWithoutProvider}
                  onCheckedChange={setAllowWithoutProvider}
                  className="scale-75 origin-left"
                />
                <Label htmlFor="allow-provider" className="text-[10px] cursor-pointer whitespace-nowrap text-muted-foreground">
                  Modif. Prov
                </Label>
              </div>
            </div>

            {/* Manual Provider Input - Conditional and Compact */}
            <div className={cn("transition-all duration-300 overflow-hidden px-1", allowWithoutProvider ? "max-h-10 opacity-100" : "max-h-0 opacity-0")}>
              <Input
                placeholder="Nombre del Proveedor (Manual)"
                value={proveedorManual}
                onChange={(e) => setProveedorManual(e.target.value)}
                className="bg-secondary/50 h-7 text-xs"
              />
            </div>

          </CardContent>
        </Card>

        {/* Results List - Compacted */}
        {foundItems.length > 0 && (
          <Card className="border-green-500/30 bg-green-500/5 shadow-sm animate-in slide-in-from-bottom-2">
            <CardHeader className="py-2 px-3 border-b border-green-500/10 min-h-[40px]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Productos Encontrados
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background/50 text-[10px] h-5 px-2">
                    {foundDocInfo?.doc}
                  </Badge>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                    {foundItems.length} ITEMS
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {foundItems.map((item) => (
                  <div key={item.id} className="flex flex-col p-2 rounded bg-background/80 border border-border/50 hover:border-green-500/30 transition-colors shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="bg-secondary px-1.5 rounded text-[10px] font-mono text-muted-foreground">{item.producto}</span>
                      <span className="text-sm font-bold text-foreground">{item.cantidad} <span className="text-[10px] font-normal text-muted-foreground">Und</span></span>
                    </div>
                    <p className="font-medium text-foreground text-xs line-clamp-1 mb-1" title={item.descripcion}>{item.descripcion}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-auto">
                      <span className="truncate">L: <span className="text-foreground">{item.lote}</span></span>
                      <span>•</span>
                      <span className="truncate">V: <span className="text-foreground">{item.vencimiento}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Section - Ultra Compact */}
        <Card className="border-l-2 border-l-primary shadow-md">
          <CardContent className="p-2">
            <div className="flex flex-col md:flex-row gap-3 items-end">

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
                {/* Almacen */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Almacén Destino</Label>
                  <Select value={almacenId} onValueChange={setAlmacenId}>
                    <SelectTrigger disabled={isLoadingAlmacenes} className="bg-background h-8 text-xs">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {almacenes.map(alm => (
                        <SelectItem key={alm.id} value={String(alm.id)} className="text-xs">{alm.descripcion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Inicio</Label>
                  <Input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-background text-[10px] h-8 px-1"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Fin</Label>
                  <Input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-background text-[10px] h-8 px-1"
                  />
                </div>

                {/* Observation */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Notas</Label>
                  <Input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Opcional..."
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="md:w-auto shrink-0 flex flex-col items-center">
                <span className="text-[9px] font-semibold text-primary mb-0.5 tracking-wider">PALETIZADO</span>
                <Button
                  className="w-full md:w-auto text-xs font-bold h-8 px-6 shadow-md transition-all uppercase tracking-wide"
                  onClick={handleSubmit}
                  disabled={foundItems.length === 0 || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-1 w-3 h-3 animate-spin" /> : "Confirmar"}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
