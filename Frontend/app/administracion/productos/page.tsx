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
import { Switch } from "@/components/ui/switch"

interface Product {
  id: string
  codigo: string
  descripcion: string
  categoria: string
  subcategoria: string
  unidadMedida: string
  controlaLote: boolean
  controlaVencimiento: boolean
  estado: "activo" | "inactivo"
}

const mockProducts: Product[] = [
  {
    id: "1",
    codigo: "PRD-001",
    descripcion: "Producto A - Alta rotación",
    categoria: "Electrónicos",
    subcategoria: "Accesorios",
    unidadMedida: "UND",
    controlaLote: true,
    controlaVencimiento: false,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "PRD-002",
    descripcion: "Producto B - Media rotación",
    categoria: "Alimentos",
    subcategoria: "Bebidas",
    unidadMedida: "CJ",
    controlaLote: true,
    controlaVencimiento: true,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "PRD-003",
    descripcion: "Producto C - Baja rotación",
    categoria: "Limpieza",
    subcategoria: "Desinfectantes",
    unidadMedida: "LT",
    controlaLote: false,
    controlaVencimiento: false,
    estado: "inactivo",
  },
]

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    categoria: "",
    subcategoria: "",
    unidadMedida: "",
    controlaLote: false,
    controlaVencimiento: false,
  })

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "descripcion", label: "Descripción" },
    { key: "categoria", label: "Categoría" },
    { key: "subcategoria", label: "Subcategoría" },
    { key: "unidadMedida", label: "U.M." },
    {
      key: "controlaLote",
      label: "Lote",
      render: (item: Product) => (
        <Badge variant={item.controlaLote ? "default" : "secondary"}>{item.controlaLote ? "Sí" : "No"}</Badge>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Product) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingProduct(null)
    setFormData({
      codigo: "",
      descripcion: "",
      categoria: "",
      subcategoria: "",
      unidadMedida: "",
      controlaLote: false,
      controlaVencimiento: false,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      codigo: product.codigo,
      descripcion: product.descripcion,
      categoria: product.categoria,
      subcategoria: product.subcategoria,
      unidadMedida: product.unidadMedida,
      controlaLote: product.controlaLote,
      controlaVencimiento: product.controlaVencimiento,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (product: Product) => {
    if (confirm(`¿Está seguro de eliminar el producto ${product.codigo}?`)) {
      setProducts(products.filter((p) => p.id !== product.id))
    }
  }

  const handleSubmit = () => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...formData } : p)))
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        ...formData,
        estado: "activo",
      }
      setProducts([...products, newProduct])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Productos"
        description="Gestión de productos del almacén"
        onNew={handleNew}
        newLabel="Nuevo Producto"
        onImport={() => alert("Importar masivo")}
        onExport={() => alert("Exportar")}
      />

      <DataTable data={products} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
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
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
              <Select
                value={formData.unidadMedida}
                onValueChange={(v) => setFormData({ ...formData, unidadMedida: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UND">UND - Unidad</SelectItem>
                  <SelectItem value="CJ">CJ - Caja</SelectItem>
                  <SelectItem value="KG">KG - Kilogramo</SelectItem>
                  <SelectItem value="LT">LT - Litro</SelectItem>
                  <SelectItem value="MT">MT - Metro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                  <SelectItem value="Alimentos">Alimentos</SelectItem>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoria">Subcategoría</Label>
              <Select
                value={formData.subcategoria}
                onValueChange={(v) => setFormData({ ...formData, subcategoria: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Desinfectantes">Desinfectantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="controlaLote"
                checked={formData.controlaLote}
                onCheckedChange={(v) => setFormData({ ...formData, controlaLote: v })}
              />
              <Label htmlFor="controlaLote">Controla Lote</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="controlaVencimiento"
                checked={formData.controlaVencimiento}
                onCheckedChange={(v) => setFormData({ ...formData, controlaVencimiento: v })}
              />
              <Label htmlFor="controlaVencimiento">Controla Vencimiento</Label>
            </div>
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
