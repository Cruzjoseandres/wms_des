"use client"

import type React from "react"

import { useState } from "react"
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
import { Search, Plus, Trash2, FileText, Clock, Package, Truck, Upload, Eye, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PedidoItem {
  id: string
  producto: string
  descripcion: string
  cantidad: number
  ubicacion: string
}

interface Pedido {
  id: string
  documento: string
  cliente: string
  fecha: string
  fechaEntrega: string
  prioridad: "urgente" | "normal" | "baja"
  items: number
  estado: "pendiente" | "programado" | "picking" | "packing" | "despachado"
  observaciones: string
}

const mockPedidos: Pedido[] = [
  {
    id: "1",
    documento: "PED-2025-001",
    cliente: "Cliente ABC S.A.",
    fecha: "2025-01-08",
    fechaEntrega: "2025-01-10",
    prioridad: "urgente",
    items: 5,
    estado: "pendiente",
    observaciones: "",
  },
  {
    id: "2",
    documento: "PED-2025-002",
    cliente: "Distribuidora XYZ",
    fecha: "2025-01-08",
    fechaEntrega: "2025-01-12",
    prioridad: "normal",
    items: 12,
    estado: "programado",
    observaciones: "",
  },
  {
    id: "3",
    documento: "PED-2025-003",
    cliente: "Comercial Norte",
    fecha: "2025-01-07",
    fechaEntrega: "2025-01-11",
    prioridad: "normal",
    items: 8,
    estado: "picking",
    observaciones: "",
  },
  {
    id: "4",
    documento: "PED-2025-004",
    cliente: "Tienda Central",
    fecha: "2025-01-07",
    fechaEntrega: "2025-01-09",
    prioridad: "urgente",
    items: 3,
    estado: "packing",
    observaciones: "",
  },
  {
    id: "5",
    documento: "PED-2025-005",
    cliente: "Super Market Plus",
    fecha: "2025-01-06",
    fechaEntrega: "2025-01-08",
    prioridad: "baja",
    items: 15,
    estado: "despachado",
    observaciones: "",
  },
]

const prioridadColors: Record<string, string> = {
  urgente: "bg-red-600",
  normal: "bg-blue-600",
  baja: "bg-gray-600",
}

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-600",
  programado: "bg-blue-600",
  picking: "bg-purple-600",
  packing: "bg-orange-600",
  despachado: "bg-green-600",
}

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="w-3 h-3 mr-1" />,
  programado: <FileText className="w-3 h-3 mr-1" />,
  picking: <Package className="w-3 h-3 mr-1" />,
  packing: <Package className="w-3 h-3 mr-1" />,
  despachado: <Truck className="w-3 h-3 mr-1" />,
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [formData, setFormData] = useState({
    cliente: "",
    fechaEntrega: "",
    prioridad: "normal" as Pedido["prioridad"],
    observaciones: "",
  })
  const [items, setItems] = useState<PedidoItem[]>([
    { id: "1", producto: "", descripcion: "", cantidad: 0, ubicacion: "" },
  ])

  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || pedido.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const stats = {
    pendiente: pedidos.filter((p) => p.estado === "pendiente").length,
    programado: pedidos.filter((p) => p.estado === "programado").length,
    picking: pedidos.filter((p) => p.estado === "picking").length,
    packing: pedidos.filter((p) => p.estado === "packing").length,
    despachado: pedidos.filter((p) => p.estado === "despachado").length,
  }

  const handleNew = () => {
    setFormData({ cliente: "", fechaEntrega: "", prioridad: "normal", observaciones: "" })
    setItems([{ id: "1", producto: "", descripcion: "", cantidad: 0, ubicacion: "" }])
    setIsModalOpen(true)
  }

  const addItem = () => {
    setItems([...items, { id: String(Date.now()), producto: "", descripcion: "", cantidad: 0, ubicacion: "" }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof PedidoItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSubmit = () => {
    const newPedido: Pedido = {
      id: String(Date.now()),
      documento: `PED-2025-${String(pedidos.length + 1).padStart(3, "0")}`,
      cliente: formData.cliente,
      fecha: new Date().toISOString().split("T")[0],
      fechaEntrega: formData.fechaEntrega,
      prioridad: formData.prioridad,
      items: items.length,
      estado: "pendiente",
      observaciones: formData.observaciones,
    }
    setPedidos([newPedido, ...pedidos])
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Registro de Pedidos"
        description="Gestión de pedidos de salida"
        onNew={handleNew}
        newLabel="Nuevo Pedido"
      >
        <Button variant="outline" className="bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
          <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Importar</span>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Card
          className="bg-yellow-600/20 border-yellow-600/50 cursor-pointer hover:bg-yellow-600/30"
          onClick={() => setFilterEstado("pendiente")}
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
          className="bg-blue-600/20 border-blue-600/50 cursor-pointer hover:bg-blue-600/30"
          onClick={() => setFilterEstado("programado")}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.programado}</p>
                <p className="text-[10px] sm:text-xs text-blue-400 truncate">Programados</p>
              </div>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-purple-600/20 border-purple-600/50 cursor-pointer hover:bg-purple-600/30"
          onClick={() => setFilterEstado("picking")}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.picking}</p>
                <p className="text-[10px] sm:text-xs text-purple-400 truncate">En Picking</p>
              </div>
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-orange-600/20 border-orange-600/50 cursor-pointer hover:bg-orange-600/30"
          onClick={() => setFilterEstado("packing")}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-orange-400">{stats.packing}</p>
                <p className="text-[10px] sm:text-xs text-orange-400 truncate">En Packing</p>
              </div>
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 opacity-50 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-green-600/20 border-green-600/50 cursor-pointer hover:bg-green-600/30 col-span-2 sm:col-span-1"
          onClick={() => setFilterEstado("despachado")}
        >
          <CardContent className="p-3 sm:pt-4 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.despachado}</p>
                <p className="text-[10px] sm:text-xs text-green-400 truncate">Despachados</p>
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
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="picking">En Picking</SelectItem>
                <SelectItem value="packing">En Packing</SelectItem>
                <SelectItem value="despachado">Despachado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-2 sm:pt-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Documento</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Cliente</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                      Fecha Pedido
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                      Fecha Entrega
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
                  {filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs sm:text-sm py-2">{pedido.documento}</TableCell>
                      <TableCell className="text-xs sm:text-sm py-2 max-w-[120px] sm:max-w-none truncate">
                        {pedido.cliente}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">{pedido.fecha}</TableCell>
                      <TableCell className="hidden lg:table-cell py-2">
                        <div className="flex items-center gap-1 text-xs sm:text-sm">
                          {pedido.fechaEntrega}
                          {pedido.prioridad === "urgente" && (
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-2">
                        <Badge className={`${prioridadColors[pedido.prioridad]} text-[10px] sm:text-xs`}>
                          {pedido.prioridad.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">{pedido.items}</TableCell>
                      <TableCell className="py-2">
                        <Badge
                          className={`${estadoColors[pedido.estado]} flex items-center w-fit text-[10px] sm:text-xs`}
                        >
                          <span className="hidden sm:inline-flex">{estadoIcons[pedido.estado]}</span>
                          <span className="sm:hidden">{pedido.estado.slice(0, 3).toUpperCase()}</span>
                          <span className="hidden sm:inline">{pedido.estado.toUpperCase()}</span>
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
                              <DialogTitle className="text-sm sm:text-base">Detalle - {pedido.documento}</DialogTitle>
                              <DialogDescription className="text-xs sm:text-sm">
                                Cliente: {pedido.cliente}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div>
                                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Fecha Pedido</Label>
                                  <p className="text-xs sm:text-sm">{pedido.fecha}</p>
                                </div>
                                <div>
                                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Fecha Entrega</Label>
                                  <p className="text-xs sm:text-sm">{pedido.fechaEntrega}</p>
                                </div>
                                <div>
                                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Prioridad</Label>
                                  <Badge className={`${prioridadColors[pedido.prioridad]} text-[10px] sm:text-xs`}>
                                    {pedido.prioridad}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Estado</Label>
                                  <Badge className={`${estadoColors[pedido.estado]} text-[10px] sm:text-xs`}>
                                    {pedido.estado}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Pedido"
        onSubmit={handleSubmit}
        submitLabel="Guardar Pedido"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Cliente *</Label>
              <Input
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Fecha Entrega *</Label>
              <Input
                type="date"
                value={formData.fechaEntrega}
                onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Prioridad *</Label>
            <Select
              value={formData.prioridad}
              onValueChange={(v) => setFormData({ ...formData, prioridad: v as Pedido["prioridad"] })}
            >
              <SelectTrigger className="bg-secondary border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Detalle de Ítems</Label>
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
                    <Label className="text-[10px] sm:text-xs">Producto</Label>
                    <Select value={item.producto} onValueChange={(v) => updateItem(item.id, "producto", v)}>
                      <SelectTrigger className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRD-001">PRD-001 - Producto A</SelectItem>
                        <SelectItem value="PRD-002">PRD-002 - Producto B</SelectItem>
                        <SelectItem value="PRD-003">PRD-003 - Producto C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      value={item.cantidad || ""}
                      onChange={(e) => updateItem(item.id, "cantidad", Number(e.target.value))}
                      className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Ubicación</Label>
                    <Input
                      value={item.ubicacion}
                      onChange={(e) => updateItem(item.id, "ubicacion", e.target.value)}
                      className="bg-secondary border-border h-8 sm:h-9 text-xs sm:text-sm"
                      placeholder="Auto"
                      disabled
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
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="bg-secondary border-border text-sm"
              rows={2}
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
