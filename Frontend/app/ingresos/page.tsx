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
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIngresosStore, type Ingreso, type IngresoStatus } from "@/lib/stores/ingresos-store"
import { Monitor, FileText, Printer, Plus, Search, Calendar, Package, Zap, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/providers/theme-provider"

const estadoConfig: Record<IngresoStatus, { color: string; label: string; icon: React.ReactNode }> = {
  paletizado: {
    color: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    label: "PALETIZADO",
    icon: null,
  },
  validado: {
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    label: "VALIDADO",
    icon: null,
  },
  almacenado: {
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    label: "ALMACENADO",
    icon: null,
  },
  anulado: {
    color: "bg-red-100 text-red-700 hover:bg-red-200",
    label: "ANULADO",
    icon: null,
  },
}

const tipoLabels: Record<string, string> = {
  produccion: "Ingreso de Producción",
  traspaso: "Traspaso de Almacén",
  reingreso: "Reingreso de Cliente",
  anulacion: "Anulación de Salida",
}

export default function IngresosPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Date Filters
  const [dateStart, setDateStart] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) // First day of current month
  const [dateEnd, setDateEnd] = useState<Date | undefined>(new Date()) // Today

  const selectedAlmacenId = useIngresosStore((s) => s.selectedAlmacenId)
  const allIngresos = useIngresosStore((s) => s.ingresos)
  const isLoading = useIngresosStore((s) => s.isLoading)
  const error = useIngresosStore((s) => s.error)
  const updateEstadoBackend = useIngresosStore((s) => s.updateEstadoBackend)
  const fetchIngresos = useIngresosStore((s) => s.fetchIngresos)

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    fetchIngresos()
    console.log("ingresos", allIngresos)
  }, [fetchIngresos])

  const { ingresos, stats } = useMemo(() => {
    console.log("[Page] allIngresos count:", allIngresos.length, "selectedAlmacenId:", selectedAlmacenId)
    // Mostrar todos los ingresos si no hay almacen seleccionado, o filtrar por almacen
    const filtered = selectedAlmacenId
      ? allIngresos.filter((i) => i.almacenId === selectedAlmacenId)
      : allIngresos // Mostrar todos si no hay filtro
    console.log("[Page] filtered count:", filtered.length)
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
    console.log("[Page] Filtering ingresos. Total:", ingresos.length, "searchText:", searchText)
    const result = ingresos.filter(
      (ing) => {
        const matchesSearch =
          !searchText ||
          ing.documento.toLowerCase().includes(searchText.toLowerCase()) ||
          ing.origen.toLowerCase().includes(searchText.toLowerCase())

        // Parse fecha in format "dd/mm/yyyy" or ISO format
        let ingDate: Date | null = null
        if (ing.fecha) {
          if (ing.fecha.includes('/')) {
            const parts = ing.fecha.split('/')
            if (parts.length === 3) {
              ingDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
            }
          } else {
            ingDate = new Date(ing.fecha)
          }
        }

        const matchesDate =
          !ingDate || (
            (!dateStart || ingDate >= dateStart) &&
            (!dateEnd || ingDate <= new Date(dateEnd.getTime() + 86400000))
          )

        return matchesSearch && matchesDate
      }
    )
    console.log("[Page] filteredIngresos count:", result.length)
    return result
  }, [ingresos, searchText, dateStart, dateEnd])

  const handleNewIngreso = () => {
    router.push("/ingresos/registro") // Updated to point to our new registro page
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
      label: "Nro. Documento",
      render: (item: Ingreso) => <span className="font-medium text-primary cursor-pointer hover:underline">{item.documento}</span>,
    },
    {
      key: "estado",
      label: "Estado",
      render: (item: Ingreso) => {
        const config = estadoConfig[item.estado]
        return (
          <Badge variant="outline" className={`${config.color} border-0 font-bold px-3 py-1`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "fecha",
      label: "Fecha Ingreso",
      render: (item: Ingreso) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.fecha}</span>
          {/* Fallback mock time if not present in generic fecha string, ideally backend sends clear datetime */}
          <span className="text-xs text-muted-foreground">{new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: "tipo",
      label: "Movimiento",
      render: (item: Ingreso) => <span>{tipoLabels[item.tipo] || item.tipo}</span>
    },
    {
      key: "observaciones",
      label: "Observacion",
      render: (item: Ingreso) => <span className="text-sm text-muted-foreground max-w-[200px] truncate block" title={item.observaciones}>{item.observaciones || "Balanza: --, Turno: --"}</span>
    },
    {
      key: "usuarioCreacion",
      label: "Usuario",
      render: (item: Ingreso) => <span className="text-sm">{item.usuarioCreacion}</span>,
    },
    {
      key: "usuarioValidacion",
      label: "Usuarios Validación",
      render: (item: Ingreso) => <span className="text-sm">{item.usuarioValidacion || "--"}</span>,
    },
    {
      key: "usuarioAlmacenaje",
      label: "Usuarios Almacenaje",
      render: (item: Ingreso) => <span className="text-sm">{item.usuarioAlmacenaje || "--"}</span>,
    },
  ]


  return (
    <MainLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground/80">GESTIONAR INGRESOS</h1>
            <p className="text-muted-foreground text-sm">{selectedAlmacenId ? `Almacén: ${selectedAlmacenId}` : "Vista General"}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <FileText className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-destructive hover:text-destructive">
              <XCircle className="w-4 h-4" />
              Anular
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta Palet
            </Button>
            <Button onClick={handleNewIngreso} size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Registrar Ingreso
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card p-3 rounded-lg border shadow-sm flex flex-wrap gap-4 items-end">

          {/* Date Start */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Desde:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[140px] justify-start text-left font-normal h-9",
                    !dateStart && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateStart ? format(dateStart, "d/M/yyyy") : <span>Seleccionar</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateStart}
                  onSelect={setDateStart}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date End */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Hasta:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[140px] justify-start text-left font-normal h-9",
                    !dateEnd && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateEnd ? format(dateEnd, "d/M/yyyy") : <span>Seleccionar</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateEnd}
                  onSelect={setDateEnd}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <Label className="text-xs font-semibold text-muted-foreground">Buscar:</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ingrese el dato a buscar"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
          </div>

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
          <div className="rounded-md border bg-card">
            <DataTable
              data={filteredIngresos}
              columns={columns}
              showActions={false}
              className="border-0"
            />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
