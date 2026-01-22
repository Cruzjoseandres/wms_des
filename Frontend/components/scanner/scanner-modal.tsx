"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanBarcode, Camera, Keyboard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess?: (code: string) => void
}

interface ScanResult {
  code: string
  type: "barcode" | "qr"
  timestamp: Date
  product?: {
    name: string
    sku: string
    location: string
    stock: number
  }
}

export function ScannerModal({ open, onOpenChange, onScanSuccess }: ScannerModalProps) {
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual")
  const [inputValue, setInputValue] = useState("")
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraContainerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<any>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && scanMode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, scanMode])

  // Initialize camera when switching to camera mode
  const startCamera = useCallback(async () => {
    if (!cameraContainerRef.current) return

    setCameraLoading(true)
    setCameraError(null)

    try {
      // Dynamically import html5-qrcode only on client side
      const { Html5Qrcode } = await import("html5-qrcode")

      // Stop any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          // Ignore stop errors
        }
      }

      const scannerId = "scanner-camera-view"

      // Create scanner instance
      const scanner = new Html5Qrcode(scannerId)
      scannerRef.current = scanner
      setHtml5QrCode(scanner)

      // Request camera permission and start scanning
      await scanner.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        },
        (decodedText: string) => {
          // On successful scan
          handleScan(decodedText)

          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }
        },
        () => {
          // QR code not detected - ignore
        }
      )

      setCameraLoading(false)
    } catch (error: any) {
      console.error("Camera error:", error)
      setCameraLoading(false)

      if (error.name === "NotAllowedError" || error.message?.includes("Permission")) {
        setCameraError("Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.")
      } else if (error.name === "NotFoundError" || error.message?.includes("No camera")) {
        setCameraError("No se encontró ninguna cámara en este dispositivo.")
      } else if (error.name === "NotReadableError") {
        setCameraError("La cámara está siendo usada por otra aplicación.")
      } else {
        setCameraError(`Error al iniciar la cámara: ${error.message || "Error desconocido"}`)
      }
    }
  }, [])

  // Stop camera when switching modes or closing modal
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
        setHtml5QrCode(null)
      } catch (e) {
        // Ignore stop errors
      }
    }
  }, [])

  // Handle mode changes
  useEffect(() => {
    if (scanMode === "camera" && open) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [scanMode, open, startCamera, stopCamera])

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!open) {
      stopCamera()
      setLastScan(null)
      setCameraError(null)
    }

    return () => {
      stopCamera()
    }
  }, [open, stopCamera])

  const handleScan = (code: string) => {
    if (!code.trim()) return

    setIsScanning(true)

    // Simulate API call to lookup product
    setTimeout(() => {
      const mockProduct = {
        name: "Producto Demo " + code.slice(-4),
        sku: code,
        location: "A-01-02-03",
        stock: Math.floor(Math.random() * 100) + 1,
      }

      setLastScan({
        code,
        type: code.length > 15 ? "qr" : "barcode",
        timestamp: new Date(),
        product: mockProduct,
      })
      setInputValue("")
      setIsScanning(false)

      // Call the callback if provided
      if (onScanSuccess) {
        onScanSuccess(code)
      }
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleScan(inputValue)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-primary" />
            Escáner de Códigos
          </DialogTitle>
        </DialogHeader>

        <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "camera" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Lector USB</span>
              <span className="sm:hidden">USB</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Cámara</span>
              <span className="sm:hidden">Cámara</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="scanner-input">Código de Barras / QR</Label>
              <div className="relative">
                <Input
                  id="scanner-input"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanea o escribe el código..."
                  className="pr-10"
                  autoComplete="off"
                  autoFocus
                />
                <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Conecta tu lector de códigos USB y escanea. El código aparecerá automáticamente.
              </p>
            </div>

            <Button
              onClick={() => handleScan(inputValue)}
              disabled={!inputValue.trim() || isScanning}
              className="w-full"
            >
              {isScanning ? "Buscando..." : "Buscar Producto"}
            </Button>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4 mt-4">
            {/* Camera view container */}
            <div
              ref={cameraContainerRef}
              className="relative aspect-video bg-muted rounded-lg overflow-hidden"
            >
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 p-4">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
                    <p className="text-sm text-destructive">{cameraError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={startCamera}
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              )}

              {/* This div will be used by html5-qrcode for the camera view */}
              <div id="scanner-camera-view" className="w-full h-full" />

              {/* Scan overlay - only show when camera is active */}
              {!cameraError && !cameraLoading && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-primary/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Apunta la cámara hacia el código de barras o QR para escanearlo automáticamente.
            </p>
          </TabsContent>
        </Tabs>

        {/* Last scan result */}
        {lastScan && (
          <div
            className={cn(
              "mt-4 p-4 rounded-lg border",
              lastScan.product ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30",
            )}
          >
            <div className="flex items-start gap-3">
              {lastScan.product ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{lastScan.product?.name || "Producto no encontrado"}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">SKU:</span>{" "}
                    <span className="font-mono">{lastScan.code}</span>
                  </div>
                  {lastScan.product && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Ubicación:</span>{" "}
                        <span>{lastScan.product.location}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>{" "}
                        <span>{lastScan.product.stock} unidades</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

