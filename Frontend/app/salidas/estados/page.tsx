"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Package,
    Truck,
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCw,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle
} from "lucide-react"
import { SalidaService } from "@/lib/api/salida.service"
import { NotaIngresoService } from "@/lib/api/nota_ingreso.service"
import {
    type OrdenSalida,
    type NotaIngreso,
    EstadoOrdenSalida,
    EstadoOrdenSalidaNombre,
} from "@/lib/models"
import { toast } from "sonner"

// Mapeo de estados de ingreso (backend devuelve números)
const estadoIngresoMap: Record<number, string> = {
    0: "Paletizado",
    1: "Validado",
    2: "Almacenado",
    3: "Anulado",
    5: "Parcial",
}

const estadoIngresoColors: Record<number, string> = {
    0: "bg-yellow-600",
    1: "bg-blue-600",
    2: "bg-green-600",
    3: "bg-red-600",
    5: "bg-purple-600",
}

const estadoSalidaColors: Record<number, string> = {
    [EstadoOrdenSalida.PENDIENTE]: "bg-yellow-600",
    [EstadoOrdenSalida.EN_PICKING]: "bg-purple-600",
    [EstadoOrdenSalida.COMPLETADA]: "bg-blue-600",
    [EstadoOrdenSalida.DESPACHADA]: "bg-green-600",
}

export default function EstadosPage() {
    const [ordenesSalida, setOrdenesSalida] = useState<OrdenSalida[]>([])
    const [ordenesIngreso, setOrdenesIngreso] = useState<NotaIngreso[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("todos")
    const [filterEstado, setFilterEstado] = useState("todos")
    const [autoRefresh, setAutoRefresh] = useState(true)

    const loadData = async () => {
        try {
            setLoading(true)
            const [salidas, ingresos] = await Promise.all([
                SalidaService.getAll().catch(() => []),
                NotaIngresoService.getAll().catch(() => []),
            ])
            setOrdenesSalida(salidas)
            setOrdenesIngreso(ingresos)
        } catch (error) {
            console.error("Error cargando datos:", error)
            toast.error("Error al cargar órdenes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Auto-refresh cada 30 segundos
    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(() => {
            loadData()
        }, 30000)
        return () => clearInterval(interval)
    }, [autoRefresh])

    // Estadísticas de salida
    const statsSalida = {
        pendiente: ordenesSalida.filter(o => o.estado === EstadoOrdenSalida.PENDIENTE).length,
        enPicking: ordenesSalida.filter(o => o.estado === EstadoOrdenSalida.EN_PICKING).length,
        completada: ordenesSalida.filter(o => o.estado === EstadoOrdenSalida.COMPLETADA).length,
        despachada: ordenesSalida.filter(o => o.estado === EstadoOrdenSalida.DESPACHADA).length,
    }

    // Estadísticas de ingreso
    const statsIngreso = {
        paletizado: ordenesIngreso.filter(o => o.estado === 0).length,
        validado: ordenesIngreso.filter(o => o.estado === 1).length,
        almacenado: ordenesIngreso.filter(o => o.estado === 2).length,
        anulado: ordenesIngreso.filter(o => o.estado === 3).length,
    }

    return (
        <MainLayout>
            <PageHeader
                title="Monitor de Estados"
                description="Seguimiento en tiempo real de órdenes de ingreso y salida"
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-secondary"}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? "Auto" : "Manual"}
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-secondary border-border"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </PageHeader>

            {/* Estadísticas globales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-600/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-300">Órdenes Ingreso</p>
                                <p className="text-2xl font-bold text-blue-400">{ordenesIngreso.length}</p>
                            </div>
                            <ArrowDownCircle className="w-8 h-8 text-blue-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-600/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-300">Órdenes Salida</p>
                                <p className="text-2xl font-bold text-purple-400">{ordenesSalida.length}</p>
                            </div>
                            <ArrowUpCircle className="w-8 h-8 text-purple-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-600/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-yellow-300">En Proceso</p>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {statsSalida.enPicking + statsIngreso.paletizado + statsIngreso.validado}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-600/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-300">Completadas Hoy</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {statsSalida.completada + statsSalida.despachada + statsIngreso.almacenado}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <TabsList className="bg-secondary">
                        <TabsTrigger value="todos" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Todos
                        </TabsTrigger>
                        <TabsTrigger value="ingreso" className="flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4" />
                            Ingreso
                        </TabsTrigger>
                        <TabsTrigger value="salida" className="flex items-center gap-2">
                            <ArrowUpCircle className="w-4 h-4" />
                            Salida
                        </TabsTrigger>
                    </TabsList>

                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger className="w-[180px] bg-secondary border-border">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="proceso">En proceso</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Todos */}
                <TabsContent value="todos" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ingreso */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ArrowDownCircle className="w-5 h-5 text-blue-400" />
                                    Órdenes de Ingreso
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="p-2 bg-yellow-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-yellow-400">{statsIngreso.paletizado}</p>
                                        <p className="text-[10px] text-yellow-400">Paletizado</p>
                                    </div>
                                    <div className="p-2 bg-blue-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-blue-400">{statsIngreso.validado}</p>
                                        <p className="text-[10px] text-blue-400">Validado</p>
                                    </div>
                                    <div className="p-2 bg-green-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-green-400">{statsIngreso.almacenado}</p>
                                        <p className="text-[10px] text-green-400">Almacenado</p>
                                    </div>
                                    <div className="p-2 bg-red-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-red-400">{statsIngreso.anulado}</p>
                                        <p className="text-[10px] text-red-400">Anulado</p>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="max-h-[300px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-secondary">
                                                    <TableHead className="text-xs">Documento</TableHead>
                                                    <TableHead className="text-xs">Items</TableHead>
                                                    <TableHead className="text-xs">Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ordenesIngreso.slice(0, 10).map((orden) => (
                                                    <TableRow key={orden.id}>
                                                        <TableCell className="text-xs font-medium">{orden.nroDocumento}</TableCell>
                                                        <TableCell className="text-xs">{orden.detalles?.length || 0}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`${estadoIngresoColors[orden.estado] || "bg-gray-600"} text-[10px]`}>
                                                                {estadoIngresoMap[orden.estado] || "Desconocido"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Salida */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ArrowUpCircle className="w-5 h-5 text-purple-400" />
                                    Órdenes de Salida
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="p-2 bg-yellow-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-yellow-400">{statsSalida.pendiente}</p>
                                        <p className="text-[10px] text-yellow-400">Pendiente</p>
                                    </div>
                                    <div className="p-2 bg-purple-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-purple-400">{statsSalida.enPicking}</p>
                                        <p className="text-[10px] text-purple-400">Picking</p>
                                    </div>
                                    <div className="p-2 bg-blue-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-blue-400">{statsSalida.completada}</p>
                                        <p className="text-[10px] text-blue-400">Completada</p>
                                    </div>
                                    <div className="p-2 bg-green-600/20 rounded text-center">
                                        <p className="text-lg font-bold text-green-400">{statsSalida.despachada}</p>
                                        <p className="text-[10px] text-green-400">Despachada</p>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="max-h-[300px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-secondary">
                                                    <TableHead className="text-xs">Documento</TableHead>
                                                    <TableHead className="text-xs">Cliente</TableHead>
                                                    <TableHead className="text-xs">Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ordenesSalida.slice(0, 10).map((orden) => (
                                                    <TableRow key={orden.id}>
                                                        <TableCell className="text-xs font-medium">{orden.nroDocumento}</TableCell>
                                                        <TableCell className="text-xs truncate max-w-[100px]">{orden.cliente}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`${estadoSalidaColors[orden.estado] || "bg-gray-600"} text-[10px]`}>
                                                                {EstadoOrdenSalidaNombre[orden.estado] || "Desconocido"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Solo Ingreso */}
                <TabsContent value="ingreso">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDownCircle className="w-5 h-5 text-blue-400" />
                                Órdenes de Ingreso
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-secondary">
                                                <TableHead>Documento</TableHead>
                                                <TableHead>Origen</TableHead>
                                                <TableHead className="text-center">Detalles</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ordenesIngreso.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No hay órdenes de ingreso
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                ordenesIngreso.map((orden) => (
                                                    <TableRow key={orden.id}>
                                                        <TableCell className="font-medium">{orden.nroDocumento}</TableCell>
                                                        <TableCell>{orden.origen || "-"}</TableCell>
                                                        <TableCell className="text-center">{orden.detalles?.length || 0}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`${estadoIngresoColors[orden.estado]} flex items-center w-fit`}>
                                                                {orden.estado === 2 && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                {orden.estado === 0 && <Clock className="w-3 h-3 mr-1" />}
                                                                {orden.estado === 3 && <XCircle className="w-3 h-3 mr-1" />}
                                                                {estadoIngresoMap[orden.estado]}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(orden.fechaIngreso).toLocaleDateString("es-ES")}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Solo Salida */}
                <TabsContent value="salida">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpCircle className="w-5 h-5 text-purple-400" />
                                Órdenes de Salida
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-secondary">
                                                <TableHead>Documento</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Destino</TableHead>
                                                <TableHead className="text-center">Items</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Progreso</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ordenesSalida.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No hay órdenes de salida
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                ordenesSalida.map((orden) => {
                                                    const pickeados = orden.resumen?.pickeados || 0
                                                    const total = orden.resumen?.totalDetalles || 1
                                                    const progreso = Math.round((pickeados / total) * 100)

                                                    return (
                                                        <TableRow key={orden.id}>
                                                            <TableCell className="font-medium">{orden.nroDocumento}</TableCell>
                                                            <TableCell>{orden.cliente}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">{orden.destino || "-"}</TableCell>
                                                            <TableCell className="text-center">{total}</TableCell>
                                                            <TableCell>
                                                                <Badge className={`${estadoSalidaColors[orden.estado]} flex items-center w-fit`}>
                                                                    {orden.estado === EstadoOrdenSalida.DESPACHADA && <Truck className="w-3 h-3 mr-1" />}
                                                                    {orden.estado === EstadoOrdenSalida.EN_PICKING && <Package className="w-3 h-3 mr-1" />}
                                                                    {orden.estado === EstadoOrdenSalida.PENDIENTE && <Clock className="w-3 h-3 mr-1" />}
                                                                    {orden.estado === EstadoOrdenSalida.COMPLETADA && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                    {EstadoOrdenSalidaNombre[orden.estado]}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary transition-all"
                                                                            style={{ width: `${progreso}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground">{progreso}%</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Tabla de referencia de estados */}
            <Card className="bg-card border-border mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Referencia de Estados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Estados Ingreso */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                                Órdenes de Ingreso
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary">
                                        <TableHead className="text-xs">Estado</TableHead>
                                        <TableHead className="text-xs">Código</TableHead>
                                        <TableHead className="text-xs">Descripción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><Badge className="bg-yellow-600">Paletizado</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">0</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Recién llegada</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-blue-600">Validado</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">1</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Todos validados</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-green-600">Almacenado</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">2</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Todos almacenados</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-red-600">Anulado</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">3</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Cancelada</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-purple-600">Parcial</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">5</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">En proceso</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Estados Salida */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <ArrowUpCircle className="w-4 h-4 text-purple-400" />
                                Órdenes de Salida
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary">
                                        <TableHead className="text-xs">Estado</TableHead>
                                        <TableHead className="text-xs">Código</TableHead>
                                        <TableHead className="text-xs">Descripción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><Badge className="bg-yellow-600">Pendiente</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">0</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Lista para picking</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-purple-600">En Picking</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">1</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">En proceso</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-blue-600">Completada</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">2</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Picking terminado</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Badge className="bg-green-600">Despachada</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">3</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">Entregada</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    )
}
