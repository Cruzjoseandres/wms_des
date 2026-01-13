"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  ShieldCheck,
  ScanLine,
  Package,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
} from "lucide-react"

interface ItemVerificacion {
  id: string
  codigo: string
  descripcion: string
  ubicacionEsperada: string
  ubicacionLeida?: string
  tagRFID: string
  estado: "Pendiente" | "Verificado" | "Error" | "No Encontrado"
}

const itemsData: ItemVerificacion[] = [
  {
    id: "1",
    codigo: "PROD-001",
    descripcion: "Producto A Premium",
    ubicacionEsperada: "A-01-01",
    ubicacionLeida: "A-01-01",
    tagRFID: "E200001234567890ABCD",
    estado: "Verificado",
  },
  {
    id: "2",
    codigo: "PROD-002",
    descripcion: "Producto B Estándar",
    ubicacionEsperada: "A-01-02",
    ubicacionLeida: "B-02-01",
    tagRFID: "E200001234567890ABCE",
    estado: "Error",
  },
  {
    id: "3",
    codigo: "PROD-003",
    descripcion: "Producto C Básico",
    ubicacionEsperada: "A-02-01",
    tagRFID: "E200001234567890ABCF",
    estado: "No Encontrado",
  },
  {
    id: "4",
    codigo: "PROD-004",
    descripcion: "Producto D Premium",
    ubicacionEsperada: "B-01-01",
    tagRFID: "E200009876543210DCBA",
    estado: "Pendiente",
  },
  {
    id: "5",
    codigo: "PROD-005",
    descripcion: "Producto E Especial",
    ubicacionEsperada: "B-01-02",
    tagRFID: "E200009876543210DCBB",
    estado: "Pendiente",
  },
]

export default function VerificacionRFPage() {
  const [items, setItems] = useState<ItemVerificacion[]>(itemsData)
  const [tipoVerificacion, setTipoVerificacion] = useState<string>("ubicacion")
  const [isVerifying, setIsVerifying] = useState(false)

  const verificados = items.filter((i) => i.estado === "Verificado").length
  const errores = items.filter((i) => i.estado === "Error").length
  const noEncontrados = items.filter((i) => i.estado === "No Encontrado").length
  const pendientes = items.filter((i) => i.estado === "Pendiente").length
  const progreso = Math.round((verificados / items.length) * 100)

  const handleIniciarVerificacion = async () => {
    setIsVerifying(true)
    // Simular verificación
    for (const item of items.filter((i) => i.estado === "Pendiente")) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const random = Math.random()
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                ubicacionLeida: random > 0.3 ? i.ubicacionEsperada : random > 0.15 ? "X-99-99" : undefined,
                estado:
                  random > 0.3
                    ? "Verificado"
                    : ((random > 0.15 ? "Error" : "No Encontrado") as ItemVerificacion["estado"]),
              }
            : i,
        ),
      )
    }
    setIsVerifying(false)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Verificado":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        )
      case "Error":
        return (
          <Badge className="bg-red-600 text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case "No Encontrado":
        return (
          <Badge className="bg-amber-500 text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No Encontrado
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500 text-white">Pendiente</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Verificación RF"
          description="Verificación de ubicación e integridad de productos mediante RFID"
          icon={<ShieldCheck className="h-6 w-6" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-green-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Verificados</p>
                  <p className="text-3xl font-bold text-white">{verificados}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Errores</p>
                  <p className="text-3xl font-bold text-white">{errores}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">No Encontrados</p>
                  <p className="text-3xl font-bold text-white">{noEncontrados}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Pendientes</p>
                  <p className="text-3xl font-bold text-white">{pendientes}</p>
                </div>
                <Package className="h-10 w-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Progreso</p>
                  <p className="text-3xl font-bold text-white">{progreso}%</p>
                </div>
                <ScanLine className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso de Verificación</span>
                <span className="text-foreground">
                  {verificados} de {items.length} items
                </span>
              </div>
              <Progress value={progreso} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-64">
                <Label className="text-muted-foreground">Tipo de Verificación</Label>
                <Select value={tipoVerificacion} onValueChange={setTipoVerificacion}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ubicacion">Verificación de Ubicación</SelectItem>
                    <SelectItem value="pedido">Verificación de Pedido</SelectItem>
                    <SelectItem value="despacho">Verificación de Despacho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleIniciarVerificacion}
                  disabled={isVerifying || pendientes === 0}
                >
                  {isVerifying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ScanLine className="h-4 w-4 mr-2" />
                  )}
                  {isVerifying ? "Verificando..." : "Iniciar Verificación"}
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Items a Verificar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Código</TableHead>
                  <TableHead className="text-muted-foreground">Descripción</TableHead>
                  <TableHead className="text-muted-foreground">Tag RFID</TableHead>
                  <TableHead className="text-muted-foreground">Ubicación Esperada</TableHead>
                  <TableHead className="text-muted-foreground">Ubicación Leída</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`border-border ${
                      item.estado === "Error"
                        ? "bg-red-500/10"
                        : item.estado === "No Encontrado"
                          ? "bg-amber-500/10"
                          : ""
                    }`}
                  >
                    <TableCell className="text-foreground font-medium">{item.codigo}</TableCell>
                    <TableCell className="text-foreground">{item.descripcion}</TableCell>
                    <TableCell className="text-foreground font-mono text-xs">{item.tagRFID}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {item.ubicacionEsperada}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.ubicacionLeida ? (
                        <div
                          className={`flex items-center gap-1 ${
                            item.ubicacionLeida === item.ubicacionEsperada ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          {item.ubicacionLeida}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
