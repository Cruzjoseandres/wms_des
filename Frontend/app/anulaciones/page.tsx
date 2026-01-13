"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileX, Search, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"

interface Anulacion {
  id: string
  tipo: "ingreso" | "salida" | "pedido" | "inventario"
  documento: string
  fechaSolicitud: string
  solicitante: string
  motivo: string
  estado: "pendiente" | "aprobada" | "rechazada"
  fechaResolucion?: string
  aprobador?: string
}

const mockAnulaciones: Anulacion[] = [
  {
    id: "1",
    tipo: "ingreso",
    documento: "ING-2024-0045",
    fechaSolicitud: "2024-12-05",
    solicitante: "Carlos Pérez",
    motivo: "Error en cantidad recibida",
    estado: "pendiente",
  },
  {
    id: "2",
    tipo: "salida",
    documento: "SAL-2024-0123",
    fechaSolicitud: "2024-12-04",
    solicitante: "María López",
    motivo: "Pedido duplicado por error del sistema",
    estado: "aprobada",
    fechaResolucion: "2024-12-05",
    aprobador: "Admin Sistema",
  },
  {
    id: "3",
    tipo: "pedido",
    documento: "PED-2024-0089",
    fechaSolicitud: "2024-12-03",
    solicitante: "Juan García",
    motivo: "Cliente canceló el pedido",
    estado: "aprobada",
    fechaResolucion: "2024-12-04",
    aprobador: "Admin Sistema",
  },
  {
    id: "4",
    tipo: "ingreso",
    documento: "ING-2024-0042",
    fechaSolicitud: "2024-12-02",
    solicitante: "Ana Martínez",
    motivo: "Productos dañados en recepción",
    estado: "rechazada",
    fechaResolucion: "2024-12-03",
    aprobador: "Supervisor",
  },
  {
    id: "5",
    tipo: "inventario",
    documento: "INV-2024-0012",
    fechaSolicitud: "2024-12-06",
    solicitante: "Pedro Sánchez",
    motivo: "Conteo erróneo, requiere reconteo",
    estado: "pendiente",
  },
]

export default function AnulacionesPage() {
  const [anulaciones, setAnulaciones] = useState<Anulacion[]>(mockAnulaciones)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAnulacion, setSelectedAnulacion] = useState<Anulacion | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    tipo: "",
    documento: "",
    motivo: "",
  })

  const stats = {
    pendientes: anulaciones.filter((a) => a.estado === "pendiente").length,
    aprobadas: anulaciones.filter((a) => a.estado === "aprobada").length,
    rechazadas: anulaciones.filter((a) => a.estado === "rechazada").length,
    total: anulaciones.length,
  }

  const filteredAnulaciones = anulaciones.filter((a) => {
    const matchEstado = filterEstado === "todos" || a.estado === filterEstado
    const matchTipo = filterTipo === "todos" || a.tipo === filterTipo
    const matchSearch =
      a.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    return matchEstado && matchTipo && matchSearch
  })

  const columns = [
    {
      key: "tipo",
      label: "Tipo",
      render: (item: Anulacion) => (
        <Badge
          variant="outline"
          className={
            item.tipo === "ingreso"
              ? "border-blue-500 text-blue-500"
              : item.tipo === "salida"
                ? "border-orange-500 text-orange-500"
                : item.tipo === "pedido"
                  ? "border-purple-500 text-purple-500"
                  : "border-green-500 text-green-500"
          }
        >
          {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
        </Badge>
      ),
    },
    { key: "documento", label: "Documento" },
    { key: "fechaSolicitud", label: "Fecha Solicitud" },
    { key: "solicitante", label: "Solicitante" },
    { key: "motivo", label: "Motivo" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Anulacion) => (
        <Badge
          className={
            item.estado === "pendiente" ? "bg-yellow-600" : item.estado === "aprobada" ? "bg-green-600" : "bg-red-600"
          }
        >
          {item.estado === "pendiente" && <Clock className="w-3 h-3 mr-1" />}
          {item.estado === "aprobada" && <CheckCircle className="w-3 h-3 mr-1" />}
          {item.estado === "rechazada" && <XCircle className="w-3 h-3 mr-1" />}
          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setFormData({ tipo: "", documento: "", motivo: "" })
    setIsModalOpen(true)
  }

  const handleApprove = (anulacion: Anulacion) => {
    setAnulaciones(
      anulaciones.map((a) =>
        a.id === anulacion.id
          ? {
              ...a,
              estado: "aprobada" as const,
              fechaResolucion: new Date().toISOString().split("T")[0],
              aprobador: "Admin",
            }
          : a,
      ),
    )
  }

  const handleReject = (anulacion: Anulacion) => {
    setAnulaciones(
      anulaciones.map((a) =>
        a.id === anulacion.id
          ? {
              ...a,
              estado: "rechazada" as const,
              fechaResolucion: new Date().toISOString().split("T")[0],
              aprobador: "Admin",
            }
          : a,
      ),
    )
  }

  const handleSubmit = () => {
    const newAnulacion: Anulacion = {
      id: String(Date.now()),
      tipo: formData.tipo as Anulacion["tipo"],
      documento: formData.documento,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      solicitante: "Usuario Actual",
      motivo: formData.motivo,
      estado: "pendiente",
    }
    setAnulaciones([newAnulacion, ...anulaciones])
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Gestión de Anulaciones"
        description="Solicitudes de anulación de documentos"
        onNew={handleNew}
        newLabel="Nueva Solicitud"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.pendientes}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.aprobadas}</p>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.rechazadas}</p>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileX className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por documento o solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[150px] bg-secondary border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
                <SelectItem value="pedido">Pedido</SelectItem>
                <SelectItem value="inventario">Inventario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[150px] bg-secondary border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table with custom actions */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnulaciones.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {item.estado === "pendiente" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500/10 bg-transparent"
                            onClick={() => handleApprove(item)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                            onClick={() => handleReject(item)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                      {item.estado !== "pendiente" && (
                        <span className="text-xs text-muted-foreground">
                          {item.aprobador} - {item.fechaResolucion}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Anulación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Documento *</Label>
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="pedido">Pedido</SelectItem>
                  <SelectItem value="inventario">Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">Número de Documento *</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                placeholder="Ej: ING-2024-0045"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Anulación *</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Describa el motivo de la anulación..."
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-500">
                  La anulación quedará pendiente de aprobación por un supervisor. Una vez aprobada, los cambios serán
                  irreversibles.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.tipo || !formData.documento || !formData.motivo}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
