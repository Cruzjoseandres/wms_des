"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Almacen {
  id: string
  codigo: string
  nombre: string
  direccion: string
  bodegas: number
  ubicaciones: number
  estado: "activo" | "inactivo"
}

const mockAlmacenes: Almacen[] = [
  {
    id: "1",
    codigo: "ALM-001",
    nombre: "PT9 NUEVO CEDIS",
    direccion: "Av. Industrial 123",
    bodegas: 4,
    ubicaciones: 2500,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "ALM-002",
    nombre: "Almacén Central",
    direccion: "Calle Principal 456",
    bodegas: 3,
    ubicaciones: 1800,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "ALM-003",
    nombre: "Almacén Norte",
    direccion: "Zona Industrial Norte",
    bodegas: 2,
    ubicaciones: 1200,
    estado: "activo",
  },
  {
    id: "4",
    codigo: "ALM-004",
    nombre: "Almacén Sur",
    direccion: "Zona Industrial Sur",
    bodegas: 1,
    ubicaciones: 533,
    estado: "inactivo",
  },
]

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>(mockAlmacenes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null)
  const [formData, setFormData] = useState({ codigo: "", nombre: "", direccion: "" })

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    { key: "direccion", label: "Dirección" },
    { key: "bodegas", label: "Bodegas" },
    { key: "ubicaciones", label: "Ubicaciones" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Almacen) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingAlmacen(null)
    setFormData({ codigo: "", nombre: "", direccion: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (almacen: Almacen) => {
    setEditingAlmacen(almacen)
    setFormData({ codigo: almacen.codigo, nombre: almacen.nombre, direccion: almacen.direccion })
    setIsModalOpen(true)
  }

  const handleDelete = (almacen: Almacen) => {
    if (confirm(`¿Está seguro de eliminar el almacén ${almacen.nombre}?`)) {
      setAlmacenes(almacenes.filter((a) => a.id !== almacen.id))
    }
  }

  const handleSubmit = () => {
    if (editingAlmacen) {
      setAlmacenes(almacenes.map((a) => (a.id === editingAlmacen.id ? { ...a, ...formData } : a)))
    } else {
      const newAlmacen: Almacen = { id: String(Date.now()), ...formData, bodegas: 0, ubicaciones: 0, estado: "activo" }
      setAlmacenes([...almacenes, newAlmacen])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Almacenes"
        description="Gestión de sucursales y almacenes"
        onNew={handleNew}
        newLabel="Nuevo Almacén"
      />
      <DataTable data={almacenes} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAlmacen ? "Editar Almacén" : "Nuevo Almacén"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className="bg-secondary border-border"
            />
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
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
