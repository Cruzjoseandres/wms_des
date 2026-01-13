"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ClipboardList,
  Plus,
  Play,
  Square,
  FileText,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface Inventario {
  id: string
  codigo: string
  tipo: "General" | "Parcial"
  estado: "Abierto" | "En Proceso" | "Cerrado"
  fechaApertura: string
  fechaCierre?: string
  almacen: string
  bodega?: string
  itemsContados: number
  itemsTotales: number
  diferencias: number
  responsable: string
}

const inventariosData: Inventario[] = [
  {
    id: "1",
    codigo: "INV-2025-001",
    tipo: "General",
    estado: "Abierto",
    fechaApertura: "2025-01-08",
    almacen: "PT9 NUEVO CEDIS",
    itemsContados: 450,
    itemsTotales: 1765,
    diferencias: 0,
    responsable: "Carlos Mendoza",
  },
  {
    id: "2",
    codigo: "INV-2025-002",
    tipo: "Parcial",
    estado: "En Proceso",
    fechaApertura: "2025-01-05",
    almacen: "PT9 NUEVO CEDIS",
    bodega: "Bodega A",
    itemsContados: 280,
    itemsTotales: 320,
    diferencias: 5,
    responsable: "María López",
  },
  {
    id: "3",
    codigo: "INV-2024-089",
    tipo: "General",
    estado: "Cerrado",
    fechaApertura: "2024-12-15",
    fechaCierre: "2024-12-18",
    almacen: "PT9 NUEVO CEDIS",
    itemsContados: 1720,
    itemsTotales: 1720,
    diferencias: 12,
    responsable: "Juan Pérez",
  },
]

export default function GestionInventarioPage() {
  const [inventarios, setInventarios] = useState<Inventario[]>(inventariosData)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedInventario, setSelectedInventario] = useState<Inventario | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>("all")

  const [newInventario, setNewInventario] = useState({
    tipo: "General" as "General" | "Parcial",
    almacen: "",
    bodega: "",
    responsable: "",
  })

  const inventariosAbiertos = inventarios.filter((i) => i.estado === "Abierto").length
  const inventariosEnProceso = inventarios.filter((i) => i.estado === "En Proceso").length
  const inventariosCerrados = inventarios.filter((i) => i.estado === "Cerrado").length

  const filteredInventarios = inventarios.filter((inv) => {
    if (filterEstado !== "all" && inv.estado !== filterEstado) return false
    return true
  })

  const handleCreateInventario = () => {
    const newInv: Inventario = {
      id: Date.now().toString(),
      codigo: `INV-2025-${String(inventarios.length + 1).padStart(3, "0")}`,
      tipo: newInventario.tipo,
      estado: "Abierto",
      fechaApertura: new Date().toISOString().split("T")[0],
      almacen: newInventario.almacen,
      bodega: newInventario.tipo === "Parcial" ? newInventario.bodega : undefined,
      itemsContados: 0,
      itemsTotales: newInventario.tipo === "General" ? 1765 : 320,
      diferencias: 0,
      responsable: newInventario.responsable,
    }
    setInventarios([newInv, ...inventarios])
    setShowNewModal(false)
    setNewInventario({ tipo: "General", almacen: "", bodega: "", responsable: "" })
  }

  const handleCerrarInventario = (inv: Inventario) => {
    setInventarios(
      inventarios.map((i) =>
        i.id === inv.id ? { ...i, estado: "Cerrado" as const, fechaCierre: new Date().toISOString().split("T")[0] } : i,
      ),
    )
  }

  const handleIniciarConteo = (inv: Inventario) => {
    setInventarios(inventarios.map((i) => (i.id === inv.id ? { ...i, estado: "En Proceso" as const } : i)))
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return <Badge className="bg-blue-600 text-white">Abierto</Badge>
      case "En Proceso":
        return <Badge className="bg-amber-500 text-white">En Proceso</Badge>
      case "Cerrado":
        return <Badge className="bg-green-600 text-white">Cerrado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getProgressPercentage = (contados: number, totales: number) => {
    return Math.round((contados / totales) * 100)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Gestión de Inventarios"
          description="Apertura, seguimiento y cierre de inventarios"
          icon={<ClipboardList className="h-6 w-6" />}
          actions={
            <Button onClick={() => setShowNewModal(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Inventario
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Abiertos</p>
                  <p className="text-3xl font-bold text-white">{inventariosAbiertos}</p>
                </div>
                <Clock className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">En Proceso</p>
                  <p className="text-3xl font-bold text-white">{inventariosEnProceso}</p>
                </div>
                <Play className="h-10 w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Cerrados</p>
                  <p className="text-3xl font-bold text-white">{inventariosCerrados}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Con Diferencias</p>
                  <p className="text-3xl font-bold text-white">{inventarios.filter((i) => i.diferencias > 0).length}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-48">
                <Label className="text-muted-foreground">Estado</Label>
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Abierto">Abierto</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventarios Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Inventarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Código</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Almacén/Bodega</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Apertura</TableHead>
                  <TableHead className="text-muted-foreground">Progreso</TableHead>
                  <TableHead className="text-muted-foreground">Diferencias</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Responsable</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventarios.map((inv) => (
                  <TableRow key={inv.id} className="border-border">
                    <TableCell className="text-foreground font-medium">{inv.codigo}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          inv.tipo === "General" ? "border-purple-500 text-purple-500" : "border-cyan-500 text-cyan-500"
                        }
                      >
                        {inv.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{inv.almacen}</div>
                          {inv.bodega && <div className="text-xs text-muted-foreground">{inv.bodega}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {inv.fechaApertura}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {inv.itemsContados}/{inv.itemsTotales}
                          </span>
                          <span className="text-foreground">
                            {getProgressPercentage(inv.itemsContados, inv.itemsTotales)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(inv.itemsContados, inv.itemsTotales)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inv.diferencias > 0 ? (
                        <span className="text-red-500 font-medium">{inv.diferencias}</span>
                      ) : (
                        <span className="text-green-500">0</span>
                      )}
                    </TableCell>
                    <TableCell>{getEstadoBadge(inv.estado)}</TableCell>
                    <TableCell className="text-foreground">{inv.responsable}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inv.estado === "Abierto" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleIniciarConteo(inv)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {inv.estado === "En Proceso" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCerrarInventario(inv)}
                          >
                            <Square className="h-3 w-3 mr-1" />
                            Cerrar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInventario(inv)
                            setShowReportModal(true)
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Reporte
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* New Inventory Modal */}
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nuevo Inventario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Tipo de Inventario</Label>
                <Select
                  value={newInventario.tipo}
                  onValueChange={(v) => setNewInventario({ ...newInventario, tipo: v as "General" | "Parcial" })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General (Todo el almacén)</SelectItem>
                    <SelectItem value="Parcial">Parcial (Por bodega/zona)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Almacén</Label>
                <Select
                  value={newInventario.almacen}
                  onValueChange={(v) => setNewInventario({ ...newInventario, almacen: v })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Seleccionar almacén" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PT9 NUEVO CEDIS">PT9 NUEVO CEDIS</SelectItem>
                    <SelectItem value="PT5 CENTRAL">PT5 CENTRAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newInventario.tipo === "Parcial" && (
                <div>
                  <Label className="text-muted-foreground">Bodega/Zona</Label>
                  <Select
                    value={newInventario.bodega}
                    onValueChange={(v) => setNewInventario({ ...newInventario, bodega: v })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Seleccionar bodega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bodega A">Bodega A</SelectItem>
                      <SelectItem value="Bodega B">Bodega B</SelectItem>
                      <SelectItem value="Bodega C">Bodega C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Responsable</Label>
                <Input
                  value={newInventario.responsable}
                  onChange={(e) => setNewInventario({ ...newInventario, responsable: e.target.value })}
                  placeholder="Nombre del responsable"
                  className="bg-background border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleCreateInventario}
                disabled={!newInventario.almacen || !newInventario.responsable}
              >
                Crear Inventario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Modal */}
        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Reporte de Inventario - {selectedInventario?.codigo}
              </DialogTitle>
            </DialogHeader>
            {selectedInventario && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-lg font-medium text-foreground">{selectedInventario.tipo}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="text-lg font-medium">{getEstadoBadge(selectedInventario.estado)}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Items Contados</p>
                    <p className="text-lg font-medium text-foreground">
                      {selectedInventario.itemsContados} / {selectedInventario.itemsTotales}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferencias</p>
                    <p
                      className={`text-lg font-medium ${selectedInventario.diferencias > 0 ? "text-red-500" : "text-green-500"}`}
                    >
                      {selectedInventario.diferencias}
                    </p>
                  </div>
                </div>
                {selectedInventario.diferencias > 0 && (
                  <Card className="bg-red-500/10 border-red-500/20">
                    <CardHeader>
                      <CardTitle className="text-red-500 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Diferencias Encontradas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-muted-foreground">Producto</TableHead>
                            <TableHead className="text-muted-foreground">Sistema</TableHead>
                            <TableHead className="text-muted-foreground">Físico</TableHead>
                            <TableHead className="text-muted-foreground">Diferencia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-foreground">PROD-001</TableCell>
                            <TableCell className="text-foreground">150</TableCell>
                            <TableCell className="text-foreground">147</TableCell>
                            <TableCell className="text-red-500">-3</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-foreground">PROD-045</TableCell>
                            <TableCell className="text-foreground">80</TableCell>
                            <TableCell className="text-foreground">82</TableCell>
                            <TableCell className="text-green-500">+2</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportModal(false)}>
                Cerrar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
