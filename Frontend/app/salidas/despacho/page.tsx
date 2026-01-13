"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormModal } from "@/components/shared/form-modal"
import { Truck, Package, CheckCircle, Calendar, User, FileText, MapPin } from "lucide-react"

interface PedidoDespacho {
  id: string
  documento: string
  cliente: string
  direccion: string
  paquetes: number
  estado: "listo" | "asignado" | "despachado"
  distribuidor: string | null
  guia: string | null
  fechaDespacho: string | null
}

const mockPedidosDespacho: PedidoDespacho[] = [
  {
    id: "1",
    documento: "PED-2025-003",
    cliente: "Comercial Norte",
    direccion: "Av. Principal 123, Ciudad",
    paquetes: 2,
    estado: "listo",
    distribuidor: null,
    guia: null,
    fechaDespacho: null,
  },
  {
    id: "2",
    documento: "PED-2025-004",
    cliente: "Tienda Central",
    direccion: "Calle Comercio 456, Centro",
    paquetes: 3,
    estado: "listo",
    distribuidor: null,
    guia: null,
    fechaDespacho: null,
  },
  {
    id: "3",
    documento: "PED-2025-005",
    cliente: "Super Market Plus",
    direccion: "Boulevard Sur 789, Zona Industrial",
    paquetes: 5,
    estado: "asignado",
    distribuidor: "Transporte Express",
    guia: "GE-2025-001",
    fechaDespacho: null,
  },
  {
    id: "4",
    documento: "PED-2025-001",
    cliente: "Cliente ABC S.A.",
    direccion: "Parque Industrial 321",
    paquetes: 2,
    estado: "despachado",
    distribuidor: "Envíos Rápidos",
    guia: "ER-2025-050",
    fechaDespacho: "2025-01-08 14:30",
  },
]

const distribuidores = [
  { id: "1", nombre: "Transporte Express" },
  { id: "2", nombre: "Envíos Rápidos" },
  { id: "3", nombre: "Logística Nacional" },
  { id: "4", nombre: "Flota Propia" },
]

export default function DespachoPage() {
  const [pedidos, setPedidos] = useState<PedidoDespacho[]>(mockPedidosDespacho)
  const [selectedPedido, setSelectedPedido] = useState<PedidoDespacho | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    distribuidor: "",
    guia: "",
    placa: "",
    conductor: "",
  })

  const listos = pedidos.filter((p) => p.estado === "listo")
  const asignados = pedidos.filter((p) => p.estado === "asignado")
  const despachados = pedidos.filter((p) => p.estado === "despachado")

  const handleAsignarDistribuidor = (pedido: PedidoDespacho) => {
    setSelectedPedido(pedido)
    setFormData({ distribuidor: "", guia: "", placa: "", conductor: "" })
    setIsModalOpen(true)
  }

  const handleConfirmarAsignacion = () => {
    if (selectedPedido) {
      setPedidos(
        pedidos.map((p) =>
          p.id === selectedPedido.id
            ? { ...p, estado: "asignado", distribuidor: formData.distribuidor, guia: formData.guia }
            : p,
        ),
      )
      setIsModalOpen(false)
      setSelectedPedido(null)
    }
  }

  const handleConfirmarDespacho = (pedido: PedidoDespacho) => {
    setPedidos(
      pedidos.map((p) =>
        p.id === pedido.id ? { ...p, estado: "despachado", fechaDespacho: new Date().toISOString() } : p,
      ),
    )
  }

  return (
    <MainLayout>
      <PageHeader title="Gestión de Despachos" description="Asignación y confirmación de entregas" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-400">{listos.length}</p>
                <p className="text-sm text-yellow-400">Listos para Despacho</p>
              </div>
              <Package className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-600/20 border-blue-600/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-400">{asignados.length}</p>
                <p className="text-sm text-blue-400">Asignados</p>
              </div>
              <Truck className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-600/20 border-green-600/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-400">{despachados.length}</p>
                <p className="text-sm text-green-400">Despachados Hoy</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="space-y-6">
        {/* Listos para Despacho */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-400" />
              Pedidos Listos para Despacho
              <Badge variant="secondary">{listos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead>Documento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Paquetes</TableHead>
                    <TableHead className="w-32">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listos.map((pedido) => (
                    <TableRow key={pedido.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{pedido.documento}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {pedido.direccion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pedido.paquetes} paquetes</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAsignarDistribuidor(pedido)}
                          className="bg-primary text-primary-foreground"
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Asignar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Asignados */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              Pedidos Asignados
              <Badge variant="secondary">{asignados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead>Documento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Distribuidor</TableHead>
                    <TableHead>Guía</TableHead>
                    <TableHead>Paquetes</TableHead>
                    <TableHead className="w-32">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asignados.map((pedido) => (
                    <TableRow key={pedido.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{pedido.documento}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {pedido.distribuidor}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          <FileText className="w-3 h-3 mr-1" />
                          {pedido.guia}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pedido.paquetes}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmarDespacho(pedido)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Despachar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Despachados */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Pedidos Despachados
              <Badge variant="secondary">{despachados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead>Documento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Distribuidor</TableHead>
                    <TableHead>Guía</TableHead>
                    <TableHead>Fecha Despacho</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despachados.map((pedido) => (
                    <TableRow key={pedido.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{pedido.documento}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>{pedido.distribuidor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {pedido.guia}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {pedido.fechaDespacho}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">Entregado</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Asignar Distribuidor"
        description={`Pedido: ${selectedPedido?.documento}`}
        onSubmit={handleConfirmarAsignacion}
        submitLabel="Confirmar Asignación"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Distribuidor/Flota *</Label>
            <Select value={formData.distribuidor} onValueChange={(v) => setFormData({ ...formData, distribuidor: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {distribuidores.map((dist) => (
                  <SelectItem key={dist.id} value={dist.nombre}>
                    {dist.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Número de Guía *</Label>
            <Input
              value={formData.guia}
              onChange={(e) => setFormData({ ...formData, guia: e.target.value })}
              placeholder="Ej: GE-2025-002"
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa Vehículo</Label>
              <Input
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Conductor</Label>
              <Input
                value={formData.conductor}
                onChange={(e) => setFormData({ ...formData, conductor: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
