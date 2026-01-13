"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, CheckCircle, ScanLine, Play, Pause, Check, Layers } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PickingItem {
  id: string
  producto: string
  descripcion: string
  cantidad: number
  cantidadPickeada: number
  ubicacion: string
  lote: string
  estado: "pendiente" | "en_proceso" | "completado"
}

interface PedidoPicking {
  id: string
  documento: string
  cliente: string
  items: PickingItem[]
  progreso: number
  estado: "pendiente" | "en_proceso" | "completado"
}

const mockPedidosPicking: PedidoPicking[] = [
  {
    id: "1",
    documento: "PED-2025-002",
    cliente: "Distribuidora XYZ",
    progreso: 0,
    estado: "pendiente",
    items: [
      {
        id: "1-1",
        producto: "PRD-001",
        descripcion: "Producto A",
        cantidad: 10,
        cantidadPickeada: 0,
        ubicacion: "A-01-01-01",
        lote: "L2025-001",
        estado: "pendiente",
      },
      {
        id: "1-2",
        producto: "PRD-002",
        descripcion: "Producto B",
        cantidad: 5,
        cantidadPickeada: 0,
        ubicacion: "A-01-01-02",
        lote: "L2025-002",
        estado: "pendiente",
      },
      {
        id: "1-3",
        producto: "PRD-003",
        descripcion: "Producto C",
        cantidad: 8,
        cantidadPickeada: 0,
        ubicacion: "B-02-01-01",
        lote: "L2025-003",
        estado: "pendiente",
      },
    ],
  },
  {
    id: "2",
    documento: "PED-2025-003",
    cliente: "Comercial Norte",
    progreso: 60,
    estado: "en_proceso",
    items: [
      {
        id: "2-1",
        producto: "PRD-001",
        descripcion: "Producto A",
        cantidad: 15,
        cantidadPickeada: 15,
        ubicacion: "A-01-01-01",
        lote: "L2025-001",
        estado: "completado",
      },
      {
        id: "2-2",
        producto: "PRD-004",
        descripcion: "Producto D",
        cantidad: 20,
        cantidadPickeada: 12,
        ubicacion: "C-01-01-01",
        lote: "L2025-004",
        estado: "en_proceso",
      },
    ],
  },
]

export default function PickingPage() {
  const [pedidos, setPedidos] = useState<PedidoPicking[]>(mockPedidosPicking)
  const [selectedPedido, setSelectedPedido] = useState<PedidoPicking | null>(null)
  const [scanInput, setScanInput] = useState("")
  const [activeTab, setActiveTab] = useState("individual")

  const handleIniciarPicking = (pedido: PedidoPicking) => {
    setPedidos(pedidos.map((p) => (p.id === pedido.id ? { ...p, estado: "en_proceso" } : p)))
    setSelectedPedido(pedido)
  }

  const handleScan = () => {
    if (selectedPedido && scanInput) {
      // Simulate scanning
      const updatedItems = selectedPedido.items.map((item) => {
        if (item.ubicacion === scanInput || item.producto === scanInput) {
          return { ...item, cantidadPickeada: item.cantidad, estado: "completado" as const }
        }
        return item
      })

      const completados = updatedItems.filter((i) => i.estado === "completado").length
      const progreso = Math.round((completados / updatedItems.length) * 100)

      const updatedPedido = {
        ...selectedPedido,
        items: updatedItems,
        progreso,
        estado: progreso === 100 ? ("completado" as const) : ("en_proceso" as const),
      }

      setPedidos(pedidos.map((p) => (p.id === selectedPedido.id ? updatedPedido : p)))
      setSelectedPedido(updatedPedido)
      setScanInput("")
    }
  }

  const handleFinalizarPicking = () => {
    if (selectedPedido) {
      setPedidos(
        pedidos.map((p) =>
          p.id === selectedPedido.id
            ? {
                ...p,
                estado: "completado",
                progreso: 100,
                items: p.items.map((i) => ({ ...i, estado: "completado" as const, cantidadPickeada: i.cantidad })),
              }
            : p,
        ),
      )
      setSelectedPedido(null)
    }
  }

  return (
    <MainLayout>
      <PageHeader title="Picking de Pedidos" description="Preparación de pedidos para despacho" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Picking por Pedido
          </TabsTrigger>
          <TabsTrigger value="consolidado" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Picking Consolidado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pedidos List */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Pedidos para Picking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pedidos.map((pedido) => (
                    <div
                      key={pedido.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPedido?.id === pedido.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/50 hover:bg-secondary"
                      }`}
                      onClick={() => setSelectedPedido(pedido)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{pedido.documento}</span>
                        <Badge
                          className={
                            pedido.estado === "completado"
                              ? "bg-green-600"
                              : pedido.estado === "en_proceso"
                                ? "bg-blue-600"
                                : "bg-yellow-600"
                          }
                        >
                          {pedido.estado === "completado"
                            ? "Completado"
                            : pedido.estado === "en_proceso"
                              ? "En Proceso"
                              : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pedido.cliente}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{pedido.items.length} items</span>
                          <span>{pedido.progreso}%</span>
                        </div>
                        <Progress value={pedido.progreso} className="h-2" />
                      </div>
                      {pedido.estado === "pendiente" && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-primary text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleIniciarPicking(pedido)
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" /> Iniciar Picking
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Picking Detail */}
            <div className="lg:col-span-2">
              {selectedPedido ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {selectedPedido.documento}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{selectedPedido.cliente}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            selectedPedido.estado === "completado"
                              ? "bg-green-600"
                              : selectedPedido.estado === "en_proceso"
                                ? "bg-blue-600"
                                : "bg-yellow-600"
                          }
                        >
                          {selectedPedido.progreso}% Completado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scanner */}
                    {selectedPedido.estado !== "completado" && (
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <Label className="flex items-center gap-2 mb-2">
                          <ScanLine className="w-4 h-4 text-primary" />
                          Escanear Ubicación / Producto
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Escanee o ingrese código..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleScan()}
                            className="bg-secondary border-border"
                          />
                          <Button onClick={handleScan} className="bg-primary text-primary-foreground">
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary hover:bg-secondary">
                            <TableHead>Producto</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Lote</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-center">Pickeado</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPedido.items.map((item) => (
                            <TableRow key={item.id} className={item.estado === "completado" ? "bg-green-600/10" : ""}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.producto}</p>
                                  <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {item.ubicacion}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{item.lote}</TableCell>
                              <TableCell className="text-center font-bold">{item.cantidad}</TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={
                                    item.cantidadPickeada === item.cantidad ? "text-green-400" : "text-yellow-400"
                                  }
                                >
                                  {item.cantidadPickeada}
                                </span>
                              </TableCell>
                              <TableCell>
                                {item.estado === "completado" ? (
                                  <Badge className="bg-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    OK
                                  </Badge>
                                ) : item.estado === "en_proceso" ? (
                                  <Badge className="bg-blue-600">En proceso</Badge>
                                ) : (
                                  <Badge className="bg-yellow-600">Pendiente</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Actions */}
                    {selectedPedido.estado !== "completado" && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="bg-secondary border-border">
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                        <Button onClick={handleFinalizarPicking} className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4 mr-2" />
                          Finalizar Picking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Seleccione un pedido para iniciar el picking</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consolidado">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Picking Consolidado</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>El picking consolidado agrupa múltiples pedidos para optimizar la preparación</p>
              <Button className="mt-4 bg-primary text-primary-foreground">Crear Consolidado</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  )
}
