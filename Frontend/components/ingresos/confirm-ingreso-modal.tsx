"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Loader2, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetalleResumen {
    id: string
    itemCode: string
    descripcion: string
    cantidadEsperada: number
    cantidadEscaneada: number
}

interface ConfirmIngresoModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (observacion: string) => Promise<void>
    nroDocumento: string
    detalles: DetalleResumen[]
}

export function ConfirmIngresoModal({
    isOpen,
    onClose,
    onConfirm,
    nroDocumento,
    detalles,
}: ConfirmIngresoModalProps) {
    const [observacion, setObservacion] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            await onConfirm(observacion)
            setObservacion("")
            onClose()
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalEsperado = detalles.reduce((sum, d) => sum + d.cantidadEsperada, 0)
    const totalEscaneado = detalles.reduce((sum, d) => sum + d.cantidadEscaneada, 0)
    const hayDiferencias = detalles.some(d => d.cantidadEsperada !== d.cantidadEscaneada)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Confirmar Ingreso
                    </DialogTitle>
                    <p className="text-sm text-slate-500 font-mono">{nroDocumento}</p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Resumen */}
                    {hayDiferencias && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Hay diferencias entre lo esperado y lo escaneado</span>
                        </div>
                    )}

                    {/* Tabla de detalles */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 grid grid-cols-4 gap-2">
                            <span className="col-span-2">Producto</span>
                            <span className="text-center">Esperado</span>
                            <span className="text-center">Recibido</span>
                        </div>
                        <div className="divide-y max-h-48 overflow-y-auto">
                            {detalles.map((d) => {
                                const diff = d.cantidadEscaneada - d.cantidadEsperada
                                const isMatch = diff === 0
                                const isMissing = diff < 0
                                const isExtra = diff > 0

                                return (
                                    <div key={d.id} className="px-3 py-2 grid grid-cols-4 gap-2 items-center text-sm">
                                        <div className="col-span-2 truncate">
                                            <span className="font-mono text-xs text-slate-500">{d.itemCode}</span>
                                            <p className="truncate text-xs">{d.descripcion}</p>
                                        </div>
                                        <div className="text-center font-medium">{d.cantidadEsperada}</div>
                                        <div className="text-center">
                                            <span
                                                className={cn(
                                                    "font-bold",
                                                    isMatch && "text-green-600",
                                                    isMissing && "text-red-600",
                                                    isExtra && "text-amber-600"
                                                )}
                                            >
                                                {d.cantidadEscaneada}
                                            </span>
                                            {!isMatch && (
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    isMissing ? "text-red-500" : "text-amber-500"
                                                )}>
                                                    ({diff > 0 ? "+" : ""}{diff})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Totales */}
                        <div className="bg-slate-50 px-3 py-2 grid grid-cols-4 gap-2 text-sm font-semibold border-t">
                            <span className="col-span-2">TOTAL</span>
                            <span className="text-center">{totalEsperado}</span>
                            <span className={cn(
                                "text-center",
                                totalEscaneado === totalEsperado ? "text-green-600" : "text-amber-600"
                            )}>
                                {totalEscaneado}
                            </span>
                        </div>
                    </div>

                    {/* Observación */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Observación (opcional)
                        </label>
                        <Textarea
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            placeholder="Agregar notas sobre el ingreso..."
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting || totalEscaneado === 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirmando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirmar y Almacenar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
