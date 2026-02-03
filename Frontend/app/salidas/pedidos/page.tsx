"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormModal } from "@/components/shared/form-modal"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Trash2, FileText, Clock, Package, Truck, Upload, Eye, AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SalidaService } from "@/lib/api/salida.service"
import {
  type OrdenSalida,
  type CreateOrdenSalidaPayload,
  EstadoOrdenSalida,
  EstadoOrdenSalidaNombre
} from "@/lib/models"
import { toast } from "sonner"

interface PedidoItem {
  id: string
  codItem: string
  descripcion: string
  cantidad: number
}

const prioridadColors: Record<number, string> = {
  1: "bg-red-600",
  2: "bg-blue-600",
  3: "bg-gray-600",
}

const prioridadLabels: Record<number, string> = {
  1: "Urgente",
  2: "Normal",
  3: "Baja",
}

const estadoColors: Record<number, string> = {
  [EstadoOrdenSalida.PENDIENTE]: "bg-yellow-600",
  [EstadoOrdenSalida.EN_PICKING]: "bg-purple-600",
  [EstadoOrdenSalida.COMPLETADA]: "bg-blue-600",
  [EstadoOrdenSalida.DESPACHADA]: "bg-green-600",
}

const estadoIcons: Record<number, React.ReactNode> = {
  [EstadoOrdenSalida.PENDIENTE]: <Clock className="w-3 h-3 mr-1" />,
  [EstadoOrdenSalida.EN_PICKING]: <Package className="w-3 h-3 mr-1" />,
  [EstadoOrdenSalida.COMPLETADA]: <FileText className="w-3 h-3 mr-1" />,
  [EstadoOrdenSalida.DESPACHADA]: <Truck className="w-3 h-3 mr-1" />,
}

export default function PedidosPage() {
  const [ordenes, setOrdenes] = useState<OrdenSalida[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    cliente: "",
    destino: "",
    prioridad: 2,
    observacion: "",
    almacenCodigo: "ALM-CENT",
  })

  const [items, setItems] = useState<PedidoItem[]>([
    { id: "1", codItem: "", descripcion: "", cantidad: 0 },
  ])

  const [importData, setImportData] = useState({
    nroDocumento: "",
    cliente: "",
    destino: "",
    prioridad: 2,
    almacenCodigo: "ALM-CENT",
    items: "",
  })

  // Cargar órdenes desde el backend
  const loadOrdenes = async () => {
    try {
      setLoading(true)
      const data = await SalidaService.getAll()
      setOrdenes(data)
    } catch (error) {
      console.error("Error cargando órdenes:", error)
      toast.error("Error al cargar las órdenes de salida")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrdenes()
  }, [])

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.nroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || orden.estado === Number(filterEstado)
    return matchesSearch && matchesEstado
  })

  const stats = {
    pendiente: ordenes.filter((o) => o.estado === EstadoOrdenSalida.PENDIENTE).length,
    enPicking: ordenes.filter((o) => o.estado === EstadoOrdenSalida.EN_PICKING).length,
    completada: ordenes.filter((o) => o.estado === EstadoOrdenSalida.COMPLETADA).length,
    despachada: ordenes.filter((o) => o.estado === EstadoOrdenSalida.DESPACHADA).length,
  }

  const handleNew = () => {
    setFormData({ cliente: "", destino: "", prioridad: 2, observacion: "", almacenCodigo: "ALM-CENT" })
    setItems([{ id: "1", codItem: "", descripcion: "", cantidad: 0 }])
    setIsModalOpen(true)
  }

  const addItem = () => {
    setItems([...items, { id: String(Date.now()), codItem: "", descripcion: "", cantidad: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof PedidoItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSubmit = async () => {
    if (!formData.cliente || items.length === 0 || !items[0].codItem) {
      toast.error("Complete los campos requeridos")
      return
    }

    try {
      setSubmitting(true)
      const payload: CreateOrdenSalidaPayload = {
        cliente: formData.cliente,
        destino: formData.destino || undefined,
        prioridad: formData.prioridad,
        almacenCodigo: formData.almacenCodigo,
        observacion: formData.observacion || undefined,
        detalles: items
          .filter(i => i.codItem && i.cantidad > 0)
          .map(i => ({
            codItem: i.codItem,
            cantidad: i.cantidad,
          })),
      }

      await SalidaService.create(payload)
      toast.success("Orden de salida creada exitosamente")
      setIsModalOpen(false)
      loadOrdenes()
    } catch (error) {
      console.error("Error creando orden:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la orden")
    } finally {
      setSubmitting(false)
    }
  }

  const handleImport = async () => {
    if (!importData.nroDocumento || !importData.cliente || !importData.items) {
      toast.error("Complete los campos requeridos")
      return
    }

    try {
      setSubmitting(true)
      // Parse items from text (format: "CODIGO,cantidad" per line)
      const parsedItems = importData.items.split("\n")
        .filter(line => line.trim())
        .map(line => {
          const [codigo, cantidadStr] = line.split(",").map(s => s.trim())
          return { codigo, cantidad: Number(cantidadStr) || 0 }
        })
        .filter(item => item.codigo && item.cantidad > 0)

      await SalidaService.importar({
        nroDocumento: importData.nroDocumento,
        cliente: importData.cliente,
        destino: importData.destino || undefined,
        prioridad: importData.prioridad,
        almacenCodigo: importData.almacenCodigo,
        items: parsedItems,
      })

      toast.success("Orden importada desde ERP exitosamente")
      setIsImportModalOpen(false)
      setImportData({ nroDocumento: "", cliente: "", destino: "", prioridad: 2, almacenCodigo: "ALM-CENT", items: "" })
      loadOrdenes()
    } catch (error) {
      console.error("Error importando orden:", error)
      toast.error(error instanceof Error ? error.message : "Error al importar la orden")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Registro de Pedidos"
        description="Gestión de órdenes de salida"
        onNew={handleNew}
        newLabel="Nuevo Pedido"
      >
        <Button
          variant="outline"
          className="bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Importar ERP</span>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Card
          className="bg-yellow-600/20 border-yellow-600/50 cursor-pointer hover:bg-yellow-600/30"
          onClick={() => setFilterEstado(String(EstadoOrdenSalida.PENDIENTE))}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pendiente}</p>
                <p className="text-[10px] sm:text-xs text-yellow-400 truncate">Pendientes</p>
              </div>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-purple-600/20 border-purple-600/50 cursor-pointer hover:bg-purple-600/30"
          onClick={() => setFilterEstado(String(EstadoOrdenSalida.EN_PICKING))}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.enPicking}</p>
                <p className="text-[10px] sm:text-xs text-purple-400 truncate">En Picking</p>
              </div>
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-blue-600/20 border-blue-600/50 cursor-pointer hover:bg-blue-600/30"
          onClick={() => setFilterEstado(String(EstadoOrdenSalida.COMPLETADA))}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.completada}</p>
                <p className="text-[10px] sm:text-xs text-blue-400 truncate">Completadas</p>
              </div>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-green-600/20 border-green-600/50 cursor-pointer hover:bg-green-600/30"
          onClick={() => setFilterEstado(String(EstadoOrdenSalida.DESPACHADA))}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.despachada}</p>
                <p className="text-[10px] sm:text-xs text-green-400 truncate">Despachadas</p>
              </div>
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border mb-4 sm:mb-6">
        <CardContent className="p-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por documento o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border text-sm"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value={String(EstadoOrdenSalida.PENDIENTE)}>Pendiente</SelectItem>
                <SelectItem value={String(EstadoOrdenSalida.EN_PICKING)}>En Picking</SelectItem>
                <SelectItem value={String(EstadoOrdenSalida.COMPLETADA)}>Completada</SelectItem>
                <SelectItem value={String(EstadoOrdenSalida.DESPACHADA)}>Despachada</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-secondary border-border" onClick={() => setFilterEstado("todos")}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-2 sm:pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Documento</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Cliente</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        Destino
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        Prioridad
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Items</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                      <TableHead className="w-16 sm:w-24 text-xs sm:text-sm">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrdenes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay órdenes de salida
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrdenes.map((orden) => (
                        <TableRow key={orden.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-xs sm:text-sm py-2">{orden.nroDocumento}</TableCell>
                          <TableCell className="text-xs sm:text-sm py-2 max-w-[120px] sm:max-w-none truncate">
                            {orden.cliente}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">
                            {orden.destino || "-"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell py-2">
                            <Badge className={`${prioridadColors[orden.prioridad] || "bg-gray-600"} text-[10px] sm:text-xs`}>
                              {prioridadLabels[orden.prioridad] || "Normal"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">
                            {orden.resumen?.totalDetalles || orden.detalles?.length || 0}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              className={`${estadoColors[orden.estado] || "bg-gray-600"} flex items-center w-fit text-[10px] sm:text-xs`}
                            >
                              <span className="hidden sm:inline-flex">{estadoIcons[orden.estado]}</span>
                              {EstadoOrdenSalidaNombre[orden.estado] || "Desconocido"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-sm sm:text-base">Detalle - {orden.nroDocumento}</DialogTitle>
                                  <DialogDescription className="text-xs sm:text-sm">
                                    Cliente: {orden.cliente}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div>
                                      <Label className="text-[10px] sm:text-xs text-muted-foreground">Destino</Label>
                                      <p className="text-xs sm:text-sm">{orden.destino || "No especificado"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-[10px] sm:text-xs text-muted-foreground">Prioridad</Label>
                                      <Badge className={`${prioridadColors[orden.prioridad]} text-[10px] sm:text-xs`}>
                                        {prioridadLabels[orden.prioridad]}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label className="text-[10px] sm:text-xs text-muted-foreground">Estado</Label>
                                      <Badge className={`${estadoColors[orden.estado]} text-[10px] sm:text-xs`}>
                                        {EstadoOrdenSalidaNombre[orden.estado]}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label className="text-[10px] sm:text-xs text-muted-foreground">Items</Label>
                                      <p className="text-xs sm:text-sm">{orden.resumen?.totalDetalles || 0}</p>
                                    </div>
                                  </div>

                                  {orden.resumen && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-yellow-600/20 rounded-lg">
                                        <p className="text-xs text-yellow-400">Pendientes</p>
                                        <p className="text-lg font-bold text-yellow-400">{orden.resumen.pendientes}</p>
                                      </div>
                                      <div className="p-3 bg-green-600/20 rounded-lg">
                                        <p className="text-xs text-green-400">Pickeados</p>
                                        <p className="text-lg font-bold text-green-400">{orden.resumen.pickeados}</p>
                                      </div>
                                    </div>
                                  )}

                                  {orden.detalles && orden.detalles.length > 0 && (
                                    <div className="border border-border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-secondary">
                                            <TableHead className="text-xs">Código</TableHead>
                                            <TableHead className="text-xs">Descripción</TableHead>
                                            <TableHead className="text-xs text-center">Cantidad</TableHead>
                                            <TableHead className="text-xs">Estado</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {orden.detalles.map((detalle) => (
                                            <TableRow key={detalle.id}>
                                              <TableCell className="text-xs font-mono">{detalle.codItem}</TableCell>
                                              <TableCell className="text-xs">{detalle.item?.descripcion || "-"}</TableCell>
                                              <TableCell className="text-xs text-center">{detalle.cantidadSolicitada}</TableCell>
                                              <TableCell>
                                                <Badge className={detalle.estadoNombre === "PICKEADO" ? "bg-green-600" : "bg-yellow-600"} >
                                                  {detalle.estadoNombre || "Pendiente"}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nuevo Pedido */}
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Pedido"
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Guardando..." : "Guardar Pedido"}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Cliente *</Label>
              <Input
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="bg-secondary border-border text-sm"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Destino</Label>
              <Input
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                className="bg-secondary border-border text-sm"
                placeholder="Dirección de entrega"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Prioridad *</Label>
              <Select
                value={String(formData.prioridad)}
                onValueChange={(v) => setFormData({ ...formData, prioridad: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Urgente</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Almacén *</Label>
              <Input
                value={formData.almacenCodigo}
                onChange={(e) => setFormData({ ...formData, almacenCodigo: e.target.value })}
                className="bg-secondary border-border text-sm"
                placeholder="ALM-CENT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Detalle de Ítems *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addItem}
                className="bg-secondary border-border text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-2 sm:p-3 bg-secondary/50 rounded-lg">
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Código Item *</Label>
                    <Input
                      value={item.codItem}
                      onChange={(e) => updateItem(item.id, "codItem", e.target.value)}
                      className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm"
                      placeholder="FARM-001"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Descripción</Label>
                    <Input
                      value={item.descripcion}
                      onChange={(e) => updateItem(item.id, "descripcion", e.target.value)}
                      className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Cantidad *</Label>
                    <Input
                      type="number"
                      value={item.cantidad || ""}
                      onChange={(e) => updateItem(item.id, "cantidad", Number(e.target.value))}
                      className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm"
                      min={1}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-8 w-8 sm:h-9 sm:w-9 text-red-400"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Observaciones</Label>
            <Textarea
              value={formData.observacion}
              onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
              className="bg-secondary border-border text-sm"
              rows={2}
            />
          </div>
        </div>
      </FormModal>

      {/* Modal Importar ERP */}
      <FormModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar desde ERP"
        onSubmit={handleImport}
        submitLabel={submitting ? "Importando..." : "Importar"}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-600/50">
            <p className="text-xs text-blue-400">
              Simula la importación de una orden desde un sistema ERP externo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Nro. Documento ERP *</Label>
              <Input
                value={importData.nroDocumento}
                onChange={(e) => setImportData({ ...importData, nroDocumento: e.target.value })}
                className="bg-secondary border-border text-sm"
                placeholder="ERP-2024-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Cliente *</Label>
              <Input
                value={importData.cliente}
                onChange={(e) => setImportData({ ...importData, cliente: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Destino</Label>
              <Input
                value={importData.destino}
                onChange={(e) => setImportData({ ...importData, destino: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Prioridad</Label>
              <Select
                value={String(importData.prioridad)}
                onValueChange={(v) => setImportData({ ...importData, prioridad: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Urgente</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Items (formato: CODIGO,cantidad por línea) *</Label>
            <Textarea
              value={importData.items}
              onChange={(e) => setImportData({ ...importData, items: e.target.value })}
              className="bg-secondary border-border text-sm font-mono"
              rows={4}
              placeholder={"FARM-001,50\nELEC-002,25\nMECH-003,10"}
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
