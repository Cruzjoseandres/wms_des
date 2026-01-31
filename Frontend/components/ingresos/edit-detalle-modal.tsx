"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Package, MapPin, Calendar, Hash, CheckCircle2, Loader2 } from "lucide-react"

// Estado del detalle
type EstadoDetalle = "Pendiente" | "Validado" | "Almacenado" | "Reportado"

interface DetalleEscaneado {
    id: string
    codigo: string
    itemCode: string
    descripcion: string
    cantidad: number
    unidad: string
    estado: EstadoDetalle
    ubicacion?: string
    lote?: string
    fechaVencimiento?: string
}

interface EditDetalleModalProps {
    open: boolean
    onClose: () => void
    detalle: DetalleEscaneado | null
    modo: "validation" | "storage"
    onValidar: (detalle: DetalleEscaneado) => Promise<void>
    onAlmacenar: (detalle: DetalleEscaneado, ubicacion: string) => Promise<void>
    onActualizar: (detalle: DetalleEscaneado, cambios: Partial<DetalleEscaneado>) => void
}

export function EditDetalleModal({
    open,
    onClose,
    detalle,
    modo,
    onValidar,
    onAlmacenar,
    onActualizar,
}: EditDetalleModalProps) {
    // Form state
    const [cantidad, setCantidad] = useState("")
    const [lote, setLote] = useState("")
    const [fechaVencimiento, setFechaVencimiento] = useState("")
    const [ubicacion, setUbicacion] = useState("")
    const [estado, setEstado] = useState<EstadoDetalle>("Pendiente")
    const [isProcessing, setIsProcessing] = useState(false)

    // Sincronizar con el detalle cuando cambia
    useEffect(() => {
        if (detalle) {
            setCantidad(String(detalle.cantidad))
            setLote(detalle.lote || "")
            setFechaVencimiento(detalle.fechaVencimiento || "")
            setUbicacion(detalle.ubicacion || "")
            setEstado(detalle.estado)
        }
    }, [detalle])

    if (!detalle) return null

    const handleGuardar = () => {
        onActualizar(detalle, {
            cantidad: Number(cantidad),
            lote: lote || undefined,
            fechaVencimiento: fechaVencimiento || undefined,
            ubicacion: ubicacion || undefined,
        })
        onClose()
    }

    const handleValidar = async () => {
        setIsProcessing(true)
        try {
            await onValidar(detalle)
            onClose()
        } finally {
            setIsProcessing(false)
        }
    }

    const handleAlmacenar = async () => {
        if (!ubicacion) {
            return
        }
        setIsProcessing(true)
        try {
            await onAlmacenar(detalle, ubicacion)
            onClose()
        } finally {
            setIsProcessing(false)
        }
    }

    const estadoColor = {
        Pendiente: "bg-yellow-500",
        Validado: "bg-blue-500",
        Almacenado: "bg-green-500",
        Reportado: "bg-red-500",
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Detalle del Producto
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Info del producto */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Código</span>
                            <span className="font-mono font-medium">{detalle.codigo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Descripción</span>
                            <span className="text-sm font-medium truncate max-w-[200px]">
                                {detalle.descripcion}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Estado</span>
                            <Badge className={estadoColor[detalle.estado]}>{detalle.estado}</Badge>
                        </div>
                    </div>

                    {/* Campos editables */}
                    <div className="grid gap-4">
                        {/* Cantidad */}
                        <div className="grid gap-2">
                            <Label htmlFor="cantidad" className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Cantidad
                            </Label>
                            <Input
                                id="cantidad"
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                min={0}
                            />
                        </div>

                        {/* Lote */}
                        <div className="grid gap-2">
                            <Label htmlFor="lote" className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Lote
                            </Label>
                            <Input
                                id="lote"
                                value={lote}
                                onChange={(e) => setLote(e.target.value)}
                                placeholder="Ej: LOTE-2024-001"
                            />
                        </div>

                        {/* Fecha de Vencimiento */}
                        <div className="grid gap-2">
                            <Label htmlFor="fechaVenc" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Fecha de Vencimiento
                            </Label>
                            <Input
                                id="fechaVenc"
                                type="date"
                                value={fechaVencimiento}
                                onChange={(e) => setFechaVencimiento(e.target.value)}
                            />
                        </div>

                        {/* Ubicación (solo en modo almacenaje) */}
                        {modo === "storage" && (
                            <div className="grid gap-2">
                                <Label htmlFor="ubicacion" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Ubicación de Almacenaje
                                </Label>
                                <Input
                                    id="ubicacion"
                                    value={ubicacion}
                                    onChange={(e) => setUbicacion(e.target.value)}
                                    placeholder="Ej: A-01-02-03"
                                    className="font-mono"
                                />
                            </div>
                        )}

                        {/* Selector de estado manual */}
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Cambiar Estado
                            </Label>
                            <Select value={estado} onValueChange={(v) => setEstado(v as EstadoDetalle)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="Validado">Validado</SelectItem>
                                    <SelectItem value="Almacenado">Almacenado</SelectItem>
                                    <SelectItem value="Reportado">Reportado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancelar
                    </Button>

                    <Button variant="secondary" onClick={handleGuardar} disabled={isProcessing}>
                        Guardar Cambios
                    </Button>

                    {modo === "validation" && detalle.estado === "Pendiente" && (
                        <Button
                            onClick={handleValidar}
                            disabled={isProcessing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Validar
                        </Button>
                    )}

                    {modo === "storage" && detalle.estado === "Validado" && (
                        <Button
                            onClick={handleAlmacenar}
                            disabled={isProcessing || !ubicacion}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <MapPin className="h-4 w-4 mr-2" />
                            )}
                            Almacenar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
