"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Proveedor {
  id: string
  codigo: string
  razonSocial: string
  ruc: string
  direccion: string
  telefono: string
  email: string
  contacto: string
  categoria: "nacional" | "internacional" | "local"
  estado: "activo" | "inactivo"
  productos: number
  ultimaCompra?: string
}

const mockProveedores: Proveedor[] = [
  {
    id: "1",
    codigo: "PRV-001",
    razonSocial: "Distribuidora Nacional S.A.",
    ruc: "20123456789",
    direccion: "Av. Industrial 456, Lima",
    telefono: "+51 1 234-5678",
    email: "ventas@distnacional.com",
    contacto: "Juan Pérez",
    categoria: "nacional",
    estado: "activo",
    productos: 150,
    ultimaCompra: "2024-12-01",
  },
  {
    id: "2",
    codigo: "PRV-002",
    razonSocial: "Importadora Global Inc.",
    ruc: "20987654321",
    direccion: "123 Trade St, Miami FL",
    telefono: "+1 305 123-4567",
    email: "sales@importglobal.com",
    contacto: "Mike Johnson",
    categoria: "internacional",
    estado: "activo",
    productos: 85,
    ultimaCompra: "2024-11-28",
  },
  {
    id: "3",
    codigo: "PRV-003",
    razonSocial: "Comercial Regional E.I.R.L.",
    ruc: "10456789012",
    direccion: "Jr. Comercio 789, Arequipa",
    telefono: "+51 54 456-789",
    email: "info@comregional.pe",
    contacto: "María López",
    categoria: "local",
    estado: "activo",
    productos: 45,
    ultimaCompra: "2024-12-03",
  },
  {
    id: "4",
    codigo: "PRV-004",
    razonSocial: "Tech Supplies Corp.",
    ruc: "20111222333",
    direccion: "456 Tech Ave, Shanghai",
    telefono: "+86 21 1234-5678",
    email: "export@techsupplies.cn",
    contacto: "Wei Zhang",
    categoria: "internacional",
    estado: "activo",
    productos: 200,
    ultimaCompra: "2024-11-15",
  },
  {
    id: "5",
    codigo: "PRV-005",
    razonSocial: "Suministros del Sur S.A.C.",
    ruc: "20444555666",
    direccion: "Av. Sur 123, Tacna",
    telefono: "+51 52 123-456",
    email: "ventas@sumsur.pe",
    contacto: "Carlos García",
    categoria: "local",
    estado: "inactivo",
    productos: 20,
    ultimaCompra: "2024-08-20",
  },
]

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(mockProveedores)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    razonSocial: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: "",
    categoria: "",
  })

  const getCategoriaColor = (categoria: Proveedor["categoria"]) => {
    switch (categoria) {
      case "nacional":
        return "bg-blue-600"
      case "internacional":
        return "bg-purple-600"
      case "local":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "razonSocial", label: "Razón Social" },
    { key: "ruc", label: "RUC/ID Fiscal" },
    { key: "contacto", label: "Contacto" },
    { key: "telefono", label: "Teléfono" },
    {
      key: "categoria",
      label: "Categoría",
      render: (item: Proveedor) => (
        <Badge className={getCategoriaColor(item.categoria)}>
          {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
        </Badge>
      ),
    },
    { key: "productos", label: "Productos" },
    {
      key: "ultimaCompra",
      label: "Última Compra",
      render: (item: Proveedor) => item.ultimaCompra || "Sin compras",
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Proveedor) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingProveedor(null)
    setFormData({
      codigo: "",
      razonSocial: "",
      ruc: "",
      direccion: "",
      telefono: "",
      email: "",
      contacto: "",
      categoria: "",
    })
    setIsModalOpen(true)
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      codigo: proveedor.codigo,
      razonSocial: proveedor.razonSocial,
      ruc: proveedor.ruc,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email,
      contacto: proveedor.contacto,
      categoria: proveedor.categoria,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (proveedor: Proveedor) => {
    if (confirm(`¿Está seguro de eliminar el proveedor ${proveedor.razonSocial}?`)) {
      setProveedores(proveedores.filter((p) => p.id !== proveedor.id))
    }
  }

  const handleSubmit = () => {
    if (editingProveedor) {
      setProveedores(
        proveedores.map((p) =>
          p.id === editingProveedor.id
            ? {
                ...p,
                ...formData,
                categoria: formData.categoria as Proveedor["categoria"],
              }
            : p,
        ),
      )
    } else {
      const newProveedor: Proveedor = {
        id: String(Date.now()),
        codigo: formData.codigo,
        razonSocial: formData.razonSocial,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        contacto: formData.contacto,
        categoria: formData.categoria as Proveedor["categoria"],
        estado: "activo",
        productos: 0,
      }
      setProveedores([...proveedores, newProveedor])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Proveedores"
        description="Gestión de proveedores y contactos comerciales"
        onNew={handleNew}
        newLabel="Nuevo Proveedor"
      />
      <DataTable data={proveedores} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
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
                placeholder="PRV-001"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC/ID Fiscal *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="20123456789"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón Social *</Label>
            <Input
              id="razonSocial"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="bg-secondary border-border min-h-[60px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+51 1 234-5678"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ventas@empresa.com"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="internacional">Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
