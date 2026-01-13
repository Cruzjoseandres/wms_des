"use client"

import type React from "react"

import { useState } from "react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Loader2, CheckCircle } from "lucide-react"

interface CreateCompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCompanyModal({ open, onOpenChange }: CreateCompanyModalProps) {
  const { addOrganization } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan: "free" as "free" | "pro" | "enterprise",
    adminEmail: "",
    adminName: "",
    notes: "",
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newOrg = {
      id: `org-${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      plan: formData.plan,
      createdAt: new Date().toISOString().split("T")[0],
      usersCount: 1,
      warehousesCount: 0,
      isActive: true,
    }

    addOrganization(newOrg)
    setIsLoading(false)
    setIsSuccess(true)

    // Reset and close after showing success
    setTimeout(() => {
      setIsSuccess(false)
      setFormData({
        name: "",
        slug: "",
        plan: "free",
        adminEmail: "",
        adminName: "",
        notes: "",
      })
      onOpenChange(false)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Empresa Creada</h3>
            <p className="text-muted-foreground text-center">
              La empresa <strong>{formData.name}</strong> ha sido registrada exitosamente.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Se ha enviado un correo de invitación a {formData.adminEmail}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-500" />
            Nueva Empresa
          </DialogTitle>
          <DialogDescription>Registra una nueva empresa en la plataforma SGLA WMS.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Distribuidora ABC"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Identificador (Slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="distribuidora-abc"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                URL: app.sgla.com/<strong>{formData.slug || "empresa"}</strong>
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan de Suscripción *</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: "free" | "pro" | "enterprise") => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      Free - Hasta 100 SKUs
                    </div>
                  </SelectItem>
                  <SelectItem value="pro">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Pro - Hasta 5,000 SKUs
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Enterprise - Ilimitado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Administrador Principal</p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminName">Nombre Completo *</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail">Correo Electrónico *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@empresa.com"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre la empresa..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Empresa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
