"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useIngresosStore, type IngresoTipo, type IngresoItem } from "@/lib/stores/ingresos-store"
import { Plus, Trash2, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ItemService, type ItemBackend } from "@/lib/api/item.service"
import { AlmacenService, type AlmacenBackend } from "@/lib/api/almacen.service"

// Mock API products (para tab externo) - Simula productos de API externa
const MOCK_API_DOCS: Record<string, IngresoItem[]> = {
  // Orden de proveedor farmacéutico
  "SAP-2024-001": [
    {
      id: "api-1",
      producto: "MED-001",
      descripcion: "Paracetamol 500mg x 100 tabletas",
      cantidad: 500,
      lote: "LOTE-F2025-001",
      vencimiento: "2027-03-15",
    },
    {
      id: "api-2",
      producto: "MED-002",
      descripcion: "Ibuprofeno 400mg x 50 cápsulas",
      cantidad: 300,
      lote: "LOTE-F2025-002",
      vencimiento: "2026-11-30",
    },
    {
      id: "api-3",
      producto: "MED-003",
      descripcion: "Omeprazol 20mg x 28 cápsulas",
      cantidad: 200,
      lote: "LOTE-F2025-003",
      vencimiento: "2026-08-20",
    },
  ],
  // Orden de proveedor electrónico
  "SAP-2024-002": [
    {
      id: "api-4",
      producto: "ELEC-001",
      descripcion: "Cable USB-C 1.5m Alta Velocidad",
      cantidad: 1000,
      lote: "LOTE-E2025-001",
      vencimiento: "",
    },
    {
      id: "api-5",
      producto: "ELEC-002",
      descripcion: "Cargador Rápido 65W USB-C",
      cantidad: 250,
      lote: "LOTE-E2025-002",
      vencimiento: "",
    },
  ],
  // Orden de proveedor de alimentos
  "SAP-2024-003": [
    {
      id: "api-6",
      producto: "ALIM-001",
      descripcion: "Leche Entera UHT 1L",
      cantidad: 2000,
      lote: "LOTE-A2025-001",
      vencimiento: "2025-06-15",
    },
    {
      id: "api-7",
      producto: "ALIM-002",
      descripcion: "Aceite de Oliva Extra Virgen 500ml",
      cantidad: 400,
      lote: "LOTE-A2025-002",
      vencimiento: "2026-12-01",
    },
    {
      id: "api-8",
      producto: "ALIM-003",
      descripcion: "Arroz Integral Premium 1kg",
      cantidad: 800,
      lote: "LOTE-A2025-003",
      vencimiento: "2026-02-28",
    },
    {
      id: "api-9",
      producto: "ALIM-004",
      descripcion: "Atún en Aceite Lata 170g",
      cantidad: 1500,
      lote: "LOTE-A2025-004",
      vencimiento: "2027-09-10",
    },
  ],
  // Orden mixta grande
  "SAP-2024-004": [
    {
      id: "api-10",
      producto: "GEN-001",
      descripcion: "Detergente Líquido Concentrado 2L",
      cantidad: 600,
      lote: "LOTE-G2025-001",
      vencimiento: "2027-01-15",
    },
    {
      id: "api-11",
      producto: "GEN-002",
      descripcion: "Papel Higiénico Doble Hoja x12",
      cantidad: 1200,
      lote: "LOTE-G2025-002",
      vencimiento: "",
    },
    {
      id: "api-12",
      producto: "GEN-003",
      descripcion: "Jabón Antibacterial Líquido 500ml",
      cantidad: 450,
      lote: "LOTE-G2025-003",
      vencimiento: "2026-05-20",
    },
  ],
}

export default function NuevoIngresoPage() {
  const router = useRouter()
  const createIngresoBackend = useIngresosStore((s) => s.createIngresoBackend)

  // Datos del catálogo cargados desde el backend
  const [catalogItems, setCatalogItems] = useState<ItemBackend[]>([])
  const [almacenes, setAlmacenes] = useState<AlmacenBackend[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)

  const [tab, setTab] = useState<"manual" | "externo">("manual")
  const [tipo, setTipo] = useState<IngresoTipo>("produccion")
  const [origen, setOrigen] = useState("")
  const [nroDocumento, setNroDocumento] = useState("")
  const [almacenId, setAlmacenId] = useState<string>("")
  const [observaciones, setObservaciones] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<IngresoItem[]>([
    { id: "1", producto: "", descripcion: "", cantidad: 0, lote: "", vencimiento: "" },
  ])

  // Cargar catálogo de items y almacenes al montar
  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoadingCatalog(true)
      try {
        const [itemsData, almacenesData] = await Promise.all([
          ItemService.getAll(),
          AlmacenService.getAll(),
        ])
        setCatalogItems(itemsData)
        setAlmacenes(almacenesData)
        // Seleccionar primer almacén por defecto
        if (almacenesData.length > 0) {
          setAlmacenId(String(almacenesData[0].id))
        }
      } catch (error) {
        toast.error("Error al cargar el catálogo de productos")
        console.error(error)
      } finally {
        setIsLoadingCatalog(false)
      }
    }
    loadCatalog()
  }, [])

  // Externo (Mock API)
  const [docSearch, setDocSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [apiItems, setApiItems] = useState<IngresoItem[]>([])
  const [apiFound, setApiFound] = useState(false)

  const handleSearchApi = async () => {
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (MOCK_API_DOCS[docSearch]) {
      setApiItems(MOCK_API_DOCS[docSearch])
      setApiFound(true)
    } else {
      setApiItems([])
      setApiFound(false)
      toast.error("Documento no encontrado en sistema externo")
    }
    setIsSearching(false)
  }

  const handleAddItemManual = () => {
    setItems([
      ...items,
      { id: String(Date.now()), producto: "", descripcion: "", cantidad: 0, lote: "", vencimiento: "" },
    ])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const handleUpdateItem = (id: string, field: keyof IngresoItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  // Función para actualizar items de la API externa (cantidad, lote, vencimiento)
  const handleUpdateApiItem = (id: string, field: keyof IngresoItem, value: string | number) => {
    setApiItems(apiItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSubmit = async () => {
    const itemsToSave = tab === "externo" ? apiItems : items

    if (!origen || !nroDocumento || !almacenId || itemsToSave.length === 0) {
      toast.error("Complete todos los campos requeridos (documento, origen, almacén y productos)")
      return
    }

    // Validar que los items tengan producto y cantidad
    const invalidItems = itemsToSave.filter(i => !i.producto || i.cantidad <= 0)
    if (invalidItems.length > 0) {
      toast.error("Todos los productos deben tener código y cantidad mayor a 0")
      return
    }

    setIsSubmitting(true)
    try {
      await createIngresoBackend({
        nroDocumento,
        origen,
        almacenId: Number(almacenId),
        detalles: itemsToSave.map(item => ({
          productoId: item.producto,
          cantidad: item.cantidad,
          lote: item.lote || undefined,
          fechaVencimiento: item.vencimiento || undefined,
        })),
      })
      toast.success("Ingreso registrado correctamente")
      router.push("/ingresos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar el ingreso")
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <MainLayout>
      <PageHeader title="Registrar Nuevo Ingreso" description="Agregue un nuevo ingreso al almacén" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Información del Ingreso</CardTitle>
              <CardDescription>Datos generales del ingreso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCatalog ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando catálogo...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nro. Documento *</Label>
                      <Input
                        value={nroDocumento}
                        onChange={(e) => setNroDocumento(e.target.value)}
                        placeholder="Ej: ING-2025-001"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Origen/Proveedor *</Label>
                      <Input
                        value={origen}
                        onChange={(e) => setOrigen(e.target.value)}
                        placeholder="Ej: Proveedor ABC"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Almacén Destino *</Label>
                    <Select value={almacenId} onValueChange={setAlmacenId}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Seleccione un almacén" />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenes.map((alm) => (
                          <SelectItem key={alm.id} value={String(alm.id)}>
                            {alm.codigo} - {alm.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {almacenes.length === 0 && (
                      <p className="text-xs text-red-400">No hay almacenes disponibles. Cree uno primero.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas adicionales..."
                      className="bg-secondary border-border"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tabs: Manual vs Externo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Detalle de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as "manual" | "externo")}>
                <TabsList className="grid w-full grid-cols-2 bg-secondary">
                  <TabsTrigger value="manual">Manual (SGLA)</TabsTrigger>
                  <TabsTrigger value="externo">Importar Externo (API)</TabsTrigger>
                </TabsList>

                {/* Manual Tab */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Productos *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddItemManual}
                      className="bg-secondary border-border"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/50 rounded-lg">
                        <div className="col-span-4 space-y-1">
                          <Label className="text-xs">Producto *</Label>
                          <Select
                            value={item.producto}
                            onValueChange={(v) => handleUpdateItem(item.id, "producto", v)}
                          >
                            <SelectTrigger className="bg-secondary border-border h-9">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogItems.map((catItem) => (
                                <SelectItem key={catItem.id} value={catItem.codigo}>
                                  {catItem.codigo} - {catItem.descripcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {catalogItems.length === 0 && (
                            <p className="text-xs text-red-400">No hay productos en el catálogo</p>
                          )}
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            value={item.cantidad || ""}
                            onChange={(e) => handleUpdateItem(item.id, "cantidad", Number(e.target.value))}
                            className="bg-secondary border-border h-9"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Lote</Label>
                          <Input
                            value={item.lote}
                            onChange={(e) => handleUpdateItem(item.id, "lote", e.target.value)}
                            className="bg-secondary border-border h-9"
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Vencimiento</Label>
                          <Input
                            type="date"
                            value={item.vencimiento}
                            onChange={(e) => handleUpdateItem(item.id, "vencimiento", e.target.value)}
                            className="bg-secondary border-border h-9"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length === 1}
                            className="h-9 w-9 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Externo Tab */}
                <TabsContent value="externo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Buscar Documento Externo *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        placeholder="Ej: SAP-2024-001"
                        className="bg-secondary border-border"
                      />
                      <Button
                        onClick={handleSearchApi}
                        disabled={!docSearch || isSearching}
                        className="bg-primary text-primary-foreground"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-1" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Prueba con: SAP-2024-001, SAP-2024-002, SAP-2024-003 o SAP-2024-004</p>
                  </div>

                  {apiFound && (
                    <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                      <p className="font-medium text-green-400">Documento encontrado</p>
                      <p className="text-sm text-green-300">{apiItems.length} productos cargados</p>
                    </div>
                  )}

                  {apiItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Productos del Documento (Editables)</Label>
                        <span className="text-xs text-muted-foreground">
                          Puede modificar cantidad, lote y vencimiento
                        </span>
                      </div>
                      <div className="space-y-3">
                        {apiItems.map((item) => (
                          <div key={item.id} className="p-4 bg-secondary/50 rounded-lg space-y-3">
                            {/* Info del producto (solo lectura) */}
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <div>
                                <span className="font-medium text-primary">{item.producto}</span>
                                <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                              </div>
                            </div>

                            {/* Campos editables */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Cantidad *</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.cantidad || ""}
                                  onChange={(e) => handleUpdateApiItem(item.id, "cantidad", Number(e.target.value))}
                                  className="bg-secondary border-border h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Lote</Label>
                                <Input
                                  value={item.lote}
                                  onChange={(e) => handleUpdateApiItem(item.id, "lote", e.target.value)}
                                  placeholder="Ej: LOTE-2025-001"
                                  className="bg-secondary border-border h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Fecha Vencimiento</Label>
                                <Input
                                  type="date"
                                  value={item.vencimiento}
                                  onChange={(e) => handleUpdateApiItem(item.id, "vencimiento", e.target.value)}
                                  className="bg-secondary border-border h-9"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="bg-card border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">
                    {tipo === "produccion"
                      ? "Producción"
                      : tipo === "traspaso"
                        ? "Traspaso"
                        : tipo === "reingreso"
                          ? "Reingreso"
                          : "Anulación"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origen</span>
                  <span className="font-medium">{origen || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Productos</span>
                  <span className="font-medium">{tab === "externo" ? apiItems.length : items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad Total</span>
                  <span className="font-medium">
                    {(tab === "externo" ? apiItems : items).reduce((sum, i) => sum + i.cantidad, 0)}
                  </span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <p className="text-xs text-muted-foreground mb-2">Estado inicial</p>
                <p className="font-medium text-primary">PALETIZADO</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Confirmar Recepción"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full bg-secondary border-border"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
