"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminStore } from "@/lib/stores/admin-store"
import { CreateCompanyModal } from "@/components/companies/create-company-modal"
import {
  Building2,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Warehouse,
  Calendar,
  Download,
} from "lucide-react"

export default function CompaniesPage() {
  const router = useRouter()
  const { organizations, setImpersonation, setViewMode } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = planFilter === "all" || org.plan === planFilter
    return matchesSearch && matchesPlan
  })

  const handleSimulateAccess = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    if (org) {
      setImpersonation(orgId, org)
      setViewMode("CLIENT")
      router.push("/")
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Enterprise</Badge>
      case "pro":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pro</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Free</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Empresas</h1>
          <p className="text-muted-foreground mt-1">Administra todas las organizaciones registradas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{organizations.length}</p>
                <p className="text-xs text-muted-foreground">Total Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {organizations.reduce((acc, o) => acc + o.usersCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Usuarios Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Warehouse className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {organizations.reduce((acc, o) => acc + o.warehousesCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Almacenes Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{organizations.filter((o) => o.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {["all", "enterprise", "pro", "free"].map((plan) => (
                <Button
                  key={plan}
                  variant={planFilter === plan ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlanFilter(plan)}
                  className={planFilter === plan ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {plan === "all" ? "Todos" : plan.charAt(0).toUpperCase() + plan.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Registradas</CardTitle>
          <CardDescription>Lista de todas las organizaciones en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Usuarios</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Almacenes</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha Registro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{org.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{org.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(org.plan)}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">{org.usersCount}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">{org.warehousesCount}</TableCell>
                    <TableCell className="hidden lg:table-cell">{org.createdAt}</TableCell>
                    <TableCell>
                      {org.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activa</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactiva</Badge>
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
                          <DropdownMenuItem onClick={() => handleSimulateAccess(org.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Simular Acceso
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
          </div>
        </CardContent>
      </Card>

      {/* Create Company Modal */}
      <CreateCompanyModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
