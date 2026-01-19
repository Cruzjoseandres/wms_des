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
import { Checkbox } from "@/components/ui/checkbox"
import { useIngresosStore, type IngresoItem } from "@/lib/stores/ingresos-store"
import { Search, Loader2, CheckCircle2, AlertCircle, CalendarDays, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { AlmacenService, type AlmacenBackend } from "@/lib/api/almacen.service"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { DocumentoExternoService, type DocumentoExterno } from "@/lib/api/documento_externo.service"

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
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [foundDocInfo, setFoundDocInfo] = useState<{ id: number, doc: string, origen: string } | null>(null)

  const [almacenId, setAlmacenId] = useState<string>("")
  const [observaciones, setObservaciones] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  // Provider Switch Logic
  const [allowWithoutProvider, setAllowWithoutProvider] = useState(false)
  const [proveedorManual, setProveedorManual] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal de error duplicado
  const [showDuplicateError, setShowDuplicateError] = useState(false)
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState("")

  // Autocompletado de documentos
  const [suggestions, setSuggestions] = useState<DocumentoExterno[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

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

  // Buscar sugerencias mientras escribe (con debounce)
  useEffect(() => {
    const tipoFuente = mode === "api" ? "API_ERP" : "MANUAL"

    // Si el texto es muy corto, limpiar sugerencias
    if (searchQuery.length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Debounce de 300ms
    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const docs = await DocumentoExternoService.listar(searchQuery, tipoFuente)
        setSuggestions(docs)
        setShowSuggestions(docs.length > 0)
      } catch (error) {
        console.error("Error al buscar sugerencias:", error)
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, mode])

  // Seleccionar una sugerencia del dropdown
  const handleSelectSuggestion = (doc: DocumentoExterno) => {
    setSearchQuery(doc.nroDocumento)
    setShowSuggestions(false)

    // Cargar directamente los datos del documento seleccionado
    const mappedItems: IngresoItem[] = doc.items.map((d, index) => ({
      id: `gen-${Date.now()}-${index}`,
      producto: d.codItem,
      descripcion: d.descripcion,
      cantidad: Number(d.cantidad),
      lote: d.lote || "",
      vencimiento: d.fechaVencimiento ? d.fechaVencimiento.split("T")[0] : "",
    }))

    setFoundItems(mappedItems)
    setSelectedItemIds(new Set(mappedItems.map(item => item.id)))
    setFoundDocInfo({
      id: doc.id,
      doc: doc.nroDocumento,
      origen: doc.proveedor
    })
    toast.success("Documento seleccionado")
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Ingrese un número de documento para buscar")
      return
    }

    setIsSearching(true)
    setFoundItems([])
    setFoundDocInfo(null)

    // Simulate API delay
    // await new Promise(r => setTimeout(r, 1000)) // Removed delay

    try {
      const tipoFuente = mode === "api" ? "API_ERP" : "MANUAL"
      const docExterno = await DocumentoExternoService.buscar(searchQuery, tipoFuente)

      // DEBUG: Ver estructura de la respuesta
      console.log("Respuesta de la API:", docExterno)
      console.log("Items:", docExterno.items)

      // Validar que items exista y sea un array
      if (!docExterno.items || !Array.isArray(docExterno.items)) {
        toast.error("El documento no contiene detalles de productos")
        setIsSearching(false)
        return
      }

      // Map backend response to frontend items
      const mappedItems: IngresoItem[] = docExterno.items.map((d, index) => ({
        id: `gen-${Date.now()}-${index}`,
        producto: d.codItem,
        descripcion: d.descripcion,
        cantidad: Number(d.cantidad),
        lote: d.lote || "",
        vencimiento: d.fechaVencimiento ? d.fechaVencimiento.split("T")[0] : "",
      }))

      setFoundItems(mappedItems)
      // Seleccionar todos los items por defecto
      setSelectedItemIds(new Set(mappedItems.map(item => item.id)))
      setFoundDocInfo({
        id: docExterno.id,
        doc: docExterno.nroDocumento,
        origen: docExterno.proveedor
      })
      toast.success("Documento encontrado")

    } catch (error) {
      console.error(error)
      toast.error("Documento no encontrado. Verifique el número o cambie de modo.")
      setFoundItems([])
    }

    setIsSearching(false)
  }

  // Funciones para manejar selección de items
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedItemIds.size === foundItems.length) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(foundItems.map(item => item.id)))
    }
  }

  const selectedItems = foundItems.filter(item => selectedItemIds.has(item.id))

  const handleSubmit = async () => {
    if (!foundDocInfo || foundItems.length === 0) {
      toast.error("Debe buscar y encontrar un documento válido primero")
      return
    }

    if (selectedItems.length === 0) {
      toast.error("Debe seleccionar al menos un producto")
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
        sourceDocId: foundDocInfo.id,
        detalles: selectedItems.map(item => ({
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
      const errorMessage = error instanceof Error ? error.message : "Error al registrar ingreso"

      // Detectar si es un error de documento duplicado
      if (errorMessage.toLowerCase().includes("duplicado") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("ya existe") ||
        errorMessage.toLowerCase().includes("already exists")) {
        // Mostrar modal de error duplicado
        setDuplicateErrorMessage(errorMessage)
        setShowDuplicateError(true)
      } else {
        toast.error(errorMessage)
      }
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

              {/* Search Input with Autocomplete */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 z-10" />
                {isLoadingSuggestions && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 animate-spin" />
                )}
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSuggestions(false)
                      handleSearch()
                    }
                    if (e.key === "Escape") {
                      setShowSuggestions(false)
                    }
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={mode === "api" ? "Ej: SAP-2024-001" : "Ej: INT-2024-001"}
                  className="pl-8 h-8 text-xs bg-background border-primary/30 focus-visible:ring-primary/50 shadow-inner w-full"
                />

                {/* Dropdown de sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectSuggestion(doc)}
                        className="px-3 py-2 hover:bg-primary/10 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-foreground">{doc.nroDocumento}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {doc.tipoFuente === "API_ERP" ? "API" : "Manual"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[10px] text-muted-foreground truncate">{doc.proveedor}</span>
                          <span className="text-[10px] text-muted-foreground">{doc.items?.length || 0} items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Overlay para cerrar sugerencias al hacer clic fuera */}
                {showSuggestions && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSuggestions(false)}
                  />
                )}
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
                  {/* Botón Seleccionar/Deseleccionar Todos */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="h-5 px-2 text-[10px] hover:bg-green-500/10"
                  >
                    {selectedItemIds.size === foundItems.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                  </Button>
                  <Badge variant="outline" className="bg-background/50 text-[10px] h-5 px-2">
                    {foundDocInfo?.doc}
                  </Badge>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                    {selectedItemIds.size}/{foundItems.length} SELECCIONADOS
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {foundItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={cn(
                        "flex flex-col p-2 rounded bg-background/80 border transition-all shadow-sm cursor-pointer",
                        isSelected
                          ? "border-green-500/50 hover:border-green-500"
                          : "border-border/30 opacity-50 hover:opacity-75"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            className="h-4 w-4"
                          />
                          <span className="bg-secondary px-1.5 rounded text-[10px] font-mono text-muted-foreground">{item.producto}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">{item.cantidad} <span className="text-[10px] font-normal text-muted-foreground">Und</span></span>
                      </div>
                      <p className="font-medium text-foreground text-xs line-clamp-1 mb-1 ml-6" title={item.descripcion}>{item.descripcion}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-auto ml-6">
                        <span className="truncate">L: <span className="text-foreground">{item.lote}</span></span>
                        <span>•</span>
                        <span className="truncate">V: <span className="text-foreground">{item.vencimiento}</span></span>
                      </div>
                    </div>
                  )
                })}
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

      {/* Modal de Error - Documento Duplicado */}
      <Dialog open={showDuplicateError} onOpenChange={setShowDuplicateError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-red-600 dark:text-red-400">
                  Documento Duplicado
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  No se puede crear la nota de ingreso
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {duplicateErrorMessage}
              </p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Por favor, verifique el número de documento o consulte la nota de ingreso existente en el listado.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowDuplicateError(false)}
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
