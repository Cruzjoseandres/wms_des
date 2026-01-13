"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tag, Printer, Package, Plus, Search, CheckCircle, AlertCircle, Radio, Link, Unlink } from "lucide-react"

interface ProductoEtiqueta {
  id: string
  codigo: string
  descripcion: string
  tagRFID?: string
  estadoTag: "Sin Tag" | "Asignado" | "Error"
  fechaAsignacion?: string
}

const productosData: ProductoEtiqueta[] = [
  {
    id: "1",
    codigo: "PROD-001",
    descripcion: "Producto A Premium",
    tagRFID: "E200001234567890ABCD",
    estadoTag: "Asignado",
    fechaAsignacion: "2025-01-05",
  },
  {
    id: "2",
    codigo: "PROD-002",
    descripcion: "Producto B Estándar",
    tagRFID: "E200001234567890ABCE",
    estadoTag: "Asignado",
    fechaAsignacion: "2025-01-06",
  },
  { id: "3", codigo: "PROD-003", descripcion: "Producto C Básico", estadoTag: "Sin Tag" },
  {
    id: "4",
    codigo: "PROD-004",
    descripcion: "Producto D Premium",
    tagRFID: "E200009876543210DCBA",
    estadoTag: "Error",
  },
  { id: "5", codigo: "PROD-005", descripcion: "Producto E Especial", estadoTag: "Sin Tag" },
]

export default function EtiquetadoRFPage() {
  const [productos, setProductos] = useState<ProductoEtiqueta[]>(productosData)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<ProductoEtiqueta | null>(null)
  const [newTag, setNewTag] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")

  const conTag = productos.filter((p) => p.estadoTag === "Asignado").length
  const sinTag = productos.filter((p) => p.estadoTag === "Sin Tag").length
  const conError = productos.filter((p) => p.estadoTag === "Error").length

  const filteredProductos = productos.filter((p) => {
    const matchesSearch =
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === "all" || p.estadoTag === filterEstado
    return matchesSearch && matchesFilter
  })

  const handleAsignarTag = () => {
    if (!selectedProducto || !newTag) return

    setProductos(
      productos.map((p) =>
        p.id === selectedProducto.id
          ? {
              ...p,
              tagRFID: newTag,
              estadoTag: "Asignado" as const,
              fechaAsignacion: new Date().toISOString().split("T")[0],
            }
          : p,
      ),
    )
    setShowAsignarModal(false)
    setNewTag("")
    setSelectedProducto(null)
  }

  const handleDesvincularTag = (producto: ProductoEtiqueta) => {
    setProductos(
      productos.map((p) =>
        p.id === producto.id
          ? { ...p, tagRFID: undefined, estadoTag: "Sin Tag" as const, fechaAsignacion: undefined }
          : p,
      ),
    )
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Asignado":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Asignado
          </Badge>
        )
      case "Sin Tag":
        return (
          <Badge className="bg-gray-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Sin Tag
          </Badge>
        )
      case "Error":
        return (
          <Badge className="bg-red-600 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Etiquetado RF"
          description="Asignación y gestión de tags RFID a productos"
          icon={<Tag className="h-6 w-6" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Con Tag</p>
                  <p className="text-3xl font-bold text-white">{conTag}</p>
                </div>
                <Radio className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Sin Tag</p>
                  <p className="text-3xl font-bold text-white">{sinTag}</p>
                </div>
                <Package className="h-10 w-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Con Error</p>
                  <p className="text-3xl font-bold text-white">{conError}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total</p>
                  <p className="text-3xl font-bold text-white">{productos.length}</p>
                </div>
                <Tag className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <Label className="text-muted-foreground">Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Código o descripción..."
                    className="bg-background border-border pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label className="text-muted-foreground">Estado</Label>
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Asignado">Con Tag</SelectItem>
                    <SelectItem value="Sin Tag">Sin Tag</SelectItem>
                    <SelectItem value="Error">Con Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Tags
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Código</TableHead>
                  <TableHead className="text-muted-foreground">Descripción</TableHead>
                  <TableHead className="text-muted-foreground">Tag RFID</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Asignación</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.map((producto) => (
                  <TableRow key={producto.id} className="border-border">
                    <TableCell className="text-foreground font-medium">{producto.codigo}</TableCell>
                    <TableCell className="text-foreground">{producto.descripcion}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {producto.tagRFID ? (
                        <span className="text-foreground">{producto.tagRFID}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{producto.fechaAsignacion || "-"}</TableCell>
                    <TableCell>{getEstadoBadge(producto.estadoTag)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {producto.estadoTag === "Sin Tag" || producto.estadoTag === "Error" ? (
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => {
                              setSelectedProducto(producto)
                              setShowAsignarModal(true)
                            }}
                          >
                            <Link className="h-3 w-3 mr-1" />
                            Asignar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-500/10 bg-transparent"
                            onClick={() => handleDesvincularTag(producto)}
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Desvincular
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Printer className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Asignar Tag Modal */}
        <Dialog open={showAsignarModal} onOpenChange={setShowAsignarModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Asignar Tag RFID</DialogTitle>
            </DialogHeader>
            {selectedProducto && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <p className="text-lg font-medium text-foreground">{selectedProducto.codigo}</p>
                  <p className="text-sm text-muted-foreground">{selectedProducto.descripcion}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tag RFID (EPC)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value.toUpperCase())}
                      placeholder="E200001234567890ABCD"
                      className="bg-background border-border font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setNewTag(`E2000${Date.now().toString(16).toUpperCase()}`)}
                    >
                      <Radio className="h-4 w-4 mr-1" />
                      Escanear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escanee el tag o ingrese manualmente el código EPC
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAsignarModal(false)}>
                Cancelar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAsignarTag} disabled={!newTag}>
                <Plus className="h-4 w-4 mr-2" />
                Asignar Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
