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

interface Bodega {
  id: string
  codigo: string
  nombre: string
  almacen: string
  almacenId: string
  tipo: "seca" | "refrigerada" | "congelada" | "peligrosos"
  capacidad: number
  ocupacion: number
  racks: number
  ubicaciones: number
  estado: "activo" | "inactivo"
}

const mockBodegas: Bodega[] = [
  {
    id: "1",
    codigo: "BOD-001",
    nombre: "Bodega Principal A",
    almacen: "PT9 NUEVO CEDIS",
    almacenId: "1",
    tipo: "seca",
    capacidad: 5000,
    ocupacion: 3750,
    racks: 25,
    ubicaciones: 1500,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "BOD-002",
    nombre: "Bodega Refrigerada",
    almacen: "PT9 NUEVO CEDIS",
    almacenId: "1",
    tipo: "refrigerada",
    capacidad: 2000,
    ocupacion: 1200,
    racks: 10,
    ubicaciones: 600,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "BOD-003",
    nombre: "Bodega Congelados",
    almacen: "PT9 NUEVO CEDIS",
    almacenId: "1",
    tipo: "congelada",
    capacidad: 1500,
    ocupacion: 900,
    racks: 8,
    ubicaciones: 400,
    estado: "activo",
  },
  {
    id: "4",
    codigo: "BOD-004",
    nombre: "Bodega Materiales Peligrosos",
    almacen: "Almacén Central",
    almacenId: "2",
    tipo: "peligrosos",
    capacidad: 500,
    ocupacion: 150,
    racks: 4,
    ubicaciones: 100,
    estado: "activo",
  },
  {
    id: "5",
    codigo: "BOD-005",
    nombre: "Bodega Secundaria",
    almacen: "Almacén Norte",
    almacenId: "3",
    tipo: "seca",
    capacidad: 3000,
    ocupacion: 0,
    racks: 0,
    ubicaciones: 0,
    estado: "inactivo",
  },
]

const almacenes = [
  { id: "1", nombre: "PT9 NUEVO CEDIS" },
  { id: "2", nombre: "Almacén Central" },
  { id: "3", nombre: "Almacén Norte" },
  { id: "4", nombre: "Almacén Sur" },
]

export default function BodegasPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>(mockBodegas)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBodega, setEditingBodega] = useState<Bodega | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    almacenId: "",
    tipo: "",
    capacidad: "",
  })

  const getTipoColor = (tipo: Bodega["tipo"]) => {
    switch (tipo) {
      case "seca":
        return "bg-green-600"
      case "refrigerada":
        return "bg-blue-600"
      case "congelada":
        return "bg-cyan-600"
      case "peligrosos":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTipoLabel = (tipo: Bodega["tipo"]) => {
    switch (tipo) {
      case "seca":
        return "Seca"
      case "refrigerada":
        return "Refrigerada"
      case "congelada":
        return "Congelada"
      case "peligrosos":
        return "Mat. Peligrosos"
      default:
        return tipo
    }
  }

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    { key: "almacen", label: "Almacén" },
    {
      key: "tipo",
      label: "Tipo",
      render: (item: Bodega) => <Badge className={getTipoColor(item.tipo)}>{getTipoLabel(item.tipo)}</Badge>,
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (item: Bodega) => {
        const porcentaje = item.capacidad > 0 ? Math.round((item.ocupacion / item.capacidad) * 100) : 0
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${porcentaje > 90 ? "bg-red-500" : porcentaje > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <span className="text-sm">{porcentaje}%</span>
          </div>
        )
      },
    },
    { key: "racks", label: "Racks" },
    { key: "ubicaciones", label: "Ubicaciones" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Bodega) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingBodega(null)
    setFormData({ codigo: "", nombre: "", almacenId: "", tipo: "", capacidad: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (bodega: Bodega) => {
    setEditingBodega(bodega)
    setFormData({
      codigo: bodega.codigo,
      nombre: bodega.nombre,
      almacenId: bodega.almacenId,
      tipo: bodega.tipo,
      capacidad: String(bodega.capacidad),
    })
    setIsModalOpen(true)
  }

  const handleDelete = (bodega: Bodega) => {
    if (confirm(`¿Está seguro de eliminar la bodega ${bodega.nombre}?`)) {
      setBodegas(bodegas.filter((b) => b.id !== bodega.id))
    }
  }

  const handleSubmit = () => {
    const almacen = almacenes.find((a) => a.id === formData.almacenId)
    if (editingBodega) {
      setBodegas(
        bodegas.map((b) =>
          b.id === editingBodega.id
            ? {
                ...b,
                ...formData,
                almacen: almacen?.nombre || "",
                capacidad: Number.parseInt(formData.capacidad) || 0,
                tipo: formData.tipo as Bodega["tipo"],
              }
            : b,
        ),
      )
    } else {
      const newBodega: Bodega = {
        id: String(Date.now()),
        codigo: formData.codigo,
        nombre: formData.nombre,
        almacen: almacen?.nombre || "",
        almacenId: formData.almacenId,
        tipo: formData.tipo as Bodega["tipo"],
        capacidad: Number.parseInt(formData.capacidad) || 0,
        ocupacion: 0,
        racks: 0,
        ubicaciones: 0,
        estado: "activo",
      }
      setBodegas([...bodegas, newBodega])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Bodegas"
        description="Gestión de bodegas y zonas de almacenamiento"
        onNew={handleNew}
        newLabel="Nueva Bodega"
      />
      <DataTable data={bodegas} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBodega ? "Editar Bodega" : "Nueva Bodega"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="BOD-001"
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
            <Label>Almacén *</Label>
            <Select value={formData.almacenId} onValueChange={(v) => setFormData({ ...formData, almacenId: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar almacén" />
              </SelectTrigger>
              <SelectContent>
                {almacenes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Bodega *</Label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seca">Seca</SelectItem>
                <SelectItem value="refrigerada">Refrigerada</SelectItem>
                <SelectItem value="congelada">Congelada</SelectItem>
                <SelectItem value="peligrosos">Materiales Peligrosos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacidad">Capacidad (unidades)</Label>
            <Input
              id="capacidad"
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
              placeholder="5000"
              className="bg-secondary border-border"
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
