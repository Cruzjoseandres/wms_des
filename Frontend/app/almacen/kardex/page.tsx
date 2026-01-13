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
import { Search, ArrowUpRight, ArrowDownRight, Printer, FileText, Package, Calendar, History } from "lucide-react"

interface MovimientoKardex {
  id: string
  fecha: string
  tipoMovimiento: "ingreso" | "salida" | "ajuste_positivo" | "ajuste_negativo" | "reubicacion"
  documento: string
  descripcion: string
  cantidad: number
  saldoAnterior: number
  saldoActual: number
  ubicacion: string
  usuario: string
}

interface ProductoKardex {
  codigo: string
  descripcion: string
  categoria: string
  unidadMedida: string
  stockActual: number
  movimientos: MovimientoKardex[]
}

const mockProducto: ProductoKardex = {
  codigo: "PRD-001",
  descripcion: "Producto A - Alta rotación",
  categoria: "Electrónicos",
  unidadMedida: "UND",
  stockActual: 150,
  movimientos: [
    {
      id: "1",
      fecha: "2025-01-08 10:30",
      tipoMovimiento: "salida",
      documento: "PED-2025-050",
      descripcion: "Salida por venta - Cliente XYZ",
      cantidad: 25,
      saldoAnterior: 175,
      saldoActual: 150,
      ubicacion: "A-01-01-01",
      usuario: "Carlos López",
    },
    {
      id: "2",
      fecha: "2025-01-07 15:20",
      tipoMovimiento: "ingreso",
      documento: "ING-2025-003",
      descripcion: "Ingreso de producción",
      cantidad: 50,
      saldoAnterior: 125,
      saldoActual: 175,
      ubicacion: "A-01-01-01",
      usuario: "María García",
    },
    {
      id: "3",
      fecha: "2025-01-06 09:00",
      tipoMovimiento: "ajuste_negativo",
      documento: "AJU-2025-001",
      descripcion: "Ajuste por inventario - Diferencia",
      cantidad: 5,
      saldoAnterior: 130,
      saldoActual: 125,
      ubicacion: "A-01-01-01",
      usuario: "Juan Pérez",
    },
    {
      id: "4",
      fecha: "2025-01-05 14:45",
      tipoMovimiento: "salida",
      documento: "PED-2025-045",
      descripcion: "Salida por venta - Cliente ABC",
      cantidad: 20,
      saldoAnterior: 150,
      saldoActual: 130,
      ubicacion: "A-01-01-01",
      usuario: "Carlos López",
    },
    {
      id: "5",
      fecha: "2025-01-04 11:30",
      tipoMovimiento: "reubicacion",
      documento: "REU-2025-008",
      descripcion: "Reubicación desde B-02-01-01",
      cantidad: 30,
      saldoAnterior: 120,
      saldoActual: 150,
      ubicacion: "A-01-01-01",
      usuario: "Ana Martínez",
    },
    {
      id: "6",
      fecha: "2025-01-03 16:00",
      tipoMovimiento: "ingreso",
      documento: "ING-2025-001",
      descripcion: "Ingreso de producción",
      cantidad: 100,
      saldoAnterior: 20,
      saldoActual: 120,
      ubicacion: "A-01-01-01",
      usuario: "María García",
    },
  ],
}

const tipoColors: Record<string, string> = {
  ingreso: "bg-green-600",
  salida: "bg-red-600",
  ajuste_positivo: "bg-blue-600",
  ajuste_negativo: "bg-orange-600",
  reubicacion: "bg-purple-600",
}

const tipoLabels: Record<string, string> = {
  ingreso: "Ingreso",
  salida: "Salida",
  ajuste_positivo: "Ajuste +",
  ajuste_negativo: "Ajuste -",
  reubicacion: "Reubicación",
}

export default function KardexPage() {
  const [searchProduct, setSearchProduct] = useState("PRD-001")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [producto, setProducto] = useState<ProductoKardex | null>(mockProducto)

  const handleSearch = () => {
    // Simulate search
    setProducto(mockProducto)
  }

  const filteredMovimientos = producto?.movimientos.filter((mov) => {
    return filterTipo === "todos" || mov.tipoMovimiento === filterTipo
  })

  const totalIngresos =
    producto?.movimientos.filter((m) => m.tipoMovimiento === "ingreso").reduce((acc, m) => acc + m.cantidad, 0) || 0

  const totalSalidas =
    producto?.movimientos.filter((m) => m.tipoMovimiento === "salida").reduce((acc, m) => acc + m.cantidad, 0) || 0

  return (
    <MainLayout>
      <PageHeader title="Kardex de Ítems" description="Historial de movimientos por producto">
        <Button variant="outline" className="bg-secondary border-border">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </PageHeader>

      {/* Search */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Código Producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label>Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="w-[150px]">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="w-[150px]">
              <Label>Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ingreso">Ingresos</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                  <SelectItem value="ajuste_positivo">Ajustes +</SelectItem>
                  <SelectItem value="ajuste_negativo">Ajustes -</SelectItem>
                  <SelectItem value="reubicacion">Reubicaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="bg-primary text-primary-foreground">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {producto && (
        <>
          {/* Product Info */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{producto.codigo}</h3>
                    <p className="text-muted-foreground">{producto.descripcion}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>
                        Categoría: <strong>{producto.categoria}</strong>
                      </span>
                      <span>
                        U.M.: <strong>{producto.unidadMedida}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Stock Actual</p>
                    <p className="text-3xl font-bold text-primary">{producto.stockActual}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-600/20 border-green-600/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4" />
                  Total Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-400">+{totalIngresos}</p>
              </CardContent>
            </Card>

            <Card className="bg-red-600/20 border-red-600/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Total Salidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-400">-{totalSalidas}</p>
              </CardContent>
            </Card>
          </div>

          {/* Movements Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Detalle de Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Saldo Ant.</TableHead>
                      <TableHead className="text-right">Saldo Act.</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovimientos?.map((mov) => (
                      <TableRow key={mov.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {mov.fecha}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={tipoColors[mov.tipoMovimiento]}>{tipoLabels[mov.tipoMovimiento]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            <FileText className="w-3 h-3 mr-1" />
                            {mov.documento}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{mov.descripcion}</TableCell>
                        <TableCell className="font-mono text-sm">{mov.ubicacion}</TableCell>
                        <TableCell
                          className={`text-right font-bold ${
                            mov.tipoMovimiento === "ingreso" ||
                            mov.tipoMovimiento === "ajuste_positivo" ||
                            mov.tipoMovimiento === "reubicacion"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {mov.tipoMovimiento === "ingreso" ||
                          mov.tipoMovimiento === "ajuste_positivo" ||
                          mov.tipoMovimiento === "reubicacion"
                            ? "+"
                            : "-"}
                          {mov.cantidad}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{mov.saldoAnterior}</TableCell>
                        <TableCell className="text-right font-bold">{mov.saldoActual}</TableCell>
                        <TableCell className="text-sm">{mov.usuario}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </MainLayout>
  )
}
