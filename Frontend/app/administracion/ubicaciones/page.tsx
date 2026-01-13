"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

interface Ubicacion {
  id: string
  codigo: string
  bodega: string
  rack: string
  nivel: string
  posicion: string
  tipo: "picking" | "reserva" | "recepcion" | "despacho"
  capacidad: number
  ocupacion: number
  estado: "activo" | "inactivo"
}

const mockUbicaciones: Ubicacion[] = [
  {
    id: "1",
    codigo: "A-01-01-01",
    bodega: "Bodega A",
    rack: "R01",
    nivel: "N1",
    posicion: "P01",
    tipo: "picking",
    capacidad: 100,
    ocupacion: 75,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "A-01-01-02",
    bodega: "Bodega A",
    rack: "R01",
    nivel: "N1",
    posicion: "P02",
    tipo: "picking",
    capacidad: 100,
    ocupacion: 50,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "A-01-02-01",
    bodega: "Bodega A",
    rack: "R01",
    nivel: "N2",
    posicion: "P01",
    tipo: "reserva",
    capacidad: 200,
    ocupacion: 180,
    estado: "activo",
  },
  {
    id: "4",
    codigo: "B-02-01-01",
    bodega: "Bodega B",
    rack: "R02",
    nivel: "N1",
    posicion: "P01",
    tipo: "recepcion",
    capacidad: 150,
    ocupacion: 0,
    estado: "activo",
  },
  {
    id: "5",
    codigo: "C-01-01-01",
    bodega: "Bodega C",
    rack: "R01",
    nivel: "N1",
    posicion: "P01",
    tipo: "despacho",
    capacidad: 100,
    ocupacion: 30,
    estado: "inactivo",
  },
]

const tipoColors: Record<string, string> = {
  picking: "bg-blue-600",
  reserva: "bg-purple-600",
  recepcion: "bg-green-600",
  despacho: "bg-orange-600",
}

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>(mockUbicaciones)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    bodega: "",
    rack: "",
    nivel: "",
    posicion: "",
    tipo: "picking" as Ubicacion["tipo"],
    capacidad: 100,
  })

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "bodega", label: "Bodega" },
    { key: "rack", label: "Rack" },
    { key: "nivel", label: "Nivel" },
    { key: "posicion", label: "Posición" },
    {
      key: "tipo",
      label: "Tipo",
      render: (item: Ubicacion) => <Badge className={tipoColors[item.tipo]}>{item.tipo.toUpperCase()}</Badge>,
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (item: Ubicacion) => {
        const percent = Math.round((item.ocupacion / item.capacidad) * 100)
        return (
          <div className="w-full max-w-[100px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{percent}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${percent > 80 ? "bg-red-500" : percent > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Ubicacion) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingUbicacion(null)
    setFormData({ codigo: "", bodega: "", rack: "", nivel: "", posicion: "", tipo: "picking", capacidad: 100 })
    setIsModalOpen(true)
  }

  const handleEdit = (ubicacion: Ubicacion) => {
    setEditingUbicacion(ubicacion)
    setFormData({
      codigo: ubicacion.codigo,
      bodega: ubicacion.bodega,
      rack: ubicacion.rack,
      nivel: ubicacion.nivel,
      posicion: ubicacion.posicion,
      tipo: ubicacion.tipo,
      capacidad: ubicacion.capacidad,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (ubicacion: Ubicacion) => {
    if (confirm(`¿Está seguro de eliminar la ubicación ${ubicacion.codigo}?`)) {
      setUbicaciones(ubicaciones.filter((u) => u.id !== ubicacion.id))
    }
  }

  const handleSubmit = () => {
    if (editingUbicacion) {
      setUbicaciones(ubicaciones.map((u) => (u.id === editingUbicacion.id ? { ...u, ...formData } : u)))
    } else {
      const newUbicacion: Ubicacion = { id: String(Date.now()), ...formData, ocupacion: 0, estado: "activo" }
      setUbicaciones([...ubicaciones, newUbicacion])
    }
    setIsModalOpen(false)
  }

  const generateNomenclature = () => {
    const { bodega, rack, nivel, posicion } = formData
    if (bodega && rack && nivel && posicion) {
      const code = `${bodega.charAt(bodega.length - 1)}-${rack}-${nivel}-${posicion}`
      setFormData({ ...formData, codigo: code })
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Ubicaciones"
        description="Gestión de ubicaciones del almacén"
        onNew={handleNew}
        newLabel="Nueva Ubicación"
      >
        <Button variant="outline" className="bg-secondary border-border">
          <QrCode className="w-4 h-4 mr-2" />
          Generar Etiquetas
        </Button>
      </PageHeader>

      <DataTable data={ubicaciones} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUbicacion ? "Editar Ubicación" : "Nueva Ubicación"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodega">Bodega *</Label>
              <Select value={formData.bodega} onValueChange={(v) => setFormData({ ...formData, bodega: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bodega A">Bodega A</SelectItem>
                  <SelectItem value="Bodega B">Bodega B</SelectItem>
                  <SelectItem value="Bodega C">Bodega C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rack">Rack *</Label>
              <Select value={formData.rack} onValueChange={(v) => setFormData({ ...formData, rack: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R01">R01</SelectItem>
                  <SelectItem value="R02">R02</SelectItem>
                  <SelectItem value="R03">R03</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel *</Label>
              <Select value={formData.nivel} onValueChange={(v) => setFormData({ ...formData, nivel: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N1">N1</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicion">Posición *</Label>
              <Select value={formData.posicion} onValueChange={(v) => setFormData({ ...formData, posicion: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P01">P01</SelectItem>
                  <SelectItem value="P02">P02</SelectItem>
                  <SelectItem value="P03">P03</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="codigo">Código Ubicación</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={generateNomenclature}
              className="bg-secondary border-border"
            >
              Generar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v as Ubicacion["tipo"] })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="picking">Picking</SelectItem>
                  <SelectItem value="reserva">Reserva</SelectItem>
                  <SelectItem value="recepcion">Recepción</SelectItem>
                  <SelectItem value="despacho">Despacho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: Number(e.target.value) })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
