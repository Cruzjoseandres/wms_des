"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanBarcode, Camera, Keyboard, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function ScannerModal({ open, onOpenChange }: ScannerModalProps) {
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual")
  const [inputValue, setInputValue] = useState("")
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && scanMode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, scanMode])

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
            {/* Camera simulation */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cámara no disponible</p>
                <p className="text-xs">Use el modo Lector USB</p>
              </div>

              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-primary/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            </div>
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
