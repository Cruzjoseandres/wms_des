"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormModal } from "@/components/shared/form-modal"
import { Calendar, User, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface PedidoProgramacion {
  id: string
  documento: string
  cliente: string
  fechaEntrega: string
  prioridad: "urgente" | "normal" | "baja"
  items: number
  preparador: string | null
  estado: "pendiente" | "programado"
}

const mockPedidos: PedidoProgramacion[] = [
  {
    id: "1",
    documento: "PED-2025-001",
    cliente: "Cliente ABC S.A.",
    fechaEntrega: "2025-01-10",
    prioridad: "urgente",
    items: 5,
    preparador: null,
    estado: "pendiente",
  },
  {
    id: "2",
    documento: "PED-2025-006",
    cliente: "Comercial Sur",
    fechaEntrega: "2025-01-10",
    prioridad: "urgente",
    items: 8,
    preparador: null,
    estado: "pendiente",
  },
  {
    id: "3",
    documento: "PED-2025-007",
    cliente: "Tienda Express",
    fechaEntrega: "2025-01-11",
    prioridad: "normal",
    items: 12,
    preparador: null,
    estado: "pendiente",
  },
  {
    id: "4",
    documento: "PED-2025-002",
    cliente: "Distribuidora XYZ",
    fechaEntrega: "2025-01-12",
    prioridad: "normal",
    items: 12,
    preparador: "Carlos López",
    estado: "programado",
  },
]

const preparadores = [
  { id: "1", nombre: "Carlos López", pedidosAsignados: 3 },
  { id: "2", nombre: "Ana Martínez", pedidosAsignados: 2 },
  { id: "3", nombre: "Pedro Gómez", pedidosAsignados: 1 },
  { id: "4", nombre: "María García", pedidosAsignados: 4 },
]

const prioridadColors: Record<string, string> = {
  urgente: "bg-red-600",
  normal: "bg-blue-600",
  baja: "bg-gray-600",
}

export default function ProgramacionPage() {
  const [pedidos, setPedidos] = useState<PedidoProgramacion[]>(mockPedidos)
  const [selectedPedidos, setSelectedPedidos] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPreparador, setSelectedPreparador] = useState("")
  const [prioridadAsignada, setPrioridadAsignada] = useState<"urgente" | "normal" | "baja">("normal")

  const pendientes = pedidos.filter((p) => p.estado === "pendiente")
  const programados = pedidos.filter((p) => p.estado === "programado")

  const toggleSelectPedido = (id: string) => {
    setSelectedPedidos((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleProgramar = () => {
    if (selectedPedidos.length > 0) {
      setIsModalOpen(true)
    }
  }

  const handleConfirmarProgramacion = () => {
    setPedidos(
      pedidos.map((p) =>
        selectedPedidos.includes(p.id)
          ? { ...p, estado: "programado" as const, preparador: selectedPreparador, prioridad: prioridadAsignada }
          : p,
      ),
    )
    setSelectedPedidos([])
    setIsModalOpen(false)
    setSelectedPreparador("")
  }

  return (
    <MainLayout>
      <PageHeader title="Programación de Pedidos" description="Asignación de pedidos a preparadores" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Pedidos Pendientes de Programar
                  <Badge variant="secondary">{pendientes.length}</Badge>
                </CardTitle>
                <Button
                  onClick={handleProgramar}
                  disabled={selectedPedidos.length === 0}
                  className="bg-primary text-primary-foreground"
                >
                  Programar Seleccionados ({selectedPedidos.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPedidos.length === pendientes.length && pendientes.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPedidos(pendientes.map((p) => p.id))
                            } else {
                              setSelectedPedidos([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendientes.map((pedido) => (
                      <TableRow
                        key={pedido.id}
                        className={`hover:bg-muted/50 cursor-pointer ${selectedPedidos.includes(pedido.id) ? "bg-primary/20" : ""}`}
                        onClick={() => toggleSelectPedido(pedido.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedPedidos.includes(pedido.id)}
                            onCheckedChange={() => toggleSelectPedido(pedido.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{pedido.documento}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {pedido.fechaEntrega}
                            {pedido.prioridad === "urgente" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={prioridadColors[pedido.prioridad]}>{pedido.prioridad.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{pedido.items}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Programmed Orders */}
          <Card className="bg-card border-border mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Pedidos Programados
                <Badge variant="secondary">{programados.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead>Documento</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Preparador</TableHead>
                      <TableHead>Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programados.map((pedido) => (
                      <TableRow key={pedido.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{pedido.documento}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>{pedido.fechaEntrega}</TableCell>
                        <TableCell>
                          <Badge className={prioridadColors[pedido.prioridad]}>{pedido.prioridad.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            {pedido.preparador}
                          </div>
                        </TableCell>
                        <TableCell>{pedido.items}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preparadores Panel */}
        <div>
          <Card className="bg-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Preparadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preparadores.map((prep) => (
                <div
                  key={prep.id}
                  className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between hover:bg-secondary cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{prep.nombre}</p>
                      <p className="text-xs text-muted-foreground">{prep.pedidosAsignados} pedidos asignados</p>
                    </div>
                  </div>
                  <Badge variant="outline">{prep.pedidosAsignados}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Programar Pedidos"
        description={`Asignar ${selectedPedidos.length} pedido(s) a un preparador`}
        onSubmit={handleConfirmarProgramacion}
        submitLabel="Confirmar Programación"
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Pedidos seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedPedidos.map((id) => {
                const pedido = pedidos.find((p) => p.id === id)
                return (
                  <Badge key={id} variant="outline">
                    {pedido?.documento}
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asignar a Preparador *</Label>
            <Select value={selectedPreparador} onValueChange={setSelectedPreparador}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar preparador" />
              </SelectTrigger>
              <SelectContent>
                {preparadores.map((prep) => (
                  <SelectItem key={prep.id} value={prep.nombre}>
                    {prep.nombre} ({prep.pedidosAsignados} asignados)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prioridad de Preparación</Label>
            <Select
              value={prioridadAsignada}
              onValueChange={(v) => setPrioridadAsignada(v as "urgente" | "normal" | "baja")}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
