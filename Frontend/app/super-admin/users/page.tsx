"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminStore, type UserRole } from "@/lib/stores/admin-store"
import { Users, Search, MoreHorizontal, Edit, Trash2, Plus, Shield, UserCog, Eye, Mail, Download } from "lucide-react"

interface GlobalUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  organizationName: string
  organizationId: string
  lastActive: string
  isActive: boolean
}

const mockGlobalUsers: GlobalUser[] = [
  {
    id: "user-001",
    fullName: "Carlos Rodríguez",
    email: "carlos@distribuidora.com",
    role: "admin",
    organizationName: "Distribuidora Central",
    organizationId: "org-001",
    lastActive: "Hace 5 min",
    isActive: true,
  },
  {
    id: "user-002",
    fullName: "María García",
    email: "maria@logistica.com",
    role: "manager",
    organizationName: "Logística Express",
    organizationId: "org-002",
    lastActive: "Hace 1 hora",
    isActive: true,
  },
  {
    id: "user-003",
    fullName: "Juan Pérez",
    email: "juan@almacenes.com",
    role: "operator",
    organizationName: "Almacenes del Sur",
    organizationId: "org-003",
    lastActive: "Hace 2 días",
    isActive: false,
  },
  {
    id: "user-004",
    fullName: "Ana López",
    email: "ana@comercial.com",
    role: "viewer",
    organizationName: "Comercial Norte",
    organizationId: "org-004",
    lastActive: "Hace 3 horas",
    isActive: true,
  },
  {
    id: "user-005",
    fullName: "Roberto Sánchez",
    email: "roberto@importadora.com",
    role: "admin",
    organizationName: "Importadora Global",
    organizationId: "org-005",
    lastActive: "Hace 30 min",
    isActive: true,
  },
]

export default function GlobalUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const { setImpersonation, organizations } = useAdminStore()

  const filteredUsers = mockGlobalUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>
      case "manager":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Manager</Badge>
      case "operator":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operador</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Viewer</Badge>
    }
  }

  const handleViewAsOrg = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    if (org) {
      setImpersonation(orgId, org)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios Globales</h1>
          <p className="text-muted-foreground mt-1">Gestiona todos los usuarios de la plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGlobalUsers.length}</p>
                <p className="text-xs text-muted-foreground">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCog className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGlobalUsers.filter((u) => u.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGlobalUsers.filter((u) => u.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Invitaciones Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "admin", "manager", "operator", "viewer"].map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                  className={roleFilter === role ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {role === "all" ? "Todos" : role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Todos los usuarios registrados en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-orange-500/20 text-orange-500">
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.organizationName}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewAsOrg(user.organizationId)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver como su Empresa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
