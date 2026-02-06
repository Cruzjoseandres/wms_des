"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, MapPin, AlertTriangle, Calendar, Printer, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StockInventarioService } from "@/lib/api/stock_inventario.service"
import type { StockInventario } from "@/lib/models"
import { toast } from "sonner"

interface StockItem {
  id: string
  producto: string
  descripcion: string
  ubicacion: string
  lote: string
  vencimiento: string
  cantidad: number
  stockMinimo: number
  stockMaximo: number
  estado: "normal" | "bajo" | "agotado" | "vencer"
}

// Helper to check stock status
const getStockStatus = (stock: number, fechaVencimiento?: string): "normal" | "bajo" | "agotado" | "vencer" => {
  if (stock <= 0) return "agotado"
  if (stock < 20) return "bajo"

  // Check if about to expire (within 30 days)
  if (fechaVencimiento) {
    const vence = new Date(fechaVencimiento)
    const hoy = new Date()
    const diasRestantes = Math.floor((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diasRestantes <= 30 && diasRestantes > 0) return "vencer"
  }

  return "normal"
}

const estadoColors: Record<string, string> = {
  normal: "bg-green-600",
  bajo: "bg-yellow-600",
  agotado: "bg-red-600",
  vencer: "bg-orange-600",
}

const estadoLabels: Record<string, string> = {
  normal: "Normal",
  bajo: "Stock Bajo",
  agotado: "Agotado",
  vencer: "Por Vencer",
}

export default function ControlStockPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterUbicacion, setFilterUbicacion] = useState<string>("todas")

  useEffect(() => {
    loadStock()
  }, [])

  const loadStock = async () => {
    setIsLoading(true)
    try {
      const data = await StockInventarioService.getAll()
      console.log("stock items", data)

      const stockItems: StockItem[] = data.map((item: StockInventario) => {
        const lote = item.detalleIngreso?.lote || "-"
        const vencimiento = item.detalleIngreso?.fechaVencimiento
          ? new Date(item.detalleIngreso.fechaVencimiento).toLocaleDateString("es-ES")
          : "-"
        const codigo = item.item?.codigo || "N/A"
        const descripcion = item.item?.descripcion || item.detalleIngreso?.codItem || "Sin descripción"

        return {
          id: String(item.id),
          producto: codigo,
          descripcion: descripcion,
          ubicacion: item.ubicacion,
          lote: lote,
          vencimiento: vencimiento,
          cantidad: Number(item.cantidad) || 0,
          stockMinimo: 20,
          stockMaximo: 1000,
          estado: getStockStatus(Number(item.cantidad) || 0, item.detalleIngreso?.fechaVencimiento ?? undefined)
        }
      })
      setItems(stockItems)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar el stock")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStock = items.filter((item) => {
    const matchesSearch =
      item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado
    const matchesUbicacion = filterUbicacion === "todas" || item.ubicacion.startsWith(filterUbicacion)
    return matchesSearch && matchesEstado && matchesUbicacion
  })

  const stats = {
    normal: items.filter((i) => i.estado === "normal").length,
    bajo: items.filter((i) => i.estado === "bajo").length,
    agotado: items.filter((i) => i.estado === "agotado").length,
    vencer: items.filter((i) => i.estado === "vencer").length,
  }

  return (
    <MainLayout>
      <PageHeader title="Control de Stock" description="Disponibilidad y estado de inventario">
        <Button variant="outline" className="bg-secondary border-border" onClick={loadStock}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
          Actualizar
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card
          className="bg-green-600/20 border-green-600/50 cursor-pointer hover:bg-green-600/30"
          onClick={() => setFilterEstado("normal")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Stock Normal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{stats.normal}</p>
          </CardContent>
        </Card>
        <Card
          className="bg-yellow-600/20 border-yellow-600/50 cursor-pointer hover:bg-yellow-600/30"
          onClick={() => setFilterEstado("bajo")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{stats.bajo}</p>
          </CardContent>
        </Card>
        <Card
          className="bg-red-600/20 border-red-600/50 cursor-pointer hover:bg-red-600/30"
          onClick={() => setFilterEstado("agotado")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Agotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{stats.agotado}</p>
          </CardContent>
        </Card>
        <Card
          className="bg-orange-600/20 border-orange-600/50 cursor-pointer hover:bg-orange-600/30"
          onClick={() => setFilterEstado("vencer")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Por Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-400">{stats.vencer}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <Label className="sr-only">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto, código o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bajo">Stock Bajo</SelectItem>
                  <SelectItem value="agotado">Agotado</SelectItem>
                  <SelectItem value="vencer">Por Vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las ubicaciones</SelectItem>
                  <SelectItem value="A">Bodega A</SelectItem>
                  <SelectItem value="B">Bodega B</SelectItem>
                  <SelectItem value="C">Bodega C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="rounded-lg border border-border overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead>Producto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  ) : filteredStock.map((item) => {
                    const stockPercent = Math.min(100, Math.round((item.cantidad / item.stockMaximo) * 100))
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
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
                        <TableCell>{item.vencimiento}</TableCell>
                        <TableCell className="text-right font-bold">{item.cantidad}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[100px]">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {item.cantidad}/{item.stockMaximo}
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${item.cantidad < item.stockMinimo
                                  ? "bg-red-500"
                                  : stockPercent < 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  }`}
                                style={{ width: `${stockPercent}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={estadoColors[item.estado]}>{estadoLabels[item.estado]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                              <DialogHeader>
                                <DialogTitle>Detalle de Stock - {item.producto}</DialogTitle>
                                <DialogDescription>{item.descripcion}</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Ubicación</Label>
                                  <p className="font-medium">{item.ubicacion}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Lote</Label>
                                  <p className="font-medium">{item.lote}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Vencimiento</Label>
                                  <p className="font-medium">{item.vencimiento}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Stock Actual</Label>
                                  <p className="font-medium text-xl">{item.cantidad}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Stock Mínimo</Label>
                                  <p className="font-medium">{item.stockMinimo}</p>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Stock Máximo</Label>
                                  <p className="font-medium">{item.stockMaximo}</p>
                                </div>
                              </div>
                              <Button className="w-full" onClick={() => (window.location.href = "/almacen/kardex")}>
                                Ver Kardex
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
