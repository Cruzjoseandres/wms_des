"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Rack {
  id: string
  codigo: string
  nombre: string
  bodega: string
  bodegaId: string
  pasillo: string
  niveles: number
  posiciones: number
  ubicaciones: number
  ocupacion: number
  estado: "activo" | "inactivo" | "mantenimiento"
}

const mockRacks: Rack[] = [
  {
    id: "1",
    codigo: "RCK-A01",
    nombre: "Rack A-01",
    bodega: "Bodega Principal A",
    bodegaId: "1",
    pasillo: "A",
    niveles: 5,
    posiciones: 10,
    ubicaciones: 50,
    ocupacion: 42,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "RCK-A02",
    nombre: "Rack A-02",
    bodega: "Bodega Principal A",
    bodegaId: "1",
    pasillo: "A",
    niveles: 5,
    posiciones: 10,
    ubicaciones: 50,
    ocupacion: 48,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "RCK-B01",
    nombre: "Rack B-01",
    bodega: "Bodega Principal A",
    bodegaId: "1",
    pasillo: "B",
    niveles: 4,
    posiciones: 8,
    ubicaciones: 32,
    ocupacion: 30,
    estado: "activo",
  },
  {
    id: "4",
    codigo: "RCK-REF01",
    nombre: "Rack Refrigerado 01",
    bodega: "Bodega Refrigerada",
    bodegaId: "2",
    pasillo: "R1",
    niveles: 3,
    posiciones: 6,
    ubicaciones: 18,
    ocupacion: 12,
    estado: "activo",
  },
  {
    id: "5",
    codigo: "RCK-C01",
    nombre: "Rack C-01",
    bodega: "Bodega Principal A",
    bodegaId: "1",
    pasillo: "C",
    niveles: 5,
    posiciones: 10,
    ubicaciones: 50,
    ocupacion: 0,
    estado: "mantenimiento",
  },
]

const bodegas = [
  { id: "1", nombre: "Bodega Principal A" },
  { id: "2", nombre: "Bodega Refrigerada" },
  { id: "3", nombre: "Bodega Congelados" },
  { id: "4", nombre: "Bodega Materiales Peligrosos" },
]

export default function RacksPage() {
  const [racks, setRacks] = useState<Rack[]>(mockRacks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRack, setEditingRack] = useState<Rack | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    bodegaId: "",
    pasillo: "",
    niveles: "",
    posiciones: "",
  })

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    { key: "bodega", label: "Bodega" },
    { key: "pasillo", label: "Pasillo" },
    { key: "niveles", label: "Niveles" },
    { key: "posiciones", label: "Posiciones" },
    { key: "ubicaciones", label: "Ubicaciones" },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (item: Rack) => {
        const porcentaje = item.ubicaciones > 0 ? Math.round((item.ocupacion / item.ubicaciones) * 100) : 0
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${porcentaje > 90 ? "bg-red-500" : porcentaje > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <span className="text-sm">
              {item.ocupacion}/{item.ubicaciones}
            </span>
          </div>
        )
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Rack) => (
        <Badge
          className={
            item.estado === "activo" ? "bg-green-600" : item.estado === "mantenimiento" ? "bg-yellow-600" : "bg-red-600"
          }
        >
          {item.estado === "activo" ? "Activo" : item.estado === "mantenimiento" ? "En Mantenimiento" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingRack(null)
    setFormData({ codigo: "", nombre: "", bodegaId: "", pasillo: "", niveles: "", posiciones: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (rack: Rack) => {
    setEditingRack(rack)
    setFormData({
      codigo: rack.codigo,
      nombre: rack.nombre,
      bodegaId: rack.bodegaId,
      pasillo: rack.pasillo,
      niveles: String(rack.niveles),
      posiciones: String(rack.posiciones),
    })
    setIsModalOpen(true)
  }

  const handleDelete = (rack: Rack) => {
    if (confirm(`¿Está seguro de eliminar el rack ${rack.nombre}?`)) {
      setRacks(racks.filter((r) => r.id !== rack.id))
    }
  }

  const handleSubmit = () => {
    const bodega = bodegas.find((b) => b.id === formData.bodegaId)
    const niveles = Number.parseInt(formData.niveles) || 0
    const posiciones = Number.parseInt(formData.posiciones) || 0

    if (editingRack) {
      setRacks(
        racks.map((r) =>
          r.id === editingRack.id
            ? {
                ...r,
                ...formData,
                bodega: bodega?.nombre || "",
                niveles,
                posiciones,
                ubicaciones: niveles * posiciones,
              }
            : r,
        ),
      )
    } else {
      const newRack: Rack = {
        id: String(Date.now()),
        codigo: formData.codigo,
        nombre: formData.nombre,
        bodega: bodega?.nombre || "",
        bodegaId: formData.bodegaId,
        pasillo: formData.pasillo,
        niveles,
        posiciones,
        ubicaciones: niveles * posiciones,
        ocupacion: 0,
        estado: "activo",
      }
      setRacks([...racks, newRack])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Racks"
        description="Gestión de racks y estanterías"
        onNew={handleNew}
        newLabel="Nuevo Rack"
      />
      <DataTable data={racks} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRack ? "Editar Rack" : "Nuevo Rack"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="RCK-A01"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pasillo">Pasillo *</Label>
              <Input
                id="pasillo"
                value={formData.pasillo}
                onChange={(e) => setFormData({ ...formData, pasillo: e.target.value })}
                placeholder="A"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Bodega *</Label>
            <Select value={formData.bodegaId} onValueChange={(v) => setFormData({ ...formData, bodegaId: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar bodega" />
              </SelectTrigger>
              <SelectContent>
                {bodegas.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="niveles">Niveles (Altura) *</Label>
              <Input
                id="niveles"
                type="number"
                min={1}
                value={formData.niveles}
                onChange={(e) => setFormData({ ...formData, niveles: e.target.value })}
                placeholder="5"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posiciones">Posiciones (Ancho) *</Label>
              <Input
                id="posiciones"
                type="number"
                min={1}
                value={formData.posiciones}
                onChange={(e) => setFormData({ ...formData, posiciones: e.target.value })}
                placeholder="10"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          {formData.niveles && formData.posiciones && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Total de ubicaciones a generar:{" "}
                <span className="font-bold text-foreground">
                  {(Number.parseInt(formData.niveles) || 0) * (Number.parseInt(formData.posiciones) || 0)}
                </span>
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </MainLayout>
  )
}
