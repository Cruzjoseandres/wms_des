"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanBarcode, Camera, Keyboard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useScanDetection } from "@/hooks/use-scan-detection"
import { toast } from "sonner"

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
  const [scanMode, setScanMode] = useState<"camera" | "manual" | "zebra">("manual")
  const [inputValue, setInputValue] = useState("")
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<any>(null)

  // --- ZEBRA / HARDWARE SCANNING HOOK ---
  useScanDetection({
    onComplete: (code) => {
      // Ignore if modal is closed
      if (!open) return

      toast.info(`Escaneo Hardware: ${code}`)
      handleScan(code)
    },
    minLength: 3,
    // We intentionally DON'T ignore inputs here so it works even if focusing the manual input
    // but maybe we want to be careful if user is typing manually? 
    // Usually Zebra sends keys very fast, typing is slow. Hook handles that via avgTimeByChar.
  })

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && scanMode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, scanMode])

  // Start camera when switching to camera mode
  useEffect(() => {
    if (scanMode === "camera" && open) {
      initCamera()
    }

    return () => {
      cleanupCamera()
    }
  }, [scanMode, open])

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      cleanupCamera()
      setLastScan(null)
      setCameraError(null)
      setCameraActive(false)
    }
  }, [open])

  const initCamera = async () => {
    // Wait a bit for the DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100))

    const element = document.getElementById("scanner-camera-view")
    if (!element) {
      console.error("Camera container not found")
      setCameraError("Error: contenedor de cámara no encontrado")
      return
    }

    setCameraLoading(true)
    setCameraError(null)

    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode")

      // Stop any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          // Ignore
        }
        scannerRef.current = null
      }

      // Create new scanner
      const scanner = new Html5Qrcode("scanner-camera-view")
      scannerRef.current = scanner

      // Start scanning
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText: string) => {
          console.log("Scanned:", decodedText)
          handleScan(decodedText)
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }
        },
        () => {
          // Ignore scan failures
        }
      )

      setCameraLoading(false)
      setCameraActive(true)
      console.log("Camera started successfully")
    } catch (error: any) {
      console.error("Camera error:", error)
      setCameraLoading(false)
      setCameraActive(false)

      if (error.name === "NotAllowedError") {
        setCameraError("Permiso de cámara denegado. Permite el acceso en la configuración del navegador.")
      } else if (error.name === "NotFoundError") {
        setCameraError("No se encontró ninguna cámara.")
      } else if (error.name === "NotReadableError") {
        setCameraError("La cámara está en uso por otra aplicación.")
      } else {
        setCameraError(`Error: ${error.message || "No se pudo iniciar la cámara"}`)
      }
    }
  }

  const cleanupCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (e) {
        // Ignore cleanup errors
      }
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  const handleScan = async (code: string) => {
    if (!code.trim()) return

    setIsScanning(true)

    try {
      // Import ItemService dynamically to avoid circular deps
      const { ItemService } = await import("@/lib/api/item.service")

      // Try to find product by barcode first, then by codigo
      let product = await ItemService.getByCodigoBarra(code).catch(() => null)

      if (!product) {
        // Try by codigo
        product = await ItemService.getByCodigo(code).catch(() => null)
      }

      if (product) {
        setLastScan({
          code,
          type: code.length > 15 ? "qr" : "barcode",
          timestamp: new Date(),
          product: {
            name: product.descripcion,
            sku: product.codigo,
            location: "-", // Would need stock_inventario lookup
            stock: product.stock || 0,
          },
        })
      } else {
        // Product not found
        setLastScan({
          code,
          type: code.length > 15 ? "qr" : "barcode",
          timestamp: new Date(),
          product: undefined,
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setLastScan({
        code,
        type: code.length > 15 ? "qr" : "barcode",
        timestamp: new Date(),
        product: undefined,
      })
    } finally {
      setInputValue("")
      setIsScanning(false)

      if (onScanSuccess) {
        onScanSuccess(code)
      }
    }
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
          <DialogDescription>
            Escanea códigos de barras o QR usando tu cámara, lector USB o Zebra.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "camera" | "manual" | "zebra")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="zebra" className="gap-2">
              {/* Zebra Icon (Barcode) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                <path d="M7 7h10v10H7z" />
                <path d="M12 17v-6" />
              </svg>
              <span className="hidden sm:inline">Zebra</span>
              <span className="sm:hidden">Zebra</span>
            </TabsTrigger>
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

          <TabsContent value="zebra" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 text-blue-500" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                  <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                  <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                  <path d="M7 7h10v10H7z" />
                  <path d="M12 17v-6" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">Modo Zebra Scanner</h3>
                <p className="text-sm text-slate-500 max-w-[200px]">
                  Presiona el gatillo físico de tu dispositivo para escanear.
                </p>
              </div>
              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                Detector de Hardware Activo
              </div>
            </div>
          </TabsContent>

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
                Conecta tu lector de códigos USB y escanea.
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
            {/* Camera container */}
            <div
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              {/* Loading state */}
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-20">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
                    <p className="text-xs text-muted-foreground mt-1">Permite el acceso cuando aparezca el diálogo</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {cameraError && !cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-20 p-4">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
                    <p className="text-sm text-destructive mb-3">{cameraError}</p>
                    <Button variant="outline" size="sm" onClick={initCamera}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera view - html5-qrcode will render here */}
              <div
                id="scanner-camera-view"
                style={{ width: '100%', minHeight: '300px' }}
              />

              {/* Scan frame overlay */}
              {cameraActive && !cameraError && !cameraLoading && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-green-500/70 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Apunta la cámara hacia el código de barras o QR.
            </p>
          </TabsContent>
        </Tabs>

        {/* Scan result */}
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
                    <span className="text-muted-foreground">Código:</span>{" "}
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
