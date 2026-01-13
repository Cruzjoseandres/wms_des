"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Check, MapPin, Package, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ItemUbicacion {
  id: string
  producto: string
  descripcion: string
  cantidad: number
  lote: string
  ubicacionActual: string
  tipoUbicacion: "picking" | "reserva"
}

interface MovimientoReciente {
  id: string
  producto: string
  origen: string
  destino: string
  cantidad: number
  fecha: string
  usuario: string
}

const mockItems: ItemUbicacion[] = [
  {
    id: "1",
    producto: "PRD-001",
    descripcion: "Producto A - Alta rotación",
    cantidad: 150,
    lote: "L2025-001",
    ubicacionActual: "A-01-01-01",
    tipoUbicacion: "picking",
  },
  {
    id: "2",
    producto: "PRD-002",
    descripcion: "Producto B - Media rotación",
    cantidad: 80,
    lote: "L2025-002",
    ubicacionActual: "A-01-02-01",
    tipoUbicacion: "reserva",
  },
  {
    id: "3",
    producto: "PRD-003",
    descripcion: "Producto C - Baja rotación",
    cantidad: 45,
    lote: "L2025-003",
    ubicacionActual: "B-02-01-01",
    tipoUbicacion: "picking",
  },
]

const mockMovimientos: MovimientoReciente[] = [
  {
    id: "1",
    producto: "PRD-005",
    origen: "C-01-01-01",
    destino: "A-01-03-02",
    cantidad: 50,
    fecha: "2025-01-08 10:30",
    usuario: "Juan Pérez",
  },
  {
    id: "2",
    producto: "PRD-001",
    origen: "A-01-02-01",
    destino: "A-01-01-01",
    cantidad: 100,
    fecha: "2025-01-08 09:15",
    usuario: "María García",
  },
  {
    id: "3",
    producto: "PRD-008",
    origen: "B-01-01-01",
    destino: "C-02-01-01",
    cantidad: 30,
    fecha: "2025-01-07 16:45",
    usuario: "Carlos López",
  },
]

export default function ReubicacionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<ItemUbicacion | null>(null)
  const [ubicacionDestino, setUbicacionDestino] = useState("")
  const [cantidadMover, setCantidadMover] = useState("")

  const filteredItems = mockItems.filter(
    (item) =>
      item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacionActual.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleReubicacion = () => {
    if (selectedItem && ubicacionDestino && cantidadMover) {
      alert(
        `Reubicación confirmada:\n${selectedItem.producto}\n${selectedItem.ubicacionActual} → ${ubicacionDestino}\nCantidad: ${cantidadMover}`,
      )
      setSelectedItem(null)
      setUbicacionDestino("")
      setCantidadMover("")
    }
  }

  return (
    <MainLayout>
      <PageHeader title="Reubicación de Ítems" description="Movimiento de productos entre ubicaciones del almacén" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Select */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Buscar Ítem o Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código de producto o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead>Producto</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`hover:bg-muted/50 cursor-pointer ${selectedItem?.id === item.id ? "bg-primary/20" : ""}`}
                        onClick={() => {
                          setSelectedItem(item)
                          setCantidadMover(String(item.cantidad))
                        }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.producto}</p>
                            <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.ubicacionActual}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.tipoUbicacion === "picking" ? "bg-blue-600" : "bg-purple-600"}>
                            {item.tipoUbicacion}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.lote}</TableCell>
                        <TableCell className="text-right font-bold">{item.cantidad}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-primary">
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Movimientos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead>Producto</TableHead>
                      <TableHead>Movimiento</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovimientos.map((mov) => (
                      <TableRow key={mov.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{mov.producto}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {mov.origen}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge className="bg-primary font-mono text-xs">{mov.destino}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{mov.cantidad}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mov.fecha}</TableCell>
                        <TableCell className="text-sm">{mov.usuario}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reubication Panel */}
        <div>
          <Card className="bg-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Confirmar Reubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedItem.producto}</p>
                        <p className="text-sm text-muted-foreground">{selectedItem.descripcion}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Lote</Label>
                        <p className="font-medium">{selectedItem.lote}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Disponible</Label>
                        <p className="font-medium">{selectedItem.cantidad}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ubicación Origen</Label>
                      <Badge variant="outline" className="font-mono mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {selectedItem.ubicacionActual}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad a Mover *</Label>
                    <Input
                      type="number"
                      value={cantidadMover}
                      onChange={(e) => setCantidadMover(e.target.value)}
                      max={selectedItem.cantidad}
                      min={1}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ubicación Destino *</Label>
                    <Select value={ubicacionDestino} onValueChange={setUbicacionDestino}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-01-01-02">A-01-01-02 (Picking)</SelectItem>
                        <SelectItem value="A-01-02-01">A-01-02-01 (Reserva)</SelectItem>
                        <SelectItem value="A-01-03-01">A-01-03-01 (Picking)</SelectItem>
                        <SelectItem value="B-01-01-01">B-01-01-01 (Picking)</SelectItem>
                        <SelectItem value="C-01-01-01">C-01-01-01 (Despacho)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {ubicacionDestino && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {selectedItem.ubicacionActual}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-primary" />
                        <Badge className="bg-primary font-mono">{ubicacionDestino}</Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleReubicacion}
                    disabled={!ubicacionDestino || !cantidadMover}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Reubicación
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Seleccione un ítem de la lista para reubicar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
