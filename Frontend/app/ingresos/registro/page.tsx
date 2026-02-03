"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Loader2 } from "lucide-react"
import { useIngresosStore } from "@/lib/stores/ingresos-store"
import { toast } from "sonner"

// Interface para la tabla de esta página
interface IngresoRow {
  id: string
  documento: string
  tipo: string
  proveedor: string
  fecha: string
  fechaInicio: string
  fechaFin: string
  items: number
  estado: string
  observaciones: string | null
}

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
  // Conectar al store de ingresos
  const allIngresos = useIngresosStore((s) => s.ingresos)
  const isLoading = useIngresosStore((s) => s.isLoading)
  const fetchIngresos = useIngresosStore((s) => s.fetchIngresos)
  const updateEstadoBackend = useIngresosStore((s) => s.updateEstadoBackend)

  const router = useRouter()

  // Cargar datos del backend al montar
  useEffect(() => {
    fetchIngresos()
  }, [fetchIngresos])

  // Mapear datos del store al formato de la tabla
  const ingresos: IngresoRow[] = allIngresos.map((ing) => ({
    id: ing.id,
    documento: ing.documento,
    tipo: ing.tipo,
    proveedor: ing.origen,
    fecha: ing.fecha,
    fechaInicio: ing.validatedAt || "",
    fechaFin: ing.storedAt || "",
    items: Array.isArray(ing.items) ? ing.items.length : 0,
    estado: ing.estado === "paletizado" ? "pendiente" : ing.estado === "anulado" ? "rechazado" : ing.estado,
    observaciones: ing.observaciones,
  }))

  const columns = [
    { key: "documento", label: "Documento" },
    {
      key: "tipo",
      label: "Tipo",
      render: (item: IngresoRow) => <span>{tipoLabels[item.tipo] || item.tipo}</span>,
    },
    { key: "proveedor", label: "Origen" },
    { key: "fecha", label: "Fecha" },
    {
      key: "rango",
      label: "Rango Horario",
      render: (item: IngresoRow) => (
        <span className="text-xs text-muted-foreground">
          {item.fechaInicio ? new Date(item.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} -
          {item.fechaFin ? new Date(item.fechaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
        </span>
      )
    },
    { key: "items", label: "Ítems" },
    {
      key: "estado",
      label: "Estado",
      render: (item: IngresoRow) => <Badge className={estadoColors[item.estado] || "bg-gray-600"}>{(item.estado || "DESCONOCIDO").toUpperCase()}</Badge>,
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (item: IngresoRow) =>
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

  const handleValidar = async (ingreso: IngresoRow) => {
    try {
      await updateEstadoBackend(ingreso.id, "validado", "Usuario Web")
      toast.success("Ingreso validado correctamente")
    } catch (error) {
      toast.error("Error al validar el ingreso")
    }
  }

  const handleRechazar = async (ingreso: IngresoRow) => {
    try {
      await updateEstadoBackend(ingreso.id, "anulado", "Usuario Web")
      toast.success("Ingreso rechazado")
    } catch (error) {
      toast.error("Error al rechazar el ingreso")
    }
  }

  const handleNew = () => {
    router.push("/ingresos/nuevo")
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

      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </MainLayout>
  )
}
