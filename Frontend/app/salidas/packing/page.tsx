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
import { Box, Plus, CheckCircle, Printer, ScanLine } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PackingItem {
  id: string
  producto: string
  cantidad: number
  paquete: string | null
}

interface PedidoPacking {
  id: string
  documento: string
  cliente: string
  items: PackingItem[]
  paquetes: string[]
  estado: "pendiente" | "en_proceso" | "completado"
}

const mockPedidosPacking: PedidoPacking[] = [
  {
    id: "1",
    documento: "PED-2025-003",
    cliente: "Comercial Norte",
    estado: "en_proceso",
    paquetes: ["PAQ-001"],
    items: [
      { id: "1-1", producto: "PRD-001 - Producto A", cantidad: 15, paquete: "PAQ-001" },
      { id: "1-2", producto: "PRD-004 - Producto D", cantidad: 20, paquete: null },
    ],
  },
  {
    id: "2",
    documento: "PED-2025-004",
    cliente: "Tienda Central",
    estado: "pendiente",
    paquetes: [],
    items: [
      { id: "2-1", producto: "PRD-002 - Producto B", cantidad: 10, paquete: null },
      { id: "2-2", producto: "PRD-003 - Producto C", cantidad: 5, paquete: null },
      { id: "2-3", producto: "PRD-005 - Producto E", cantidad: 8, paquete: null },
    ],
  },
]

export default function PackingPage() {
  const [pedidos, setPedidos] = useState<PedidoPacking[]>(mockPedidosPacking)
  const [selectedPedido, setSelectedPedido] = useState<PedidoPacking | null>(null)
  const [newPaquete, setNewPaquete] = useState("")
  const [selectedPaquete, setSelectedPaquete] = useState<string>("")

  const handleIniciarPacking = (pedido: PedidoPacking) => {
    setPedidos(pedidos.map((p) => (p.id === pedido.id ? { ...p, estado: "en_proceso" } : p)))
    setSelectedPedido(pedido)
  }

  const handleCrearPaquete = () => {
    if (selectedPedido && newPaquete) {
      const updatedPedido = {
        ...selectedPedido,
        paquetes: [...selectedPedido.paquetes, newPaquete],
      }
      setPedidos(pedidos.map((p) => (p.id === selectedPedido.id ? updatedPedido : p)))
      setSelectedPedido(updatedPedido)
      setSelectedPaquete(newPaquete)
      setNewPaquete("")
    }
  }

  const handleAsignarPaquete = (itemId: string) => {
    if (selectedPedido && selectedPaquete) {
      const updatedItems = selectedPedido.items.map((item) =>
        item.id === itemId ? { ...item, paquete: selectedPaquete } : item,
      )
      const updatedPedido = { ...selectedPedido, items: updatedItems }
      setPedidos(pedidos.map((p) => (p.id === selectedPedido.id ? updatedPedido : p)))
      setSelectedPedido(updatedPedido)
    }
  }

  const handleFinalizarPacking = () => {
    if (selectedPedido) {
      setPedidos(pedidos.map((p) => (p.id === selectedPedido.id ? { ...p, estado: "completado" } : p)))
      setSelectedPedido(null)
    }
  }

  const getProgreso = (pedido: PedidoPacking) => {
    const empacados = pedido.items.filter((i) => i.paquete !== null).length
    return Math.round((empacados / pedido.items.length) * 100)
  }

  return (
    <MainLayout>
      <PageHeader title="Packing de Pedidos" description="Empaque de productos para despacho" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos List */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Pedidos para Empacar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pedidos.map((pedido) => {
                const progreso = getProgreso(pedido)
                return (
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
                              ? "bg-orange-600"
                              : "bg-yellow-600"
                        }
                      >
                        {pedido.estado === "completado"
                          ? "Empacado"
                          : pedido.estado === "en_proceso"
                            ? "Empacando"
                            : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pedido.cliente}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {pedido.items.length} items / {pedido.paquetes.length} paquetes
                        </span>
                        <span>{progreso}%</span>
                      </div>
                      <Progress value={progreso} className="h-2" />
                    </div>
                    {pedido.estado === "pendiente" && (
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-primary text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleIniciarPacking(pedido)
                        }}
                      >
                        <Box className="w-4 h-4 mr-1" /> Iniciar Packing
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Packing Detail */}
        <div className="lg:col-span-2">
          {selectedPedido ? (
            <div className="space-y-6">
              {/* Header */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-primary" />
                        {selectedPedido.documento}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedPedido.cliente}</p>
                    </div>
                    <Button variant="outline" className="bg-secondary border-border">
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir Etiquetas
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Paquetes */}
              {selectedPedido.estado !== "completado" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Gestión de Paquetes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre del paquete (ej: PAQ-002)"
                        value={newPaquete}
                        onChange={(e) => setNewPaquete(e.target.value)}
                        className="bg-secondary border-border"
                      />
                      <Button onClick={handleCrearPaquete} className="bg-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-1" /> Crear
                      </Button>
                    </div>

                    {selectedPedido.paquetes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedPedido.paquetes.map((paq) => (
                          <Badge
                            key={paq}
                            variant={selectedPaquete === paq ? "default" : "outline"}
                            className={`cursor-pointer ${selectedPaquete === paq ? "bg-primary" : ""}`}
                            onClick={() => setSelectedPaquete(paq)}
                          >
                            <Box className="w-3 h-3 mr-1" />
                            {paq}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {selectedPaquete && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Label className="text-xs text-muted-foreground">Paquete activo:</Label>
                        <p className="font-medium text-primary">{selectedPaquete}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Items */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Items del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary hover:bg-secondary">
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead>Paquete</TableHead>
                          <TableHead className="w-24">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPedido.items.map((item) => (
                          <TableRow key={item.id} className={item.paquete ? "bg-green-600/10" : ""}>
                            <TableCell className="font-medium">{item.producto}</TableCell>
                            <TableCell className="text-center">{item.cantidad}</TableCell>
                            <TableCell>
                              {item.paquete ? (
                                <Badge className="bg-green-600">
                                  <Box className="w-3 h-3 mr-1" />
                                  {item.paquete}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Sin asignar</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {!item.paquete && selectedPedido.estado !== "completado" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={!selectedPaquete}
                                  onClick={() => handleAsignarPaquete(item.id)}
                                  className="text-primary"
                                >
                                  <ScanLine className="w-4 h-4 mr-1" />
                                  Asignar
                                </Button>
                              )}
                              {item.paquete && <CheckCircle className="w-5 h-5 text-green-400" />}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedPedido.estado !== "completado" && (
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleFinalizarPacking}
                        disabled={selectedPedido.items.some((i) => !i.paquete)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar Packing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Seleccione un pedido para iniciar el empaque</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
