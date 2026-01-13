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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MapPin, Package, Check, ArrowRight } from "lucide-react"

interface ItemPendiente {
  id: string
  documento: string
  producto: string
  descripcion: string
  cantidad: number
  lote: string
  ubicacionSugerida: string
  estado: "pendiente" | "ubicado"
}

const mockItems: ItemPendiente[] = [
  {
    id: "1",
    documento: "ING-2025-001",
    producto: "PRD-001",
    descripcion: "Producto A - Alta rotación",
    cantidad: 50,
    lote: "L2025-001",
    ubicacionSugerida: "A-01-01-01",
    estado: "pendiente",
  },
  {
    id: "2",
    documento: "ING-2025-001",
    producto: "PRD-002",
    descripcion: "Producto B - Media rotación",
    cantidad: 30,
    lote: "L2025-002",
    ubicacionSugerida: "A-01-01-02",
    estado: "pendiente",
  },
  {
    id: "3",
    documento: "ING-2025-002",
    producto: "PRD-003",
    descripcion: "Producto C - Baja rotación",
    cantidad: 25,
    lote: "L2025-003",
    ubicacionSugerida: "B-02-01-01",
    estado: "ubicado",
  },
]

export default function UbicacionItemsPage() {
  const [items, setItems] = useState<ItemPendiente[]>(mockItems)
  const [searchDoc, setSearchDoc] = useState("")
  const [selectedItem, setSelectedItem] = useState<ItemPendiente | null>(null)
  const [ubicacionDestino, setUbicacionDestino] = useState("")

  const filteredItems = items.filter(
    (item) =>
      item.documento.toLowerCase().includes(searchDoc.toLowerCase()) ||
      item.producto.toLowerCase().includes(searchDoc.toLowerCase()),
  )

  const handleAsignarUbicacion = () => {
    if (selectedItem && ubicacionDestino) {
      setItems(items.map((i) => (i.id === selectedItem.id ? { ...i, estado: "ubicado" } : i)))
      setSelectedItem(null)
      setUbicacionDestino("")
    }
  }

  const pendientesCount = items.filter((i) => i.estado === "pendiente").length
  const ubicadosCount = items.filter((i) => i.estado === "ubicado").length

  return (
    <MainLayout>
      <PageHeader title="Ubicación de Ítems" description="Asignación de ubicaciones a productos ingresados" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Pendientes de Ubicar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{pendientesCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-600/20 border-green-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicados Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{ubicadosCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Ítems Pendientes de Ubicación</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por documento o producto..."
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead>Documento</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Sugerida</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`hover:bg-muted/50 cursor-pointer ${selectedItem?.id === item.id ? "bg-primary/20" : ""}`}
                        onClick={() => item.estado === "pendiente" && setSelectedItem(item)}
                      >
                        <TableCell className="font-medium">{item.documento}</TableCell>
                        <TableCell>
                          <div>
                            <p>{item.producto}</p>
                            <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>{item.lote}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {item.ubicacionSugerida}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.estado === "pendiente" ? "bg-yellow-600" : "bg-green-600"}>
                            {item.estado === "pendiente" ? "Pendiente" : "Ubicado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.estado === "pendiente" && (
                            <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                              Seleccionar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Panel */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Asignar Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Producto Seleccionado</Label>
                      <p className="font-medium">{selectedItem.producto}</p>
                      <p className="text-sm text-muted-foreground">{selectedItem.descripcion}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Cantidad</Label>
                        <p className="font-medium">{selectedItem.cantidad}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Lote</Label>
                        <p className="font-medium">{selectedItem.lote}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ubicación Sugerida</Label>
                      <Badge variant="outline" className="font-mono mt-1">
                        {selectedItem.ubicacionSugerida}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ubicación Destino *</Label>
                    <Select value={ubicacionDestino} onValueChange={setUbicacionDestino}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-01-01-01">A-01-01-01 (Picking)</SelectItem>
                        <SelectItem value="A-01-01-02">A-01-01-02 (Picking)</SelectItem>
                        <SelectItem value="A-01-02-01">A-01-02-01 (Reserva)</SelectItem>
                        <SelectItem value="B-02-01-01">B-02-01-01 (Recepción)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="outline">{selectedItem.ubicacionSugerida}</Badge>
                      <ArrowRight className="w-4 h-4" />
                      <Badge className="bg-primary">{ubicacionDestino || "???"}</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleAsignarUbicacion}
                    disabled={!ubicacionDestino}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Almacenamiento
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Seleccione un ítem de la lista para asignar ubicación</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
