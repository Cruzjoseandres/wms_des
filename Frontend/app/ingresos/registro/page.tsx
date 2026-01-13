"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FormModal } from "@/components/shared/form-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Check, X } from "lucide-react"
import { useDemoState } from "@/lib/hooks/use-demo-state"

interface IngresoItem {
  id: string
  producto: string
  cantidad: number
  lote: string
  vencimiento: string
}

interface Ingreso {
  id: string
  documento: string
  tipo: "produccion" | "traspaso" | "reingreso" | "anulacion"
  proveedor: string
  fecha: string
  items: number
  estado: "pendiente" | "validado" | "almacenado" | "rechazado"
  observaciones: string
}

const mockIngresos: Ingreso[] = [
  {
    id: "1",
    documento: "ING-2025-001",
    tipo: "produccion",
    proveedor: "Producción Interna",
    fecha: "2025-01-08",
    items: 15,
    estado: "pendiente",
    observaciones: "",
  },
  {
    id: "2",
    documento: "ING-2025-002",
    tipo: "traspaso",
    proveedor: "Almacén Central",
    fecha: "2025-01-08",
    items: 8,
    estado: "validado",
    observaciones: "",
  },
  {
    id: "3",
    documento: "ING-2025-003",
    tipo: "produccion",
    proveedor: "Producción Interna",
    fecha: "2025-01-07",
    items: 22,
    estado: "almacenado",
    observaciones: "",
  },
  {
    id: "4",
    documento: "ING-2025-004",
    tipo: "reingreso",
    proveedor: "Cliente ABC",
    fecha: "2025-01-07",
    items: 3,
    estado: "rechazado",
    observaciones: "Producto dañado",
  },
]

const tipoLabels: Record<string, string> = {
  produccion: "Producción",
  traspaso: "Traspaso",
  reingreso: "Reingreso",
  anulacion: "Anulación Factura",
}

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-600",
  validado: "bg-blue-600",
  almacenado: "bg-green-600",
  rechazado: "bg-red-600",
}

export default function RegistroIngresoPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>(mockIngresos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useDemoState("registro_ingreso_form", {
    tipo: "produccion" as Ingreso["tipo"],
    proveedor: "",
    observaciones: "",
  })
  const [items, setItems] = useState<IngresoItem[]>([{ id: "1", producto: "", cantidad: 0, lote: "", vencimiento: "" }])
  const router = useRouter()

  useEffect(() => {
    router.replace("/ingresos")
  }, [router])

  const columns = [
    { key: "documento", label: "Documento" },
    {
      key: "tipo",
      label: "Tipo",
      render: (item: Ingreso) => <span>{tipoLabels[item.tipo]}</span>,
    },
    { key: "proveedor", label: "Origen" },
    { key: "fecha", label: "Fecha" },
    { key: "items", label: "Ítems" },
    {
      key: "estado",
      label: "Estado",
      render: (item: Ingreso) => <Badge className={estadoColors[item.estado]}>{item.estado.toUpperCase()}</Badge>,
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (item: Ingreso) =>
        item.estado === "pendiente" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
              onClick={() => handleValidar(item)}
            >
              <Check className="w-4 h-4 mr-1" /> Validar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={() => handleRechazar(item)}
            >
              <X className="w-4 h-4 mr-1" /> Rechazar
            </Button>
          </div>
        ) : null,
    },
  ]

  const handleValidar = (ingreso: Ingreso) => {
    setIngresos(ingresos.map((i) => (i.id === ingreso.id ? { ...i, estado: "validado" } : i)))
  }

  const handleRechazar = (ingreso: Ingreso) => {
    setIngresos(ingresos.map((i) => (i.id === ingreso.id ? { ...i, estado: "rechazado" } : i)))
  }

  const handleNew = () => {
    setFormData({ tipo: "produccion", proveedor: "", observaciones: "" })
    setItems([{ id: "1", producto: "", cantidad: 0, lote: "", vencimiento: "" }])
    setIsModalOpen(true)
  }

  const addItem = () => {
    setItems([...items, { id: String(Date.now()), producto: "", cantidad: 0, lote: "", vencimiento: "" }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof IngresoItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSubmit = () => {
    const newIngreso: Ingreso = {
      id: String(Date.now()),
      documento: `ING-2025-${String(ingresos.length + 1).padStart(3, "0")}`,
      tipo: formData.tipo,
      proveedor: formData.proveedor,
      fecha: new Date().toISOString().split("T")[0],
      items: items.length,
      estado: "pendiente",
      observaciones: formData.observaciones,
    }
    setIngresos([newIngreso, ...ingresos])
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Registro de Ingresos"
        description="Recepción de productos al almacén"
        onNew={handleNew}
        newLabel="Nuevo Ingreso"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-yellow-600/20 border-yellow-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-400">
              {ingresos.filter((i) => i.estado === "pendiente").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-600/20 border-blue-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400">Validados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-400">{ingresos.filter((i) => i.estado === "validado").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-600/20 border-green-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400">Almacenados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              {ingresos.filter((i) => i.estado === "almacenado").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-600/20 border-red-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{ingresos.filter((i) => i.estado === "rechazado").length}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable data={ingresos} columns={columns} showActions={false} />

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Ingreso"
        description="Registre un nuevo ingreso de productos"
        onSubmit={handleSubmit}
        submitLabel="Confirmar Recepción"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ingreso *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v as Ingreso["tipo"] })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produccion">Producción</SelectItem>
                  <SelectItem value="traspaso">Traspaso</SelectItem>
                  <SelectItem value="reingreso">Reingreso</SelectItem>
                  <SelectItem value="anulacion">Anulación Factura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origen/Proveedor *</Label>
              <Input
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Detalle de Ítems</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addItem}
                className="bg-secondary border-border"
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/50 rounded-lg">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Producto</Label>
                    <Select value={item.producto} onValueChange={(v) => updateItem(item.id, "producto", v)}>
                      <SelectTrigger className="bg-secondary border-border h-9">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRD-001">PRD-001 - Producto A</SelectItem>
                        <SelectItem value="PRD-002">PRD-002 - Producto B</SelectItem>
                        <SelectItem value="PRD-003">PRD-003 - Producto C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      value={item.cantidad || ""}
                      onChange={(e) => updateItem(item.id, "cantidad", Number(e.target.value))}
                      className="bg-secondary border-border h-9"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Lote</Label>
                    <Input
                      value={item.lote}
                      onChange={(e) => updateItem(item.id, "lote", e.target.value)}
                      className="bg-secondary border-border h-9"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Vencimiento</Label>
                    <Input
                      type="date"
                      value={item.vencimiento}
                      onChange={(e) => updateItem(item.id, "vencimiento", e.target.value)}
                      className="bg-secondary border-border h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-9 w-9 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="bg-secondary border-border"
              rows={2}
            />
          </div>
        </div>
      </FormModal>
    </MainLayout>
  )
}
