"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImportResult {
  fila: number
  documento: string
  producto: string
  cantidad: number
  estado: "ok" | "error" | "advertencia"
  mensaje: string
}

export default function IngresoMasivoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleDownloadTemplate = () => {
    alert("Descargando plantilla Excel...")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setShowResults(false)
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults: ImportResult[] = [
      {
        fila: 1,
        documento: "ING-M-001",
        producto: "PRD-001",
        cantidad: 100,
        estado: "ok",
        mensaje: "Procesado correctamente",
      },
      {
        fila: 2,
        documento: "ING-M-001",
        producto: "PRD-002",
        cantidad: 50,
        estado: "ok",
        mensaje: "Procesado correctamente",
      },
      {
        fila: 3,
        documento: "ING-M-001",
        producto: "PRD-003",
        cantidad: 75,
        estado: "advertencia",
        mensaje: "Producto sin lote",
      },
      {
        fila: 4,
        documento: "ING-M-002",
        producto: "PRD-999",
        cantidad: 30,
        estado: "error",
        mensaje: "Producto no existe",
      },
      {
        fila: 5,
        documento: "ING-M-002",
        producto: "PRD-004",
        cantidad: 200,
        estado: "ok",
        mensaje: "Procesado correctamente",
      },
    ]

    setResults(mockResults)
    setShowResults(true)
    setIsProcessing(false)
  }

  const estadoIcons: Record<string, React.ReactNode> = {
    ok: <CheckCircle className="w-4 h-4 text-green-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    advertencia: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  }

  const okCount = results.filter((r) => r.estado === "ok").length
  const errorCount = results.filter((r) => r.estado === "error").length
  const warningCount = results.filter((r) => r.estado === "advertencia").length

  return (
    <MainLayout>
      <PageHeader title="Ingreso Masivo de Notas" description="Importación de ingresos desde archivo Excel" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Cargar Archivo
            </CardTitle>
            <CardDescription>Seleccione un archivo Excel con el formato correcto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Archivo Excel (.xlsx, .xls)</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="bg-secondary border-border"
              />
            </div>

            {file && (
              <Alert className="bg-blue-600/20 border-blue-600/50">
                <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                <AlertTitle className="text-blue-400">Archivo seleccionado</AlertTitle>
                <AlertDescription className="text-blue-300">{file.name}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleProcess}
                disabled={!file || isProcessing}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Procesar Carga
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Plantilla de Importación
            </CardTitle>
            <CardDescription>Descargue la plantilla con el formato requerido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Columnas requeridas:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <span className="text-foreground">Documento</span> - Número de nota de ingreso
                </li>
                <li>
                  • <span className="text-foreground">Código Producto</span> - Código del producto
                </li>
                <li>
                  • <span className="text-foreground">Cantidad</span> - Cantidad a ingresar
                </li>
                <li>
                  • <span className="text-foreground">Lote</span> - Número de lote (opcional)
                </li>
                <li>
                  • <span className="text-foreground">Vencimiento</span> - Fecha de vencimiento (opcional)
                </li>
                <li>
                  • <span className="text-foreground">Tipo Ingreso</span> - Producción/Traspaso/Reingreso
                </li>
              </ul>
            </div>

            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full bg-secondary border-border">
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {showResults && (
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle>Resultado del Procesamiento</CardTitle>
            <div className="flex gap-4 mt-2">
              <Badge className="bg-green-600">{okCount} Exitosos</Badge>
              <Badge className="bg-yellow-600">{warningCount} Advertencias</Badge>
              <Badge className="bg-red-600">{errorCount} Errores</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead className="w-12">Fila</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Mensaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.fila} className="hover:bg-muted/50">
                      <TableCell>{result.fila}</TableCell>
                      <TableCell>{result.documento}</TableCell>
                      <TableCell>{result.producto}</TableCell>
                      <TableCell>{result.cantidad}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {estadoIcons[result.estado]}
                          <span
                            className={
                              result.estado === "ok"
                                ? "text-green-400"
                                : result.estado === "error"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }
                          >
                            {result.estado.toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{result.mensaje}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  )
}
