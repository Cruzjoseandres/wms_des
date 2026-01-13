"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIngresosStore, type Ingreso, type IngresoStatus } from "@/lib/stores/ingresos-store"
import { Package, Zap, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

const estadoConfig: Record<IngresoStatus, { color: string; label: string; icon: React.ReactNode }> = {
  paletizado: {
    color: "bg-gray-600",
    label: "Paletizado",
    icon: <Package className="w-4 h-4" />,
  },
  validado: {
    color: "bg-orange-600",
    label: "Validado",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  almacenado: {
    color: "bg-green-600",
    label: "Almacenado",
    icon: <Package className="w-4 h-4" />,
  },
  anulado: {
    color: "bg-red-600",
    label: "Anulado",
    icon: <AlertCircle className="w-4 h-4" />,
  },
}

const tipoLabels: Record<string, string> = {
  produccion: "Producción",
  traspaso: "Traspaso",
  reingreso: "Reingreso",
  anulacion: "Anulación",
}

export default function IngresosPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const selectedAlmacenId = useIngresosStore((s) => s.selectedAlmacenId)
  const allIngresos = useIngresosStore((s) => s.ingresos)
  const isLoading = useIngresosStore((s) => s.isLoading)
  const error = useIngresosStore((s) => s.error)
  const updateEstadoBackend = useIngresosStore((s) => s.updateEstadoBackend)
  const fetchIngresos = useIngresosStore((s) => s.fetchIngresos)

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    fetchIngresos()
  }, [fetchIngresos])

  const { ingresos, stats } = useMemo(() => {
    const filtered = allIngresos.filter((i) => !selectedAlmacenId || i.almacenId === selectedAlmacenId)
    return {
      ingresos: filtered,
      stats: {
        paletizado: filtered.filter((i) => i.estado === "paletizado").length,
        validado: filtered.filter((i) => i.estado === "validado").length,
        almacenado: filtered.filter((i) => i.estado === "almacenado").length,
        anulado: filtered.filter((i) => i.estado === "anulado").length,
      },
    }
  }, [allIngresos, selectedAlmacenId])

  const filteredIngresos = useMemo(() => {
    return ingresos.filter(
      (ing) =>
        ing.documento.toLowerCase().includes(searchText.toLowerCase()) ||
        ing.origen.toLowerCase().includes(searchText.toLowerCase()),
    )
  }, [ingresos, searchText])

  const handleNewIngreso = () => {
    router.push("/ingresos/nuevo")
  }

  const handleUpdateEstado = async (ingresoId: string, nuevoEstado: IngresoStatus) => {
    setProcessingId(ingresoId)
    try {
      await updateEstadoBackend(ingresoId, nuevoEstado, "Usuario Web")
      toast.success(`Estado actualizado a ${estadoConfig[nuevoEstado].label}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el estado")
    } finally {
      setProcessingId(null)
    }
  }

  const columns = [
    {
      key: "documento",
      label: "Documento",
      render: (item: Ingreso) => <span className="font-medium">{item.documento}</span>,
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Ingreso) => {
        const config = estadoConfig[item.estado]
        return (
          <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
            {config.icon}
            {config.label}
          </Badge>
        )
      },
    },
    { key: "tipo", label: "Tipo", render: (item: Ingreso) => <span>{tipoLabels[item.tipo]}</span> },
    { key: "origen", label: "Origen" },
    { key: "fecha", label: "Fecha" },
    {
      key: "items",
      label: "Ítems",
      render: (item: Ingreso) => <span className="font-medium">{item.items.length}</span>,
    },
    {
      key: "usuarioCreacion",
      label: "Usuario",
      render: (item: Ingreso) => <span className="text-sm text-muted-foreground">{item.usuarioCreacion}</span>,
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (item: Ingreso) => {
        const isProcessing = processingId === item.id

        // Paletizado: puede Validar o Anular
        if (item.estado === "paletizado") {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={isProcessing}
                onClick={() => handleUpdateEstado(item.id, "validado")}
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
                Validar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isProcessing}
                onClick={() => handleUpdateEstado(item.id, "anulado")}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Anular
              </Button>
            </div>
          )
        }

        // Validado: puede Almacenar o Anular
        if (item.estado === "validado") {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={isProcessing}
                onClick={() => handleUpdateEstado(item.id, "almacenado")}
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                Almacenar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isProcessing}
                onClick={() => handleUpdateEstado(item.id, "anulado")}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Anular
              </Button>
            </div>
          )
        }

        // Almacenado o Anulado: no hay acciones
        return null
      },
    },
  ]


  return (
    <MainLayout>
      <PageHeader
        title="Gestión de Ingresos"
        description={selectedAlmacenId ? `Almacén: ${selectedAlmacenId}` : "Seleccione un almacén"}
        onNew={handleNewIngreso}
        newLabel="Registrar Ingreso"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-600/20 border-gray-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Paletizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-400">{stats.paletizado}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-600/20 border-orange-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-400">Validado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-400">{stats.validado}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-600/20 border-green-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400">Almacenado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">{stats.almacenado}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-600/20 border-red-600/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Anulado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{stats.anulado}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Buscar por documento o origen..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-secondary border-border"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando ingresos...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchIngresos()} variant="outline">
            Reintentar
          </Button>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable data={filteredIngresos} columns={columns} showActions={false} />
      )}
    </MainLayout>
  )
}
