"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  subcategorias: number
  estado: "activo" | "inactivo"
}

const mockCategories: Category[] = [
  {
    id: "1",
    codigo: "CAT-001",
    nombre: "Electrónicos",
    descripcion: "Productos electrónicos",
    subcategorias: 5,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "CAT-002",
    nombre: "Alimentos",
    descripcion: "Productos alimenticios",
    subcategorias: 8,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "CAT-003",
    nombre: "Limpieza",
    descripcion: "Productos de limpieza",
    subcategorias: 3,
    estado: "activo",
  },
  {
    id: "4",
    codigo: "CAT-004",
    nombre: "Farmacia",
    descripcion: "Productos farmacéuticos",
    subcategorias: 6,
    estado: "inactivo",
  },
]

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ codigo: "", nombre: "", descripcion: "" })

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "subcategorias", label: "Subcategorías" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Category) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingCategory(null)
    setFormData({ codigo: "", nombre: "", descripcion: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ codigo: category.codigo, nombre: category.nombre, descripcion: category.descripcion })
    setIsModalOpen(true)
  }

  const handleDelete = (category: Category) => {
    if (confirm(`¿Está seguro de eliminar la categoría ${category.nombre}?`)) {
      setCategories(categories.filter((c) => c.id !== category.id))
    }
  }

  const handleSubmit = () => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...formData } : c)))
    } else {
      const newCategory: Category = { id: String(Date.now()), ...formData, subcategorias: 0, estado: "activo" }
      setCategories([...categories, newCategory])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Categorías"
        description="Gestión de categorías y subcategorías"
        onNew={handleNew}
        newLabel="Nueva Categoría"
      />
      <DataTable data={categories} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
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
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
