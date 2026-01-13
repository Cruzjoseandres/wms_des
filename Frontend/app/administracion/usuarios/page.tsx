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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: "admin" | "supervisor" | "operador" | "consulta"
  almacen: string
  ultimoAcceso: string
  estado: "activo" | "inactivo"
}

const mockUsuarios: Usuario[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan.perez@sgla.com",
    rol: "admin",
    almacen: "Todos",
    ultimoAcceso: "2025-01-08 10:30",
    estado: "activo",
  },
  {
    id: "2",
    nombre: "María García",
    email: "maria.garcia@sgla.com",
    rol: "supervisor",
    almacen: "PT9 NUEVO CEDIS",
    ultimoAcceso: "2025-01-08 09:15",
    estado: "activo",
  },
  {
    id: "3",
    nombre: "Carlos López",
    email: "carlos.lopez@sgla.com",
    rol: "operador",
    almacen: "PT9 NUEVO CEDIS",
    ultimoAcceso: "2025-01-07 18:45",
    estado: "activo",
  },
  {
    id: "4",
    nombre: "Ana Martínez",
    email: "ana.martinez@sgla.com",
    rol: "consulta",
    almacen: "Almacén Central",
    ultimoAcceso: "2025-01-05 14:20",
    estado: "inactivo",
  },
]

const rolColors: Record<string, string> = {
  admin: "bg-red-600",
  supervisor: "bg-blue-600",
  operador: "bg-green-600",
  consulta: "bg-gray-600",
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "operador" as Usuario["rol"],
    almacen: "",
    password: "",
  })

  const columns = [
    {
      key: "nombre",
      label: "Usuario",
      render: (item: Usuario) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {item.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.nombre}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      label: "Rol",
      render: (item: Usuario) => <Badge className={rolColors[item.rol]}>{item.rol.toUpperCase()}</Badge>,
    },
    { key: "almacen", label: "Almacén" },
    { key: "ultimoAcceso", label: "Último Acceso" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Usuario) => (
        <Badge className={item.estado === "activo" ? "bg-green-600" : "bg-red-600"}>
          {item.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const handleNew = () => {
    setEditingUsuario(null)
    setFormData({ nombre: "", email: "", rol: "operador", almacen: "", password: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      almacen: usuario.almacen,
      password: "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (usuario: Usuario) => {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      setUsuarios(usuarios.filter((u) => u.id !== usuario.id))
    }
  }

  const handleSubmit = () => {
    if (editingUsuario) {
      setUsuarios(usuarios.map((u) => (u.id === editingUsuario.id ? { ...u, ...formData } : u)))
    } else {
      const newUsuario: Usuario = {
        id: String(Date.now()),
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        almacen: formData.almacen,
        ultimoAcceso: "-",
        estado: "activo",
      }
      setUsuarios([...usuarios, newUsuario])
    }
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Maestro de Usuarios"
        description="Gestión de usuarios del sistema"
        onNew={handleNew}
        newLabel="Nuevo Usuario"
      />
      <DataTable data={usuarios} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(v) => setFormData({ ...formData, rol: v as Usuario["rol"] })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="almacen">Almacén *</Label>
              <Select value={formData.almacen} onValueChange={(v) => setFormData({ ...formData, almacen: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="PT9 NUEVO CEDIS">PT9 NUEVO CEDIS</SelectItem>
                  <SelectItem value="Almacén Central">Almacén Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{editingUsuario ? "Nueva Contraseña" : "Contraseña *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-secondary border-border"
              placeholder={editingUsuario ? "Dejar en blanco para mantener" : ""}
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
