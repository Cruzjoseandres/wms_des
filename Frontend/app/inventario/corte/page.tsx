"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Scissors,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Database,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react"

interface CorteStock {
  id: string
  fecha: string
  tipo: "SGLA" | "Externo"
  estado: "Pendiente" | "Procesado" | "Conciliado"
  totalItems: number
  totalUnidades: number
  diferencias?: number
}

const cortesData: CorteStock[] = [
  { id: "1", fecha: "2025-01-08", tipo: "SGLA", estado: "Procesado", totalItems: 1765, totalUnidades: 45230 },
  { id: "2", fecha: "2025-01-08", tipo: "Externo", estado: "Pendiente", totalItems: 0, totalUnidades: 0 },
  {
    id: "3",
    fecha: "2025-01-01",
    tipo: "SGLA",
    estado: "Conciliado",
    totalItems: 1720,
    totalUnidades: 43500,
    diferencias: 8,
  },
  {
    id: "4",
    fecha: "2025-01-01",
    tipo: "Externo",
    estado: "Conciliado",
    totalItems: 1718,
    totalUnidades: 43450,
    diferencias: 8,
  },
]

interface StockItem {
  codigo: string
  descripcion: string
  stockSGLA: number
  stockExterno: number
  diferencia: number
}

const stockComparativo: StockItem[] = [
  { codigo: "PROD-001", descripcion: "Producto A Premium", stockSGLA: 150, stockExterno: 150, diferencia: 0 },
  { codigo: "PROD-002", descripcion: "Producto B Estándar", stockSGLA: 280, stockExterno: 278, diferencia: 2 },
  { codigo: "PROD-003", descripcion: "Producto C Básico", stockSGLA: 95, stockExterno: 95, diferencia: 0 },
  { codigo: "PROD-004", descripcion: "Producto D Premium", stockSGLA: 420, stockExterno: 425, diferencia: -5 },
  { codigo: "PROD-005", descripcion: "Producto E Especial", stockSGLA: 60, stockExterno: 59, diferencia: 1 },
]

export default function CorteStockPage() {
  const [cortes, setCortes] = useState<CorteStock[]>(cortesData)
  const [activeTab, setActiveTab] = useState("sgla")
  const [selectedAlmacen, setSelectedAlmacen] = useState("PT9 NUEVO CEDIS")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRealizarCorteSGLA = async () => {
    setIsProcessing(true)
    // Simulación de proceso
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newCorte: CorteStock = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split("T")[0],
      tipo: "SGLA",
      estado: "Procesado",
      totalItems: 1765,
      totalUnidades: 45230 + Math.floor(Math.random() * 100),
    }
    setCortes([newCorte, ...cortes])
    setIsProcessing(false)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Badge className="bg-amber-500 text-white">Pendiente</Badge>
      case "Procesado":
        return <Badge className="bg-blue-600 text-white">Procesado</Badge>
      case "Conciliado":
        return <Badge className="bg-green-600 text-white">Conciliado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Corte de Stock"
          description="Corte administrativo y conciliación con sistemas externos"
          icon={<Scissors className="h-6 w-6" />}
        />

        {/* Selector de Almacén */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Label className="text-muted-foreground">Almacén</Label>
                <Select value={selectedAlmacen} onValueChange={setSelectedAlmacen}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PT9 NUEVO CEDIS">PT9 NUEVO CEDIS</SelectItem>
                    <SelectItem value="PT5 CENTRAL">PT5 CENTRAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex justify-end gap-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Historial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="sgla" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Database className="h-4 w-4 mr-2" />
              Corte SGLA
            </TabsTrigger>
            <TabsTrigger value="externo" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Sistema Externo
            </TabsTrigger>
            <TabsTrigger
              value="conciliacion"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Conciliación
            </TabsTrigger>
          </TabsList>

          {/* Tab Corte SGLA */}
          <TabsContent value="sgla" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Corte de Stock SGLA</CardTitle>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleRealizarCorteSGLA}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Scissors className="h-4 w-4 mr-2" />
                  )}
                  Realizar Corte
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Fecha</TableHead>
                      <TableHead className="text-muted-foreground">Tipo</TableHead>
                      <TableHead className="text-muted-foreground">Total Items</TableHead>
                      <TableHead className="text-muted-foreground">Total Unidades</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cortes
                      .filter((c) => c.tipo === "SGLA")
                      .map((corte) => (
                        <TableRow key={corte.id} className="border-border">
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {corte.fecha}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                              {corte.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{corte.totalItems.toLocaleString()}</TableCell>
                          <TableCell className="text-foreground">{corte.totalUnidades.toLocaleString()}</TableCell>
                          <TableCell>{getEstadoBadge(corte.estado)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sistema Externo */}
          <TabsContent value="externo" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Importar Corte Sistema Externo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground mb-2">Arrastra un archivo Excel o CSV aquí</p>
                  <p className="text-sm text-muted-foreground mb-4">O haz clic para seleccionar un archivo</p>
                  <Input type="file" className="hidden" id="file-upload" accept=".xlsx,.xls,.csv" />
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                    Seleccionar Archivo
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cortes Externos Importados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Fecha</TableHead>
                      <TableHead className="text-muted-foreground">Tipo</TableHead>
                      <TableHead className="text-muted-foreground">Total Items</TableHead>
                      <TableHead className="text-muted-foreground">Total Unidades</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cortes
                      .filter((c) => c.tipo === "Externo")
                      .map((corte) => (
                        <TableRow key={corte.id} className="border-border">
                          <TableCell className="text-foreground">{corte.fecha}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-purple-500 text-purple-500">
                              {corte.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{corte.totalItems.toLocaleString()}</TableCell>
                          <TableCell className="text-foreground">{corte.totalUnidades.toLocaleString()}</TableCell>
                          <TableCell>{getEstadoBadge(corte.estado)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conciliación */}
          <TabsContent value="conciliacion" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-600 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Coincidentes</p>
                      <p className="text-3xl font-bold text-white">
                        {stockComparativo.filter((s) => s.diferencia === 0).length}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-500 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Con Diferencias</p>
                      <p className="text-3xl font-bold text-white">
                        {stockComparativo.filter((s) => s.diferencia !== 0).length}
                      </p>
                    </div>
                    <AlertTriangle className="h-10 w-10 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Analizado</p>
                      <p className="text-3xl font-bold text-white">{stockComparativo.length}</p>
                    </div>
                    <Database className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Comparativo SGLA vs Sistema Externo</CardTitle>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Conciliar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Código</TableHead>
                      <TableHead className="text-muted-foreground">Descripción</TableHead>
                      <TableHead className="text-muted-foreground text-right">Stock SGLA</TableHead>
                      <TableHead className="text-muted-foreground text-right">Stock Externo</TableHead>
                      <TableHead className="text-muted-foreground text-right">Diferencia</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockComparativo.map((item) => (
                      <TableRow key={item.codigo} className="border-border">
                        <TableCell className="text-foreground font-medium">{item.codigo}</TableCell>
                        <TableCell className="text-foreground">{item.descripcion}</TableCell>
                        <TableCell className="text-foreground text-right">{item.stockSGLA}</TableCell>
                        <TableCell className="text-foreground text-right">{item.stockExterno}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.diferencia === 0
                              ? "text-green-500"
                              : item.diferencia > 0
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {item.diferencia > 0 ? "+" : ""}
                          {item.diferencia}
                        </TableCell>
                        <TableCell>
                          {item.diferencia === 0 ? (
                            <Badge className="bg-green-600 text-white">OK</Badge>
                          ) : (
                            <Badge className="bg-amber-500 text-white">Revisar</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
