"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tag, Printer, QrCode, Barcode, Search, Package, MapPin, CheckCircle, AlertCircle } from "lucide-react"

interface Producto {
  id: string
  sku: string
  nombre: string
  ubicacion: string
  lote: string
  vencimiento: string
  etiquetado: boolean
  tipoEtiqueta: "barcode" | "qr" | "rfid" | null
}

const mockProductos: Producto[] = [
  {
    id: "1",
    sku: "SKU-001",
    nombre: "Producto Premium A",
    ubicacion: "A-01-02-03",
    lote: "LOT-2024-001",
    vencimiento: "2025-06-15",
    etiquetado: true,
    tipoEtiqueta: "barcode",
  },
  {
    id: "2",
    sku: "SKU-002",
    nombre: "Producto Estándar B",
    ubicacion: "B-02-03-01",
    lote: "LOT-2024-002",
    vencimiento: "2025-03-20",
    etiquetado: true,
    tipoEtiqueta: "qr",
  },
  {
    id: "3",
    sku: "SKU-003",
    nombre: "Producto Especial C",
    ubicacion: "C-01-01-05",
    lote: "LOT-2024-003",
    vencimiento: "2025-12-01",
    etiquetado: false,
    tipoEtiqueta: null,
  },
  {
    id: "4",
    sku: "SKU-004",
    nombre: "Producto Industrial D",
    ubicacion: "A-03-02-02",
    lote: "LOT-2024-004",
    vencimiento: "2024-12-30",
    etiquetado: true,
    tipoEtiqueta: "rfid",
  },
  {
    id: "5",
    sku: "SKU-005",
    nombre: "Producto Básico E",
    ubicacion: "D-01-04-01",
    lote: "LOT-2024-005",
    vencimiento: "2025-08-10",
    etiquetado: false,
    tipoEtiqueta: null,
  },
]

export default function EtiquetadoPage() {
  const [productos, setProductos] = useState<Producto[]>(mockProductos)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEtiquetado, setFilterEtiquetado] = useState<string>("todos")
  const [selectedProductos, setSelectedProductos] = useState<string[]>([])
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printConfig, setPrintConfig] = useState({
    tipo: "barcode",
    cantidad: 1,
    incluirLote: true,
    incluirVencimiento: true,
    incluirUbicacion: false,
  })

  const stats = {
    total: productos.length,
    etiquetados: productos.filter((p) => p.etiquetado).length,
    sinEtiquetar: productos.filter((p) => !p.etiquetado).length,
    barcode: productos.filter((p) => p.tipoEtiqueta === "barcode").length,
    qr: productos.filter((p) => p.tipoEtiqueta === "qr").length,
    rfid: productos.filter((p) => p.tipoEtiqueta === "rfid").length,
  }

  const filteredProductos = productos.filter((p) => {
    const matchSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lote.toLowerCase().includes(searchTerm.toLowerCase())
    const matchFilter =
      filterEtiquetado === "todos" ||
      (filterEtiquetado === "etiquetado" && p.etiquetado) ||
      (filterEtiquetado === "sin-etiquetar" && !p.etiquetado)
    return matchSearch && matchFilter
  })

  const toggleSelect = (id: string) => {
    setSelectedProductos((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const selectAll = () => {
    if (selectedProductos.length === filteredProductos.length) {
      setSelectedProductos([])
    } else {
      setSelectedProductos(filteredProductos.map((p) => p.id))
    }
  }

  const handlePrint = () => {
    // Mark selected products as labeled
    setProductos(
      productos.map((p) =>
        selectedProductos.includes(p.id)
          ? { ...p, etiquetado: true, tipoEtiqueta: printConfig.tipo as Producto["tipoEtiqueta"] }
          : p,
      ),
    )
    setSelectedProductos([])
    setIsPrintModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader title="Etiquetado de Productos" description="Gestión e impresión de etiquetas" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Productos</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-500">{stats.etiquetados}</p>
            <p className="text-xs text-muted-foreground">Etiquetados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-500">{stats.sinEtiquetar}</p>
            <p className="text-xs text-muted-foreground">Sin Etiquetar</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Barcode className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.barcode}</p>
            <p className="text-xs text-muted-foreground">Código Barras</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <QrCode className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
            <p className="text-2xl font-bold">{stats.qr}</p>
            <p className="text-xs text-muted-foreground">Código QR</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Tag className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{stats.rfid}</p>
            <p className="text-xs text-muted-foreground">RFID</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="relative min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar SKU, nombre o lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Select value={filterEtiquetado} onValueChange={setFilterEtiquetado}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="etiquetado">Etiquetados</SelectItem>
                  <SelectItem value="sin-etiquetar">Sin Etiquetar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={selectAll} className="border-border bg-transparent">
                {selectedProductos.length === filteredProductos.length ? "Deseleccionar" : "Seleccionar Todos"}
              </Button>
              <Button
                onClick={() => setIsPrintModalOpen(true)}
                disabled={selectedProductos.length === 0}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Etiquetas ({selectedProductos.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProductos.map((producto) => (
          <Card
            key={producto.id}
            className={`cursor-pointer transition-all ${
              selectedProductos.includes(producto.id)
                ? "border-orange-500 bg-orange-500/10"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => toggleSelect(producto.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{producto.nombre}</p>
                  <p className="text-sm text-muted-foreground">{producto.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  {producto.etiquetado ? (
                    <Badge className="bg-green-600">
                      {producto.tipoEtiqueta === "barcode" && <Barcode className="w-3 h-3 mr-1" />}
                      {producto.tipoEtiqueta === "qr" && <QrCode className="w-3 h-3 mr-1" />}
                      {producto.tipoEtiqueta === "rfid" && <Tag className="w-3 h-3 mr-1" />}
                      {producto.tipoEtiqueta?.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      Sin Etiqueta
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{producto.ubicacion}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Lote: {producto.lote}</span>
                  <span>Venc: {producto.vencimiento}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print Configuration Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Configuración de Impresión
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Se imprimirán etiquetas para{" "}
                <span className="font-bold text-foreground">{selectedProductos.length}</span> productos seleccionados
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Etiqueta</Label>
              <Select value={printConfig.tipo} onValueChange={(v) => setPrintConfig({ ...printConfig, tipo: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barcode">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      Código de Barras
                    </div>
                  </SelectItem>
                  <SelectItem value="qr">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Código QR
                    </div>
                  </SelectItem>
                  <SelectItem value="rfid">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Etiqueta RFID
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad por Producto</Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                max={100}
                value={printConfig.cantidad}
                onChange={(e) => setPrintConfig({ ...printConfig, cantidad: Number.parseInt(e.target.value) || 1 })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-3">
              <Label>Incluir en Etiqueta</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printConfig.incluirLote}
                    onChange={(e) => setPrintConfig({ ...printConfig, incluirLote: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Número de Lote</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printConfig.incluirVencimiento}
                    onChange={(e) => setPrintConfig({ ...printConfig, incluirVencimiento: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Fecha de Vencimiento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printConfig.incluirUbicacion}
                    onChange={(e) => setPrintConfig({ ...printConfig, incluirUbicacion: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Ubicación de Almacén</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-white border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Vista Previa</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <div className="text-center">
                  {printConfig.tipo === "barcode" && (
                    <div className="space-y-2">
                      <div className="flex gap-0.5 justify-center">
                        {[...Array(30)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-black"
                            style={{ width: Math.random() > 0.5 ? 2 : 1, height: 40 }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 font-mono">SKU-001</p>
                    </div>
                  )}
                  {printConfig.tipo === "qr" && (
                    <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-800" />
                    </div>
                  )}
                  {printConfig.tipo === "rfid" && (
                    <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg p-4 border border-orange-300">
                      <Tag className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs text-orange-800 font-mono">RFID TAG</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir {selectedProductos.length * printConfig.cantidad} Etiquetas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
