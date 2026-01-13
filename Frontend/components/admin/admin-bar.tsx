"use client"

import { useAdminStore } from "@/lib/stores/admin-store"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Eye, X, Building2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminBar() {
  const router = useRouter()
  const { isSuperAdmin, impersonatingOrgId, impersonatingOrg, organizations, setImpersonation, clearImpersonation } =
    useAdminStore()

  if (!isSuperAdmin) return null

  const handleOrgChange = (orgId: string) => {
    if (orgId === "none") {
      clearImpersonation()
    } else {
      const org = organizations.find((o) => o.id === orgId)
      setImpersonation(orgId, org || null)
    }
    router.refresh()
  }

  const handleExitSimulation = () => {
    clearImpersonation()
    router.push("/super-admin")
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="font-semibold text-sm">MODO SUPER ADMIN</span>

          {impersonatingOrgId ? (
            <div className="flex items-center gap-2 ml-4 bg-red-700 px-3 py-1 rounded-full">
              <Eye className="w-4 h-4" />
              <span className="text-sm">
                Viendo datos de: <strong>{impersonatingOrg?.name || "Empresa"}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4 bg-red-700/50 px-3 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Vista Global - Todos los datos</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <Select value={impersonatingOrgId || "none"} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-[220px] bg-red-700 border-red-500 text-white h-8">
                <SelectValue placeholder="Seleccionar empresa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Vista Global --</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex items-center gap-2">
                      <span>{org.name}</span>
                      <span className="text-xs text-muted-foreground">({org.plan})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {impersonatingOrgId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitSimulation}
              className="text-white hover:bg-red-700 h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Salir
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/super-admin")}
            className="bg-white text-red-600 hover:bg-red-50 border-white h-8"
          >
            Panel Super Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
