"use client"

import { useState, useRef, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ScanBarcode,
    Search,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Box,
    CheckCircle2,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MovilService } from "@/lib/api/movil.service"
import type { OrdenMovil } from "@/lib/models"
import { EditDetalleModal } from "@/components/ingresos/edit-detalle-modal"
import { ConfirmIngresoModal } from "@/components/ingresos/confirm-ingreso-modal"
import { useScanDetection } from "@/hooks/use-scan-detection"

// --- TYPES ---
interface DetallePalet {
    id: string
    codigo: string // LPN / Pallet ID o código de producto
    itemCode: string
    descripcion: string
    cantidad: number
    unidad: string
    estado: "Pendiente" | "Validado" | "Almacenado" | "Reportado"
    ubicacion?: string
    lote?: string
}

interface DocumentoIngreso {
    id: string
    nroDocumento: string
    fecha: string
    tipoIngreso: string
    estadoGlobal: string
    palets: DetallePalet[]
}

// Helper para mapear órdenes del backend al formato del componente
function mapOrdenToDocumento(orden: OrdenMovil): DocumentoIngreso {
    const palets: DetallePalet[] = orden.detalles.map((d) => ({
        id: String(d.id),
        codigo: d.item.codigoBarra || d.item.codigo, // Código de barra o código del item
        itemCode: d.item.codigo,
        descripcion: d.item.descripcion,
        cantidad: d.cantidad,
        unidad: "UNID",
        estado: orden.estado === "VALIDADO" ? "Validado" : "Pendiente",
        lote: d.lote || undefined,
    }))

    return {
        id: String(orden.id),
        nroDocumento: orden.nroDocumento,
        fecha: new Date(orden.createdAt).toLocaleString("es-ES"),
        tipoIngreso: orden.origen,
        estadoGlobal: orden.estado === "PALETIZADO" ? "POR VALIDAR" :
            orden.estado === "VALIDADO" ? "POR ALMACENAR" : orden.estado,
        palets,
    }
}

export default function MobileScannerPage() {
    // Navigation State
    const [step, setStep] = useState<"search" | "work">("search")
    const [workMode, setWorkMode] = useState<"validation" | "storage">("validation")
    const [isLoading, setIsLoading] = useState(false)

    // Data State
    const [docQuery, setDocQuery] = useState("")
    const [currentDoc, setCurrentDoc] = useState<DocumentoIngreso | null>(null)
    const [ordenes, setOrdenes] = useState<OrdenMovil[]>([])

    // Work Form State
    const [inputPalet, setInputPalet] = useState("")
    const [inputLocation, setInputLocation] = useState("")
    const [scannedPaletData, setScannedPaletData] = useState<DetallePalet | null>(null)
    const [processingAction, setProcessingAction] = useState(false)

    // Lists State
    const [showPendingList, setShowPendingList] = useState(true)

    // Scanner State
    const [isScanning, setIsScanning] = useState(false)
    const [activeScanField, setActiveScanField] = useState<"doc" | "palet" | "location">("doc")
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Scan Counting State
    const [scanCounts, setScanCounts] = useState<Record<string, number>>({})

    // --- LOAD DATA ---
    const loadOrdenes = async (mode: "validation" | "storage") => {
        setIsLoading(true)
        try {
            const data = mode === "validation"
                ? await MovilService.getOrdenesPorValidar()
                : await MovilService.getOrdenesPorAlmacenar()
            setOrdenes(data)
            console.log(`Órdenes cargadas (${mode}):`, data)
        } catch (error) {
            console.error("Error cargando órdenes:", error)
            toast.error("Error al cargar órdenes")
        } finally {
            setIsLoading(false)
        }
    }

    // Cargar órdenes al cambiar de modo
    useEffect(() => {
        if (step === "search") {
            loadOrdenes(workMode)
        }
    }, [workMode, step])

    // --- ACTIONS ---
    const handleSearchDoc = (overrideQuery?: string) => {
        const query = overrideQuery ?? docQuery

        // Buscar en las órdenes cargadas
        const found = ordenes.find(o =>
            o.nroDocumento.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toString() === query
        )

        if (found) {
            setCurrentDoc(mapOrdenToDocumento(found))
            setStep("work")
            setDocQuery("")
            setScannedPaletData(null)
            setInputPalet("")
        } else if (ordenes.length > 0 && !query) {
            // Si no hay query, usar la primera orden
            setCurrentDoc(mapOrdenToDocumento(ordenes[0]))
            setStep("work")
            setScannedPaletData(null)
            setInputPalet("")
        } else {
            toast.error("Documento no encontrado")
        }
    }

    const handleScanPalet = () => {
        if (!currentDoc || !inputPalet) return
        // Delegate to the counting logic
        handleScanPaletWithCode(inputPalet)
    }

    const handleValidate = async () => {
        if (!inputPalet && !scannedPaletData) {
            toast.error("Escanee un código primero")
            return
        }

        const codigoAValidar = inputPalet || scannedPaletData?.codigo
        if (!codigoAValidar) return

        setProcessingAction(true)
        try {
            const result = await MovilService.validar(codigoAValidar, "PDA_USER")
            toast.success(result.mensaje)

            // Actualizar estado local
            if (currentDoc && scannedPaletData) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === scannedPaletData.id ? { ...p, estado: "Validado" as const } : p
                )
                setCurrentDoc({ ...currentDoc, palets: updatedPalets })
            }

            setScannedPaletData(null)
            setInputPalet("")

            // Recargar órdenes
            await loadOrdenes(workMode)
        } catch (error: any) {
            toast.error(error.message || "Error al validar")
        } finally {
            setProcessingAction(false)
        }
    }

    const handleReport = () => {
        if (!scannedPaletData || !currentDoc) return
        const updatedPalets = currentDoc.palets.map(p =>
            p.id === scannedPaletData.id ? { ...p, estado: "Reportado" as const } : p
        )
        setCurrentDoc({ ...currentDoc, palets: updatedPalets })
        setScannedPaletData(null)
        setInputPalet("")
        toast.error("Item REPORTADO con incidencias")
    }

    const handleStore = async () => {
        if (!inputPalet && !scannedPaletData) {
            toast.error("Escanee un código primero")
            return
        }
        if (!inputLocation) {
            toast.error("Debe ingresar una ubicación")
            return
        }

        const codigoAAlmacenar = inputPalet || scannedPaletData?.codigo
        if (!codigoAAlmacenar) return

        setProcessingAction(true)
        try {
            const result = await MovilService.almacenar(codigoAAlmacenar, inputLocation, "PDA_USER")
            toast.success(result.mensaje)

            // Actualizar estado local
            if (currentDoc && scannedPaletData) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === scannedPaletData.id
                        ? { ...p, estado: "Almacenado" as const, ubicacion: inputLocation }
                        : p
                )
                setCurrentDoc({ ...currentDoc, palets: updatedPalets })
            }

            setScannedPaletData(null)
            setInputPalet("")
            setInputLocation("")

            // Recargar órdenes
            await loadOrdenes(workMode)
        } catch (error: any) {
            toast.error(error.message || "Error al almacenar")
        } finally {
            setProcessingAction(false)
        }
    }

    // --- MODAL HANDLERS ---
    const handleModalClose = () => {
        setShowEditModal(false)
    }

    const handleModalValidar = async (detalle: DetallePalet) => {
        setProcessingAction(true)
        try {
            const result = await MovilService.validar(detalle.codigo, "PDA_USER")
            toast.success(result.mensaje)

            // Actualizar estado local
            if (currentDoc) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === detalle.id ? { ...p, estado: "Validado" as const } : p
                )
                setCurrentDoc({ ...currentDoc, palets: updatedPalets })
            }

            setScannedPaletData(null)
            setInputPalet("")
            await loadOrdenes(workMode)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al validar"
            toast.error(errorMessage)
            throw error
        } finally {
            setProcessingAction(false)
        }
    }

    const handleModalAlmacenar = async (detalle: DetallePalet, ubicacion: string) => {
        setProcessingAction(true)
        try {
            const result = await MovilService.almacenar(detalle.codigo, ubicacion, "PDA_USER")
            toast.success(result.mensaje)

            // Actualizar estado local
            if (currentDoc) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === detalle.id
                        ? { ...p, estado: "Almacenado" as const, ubicacion }
                        : p
                )
                setCurrentDoc({ ...currentDoc, palets: updatedPalets })
            }

            setScannedPaletData(null)
            setInputPalet("")
            setInputLocation("")
            await loadOrdenes(workMode)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al almacenar"
            toast.error(errorMessage)
            throw error
        } finally {
            setProcessingAction(false)
        }
    }

    const handleModalActualizar = (detalle: DetallePalet, cambios: Partial<DetallePalet>) => {
        if (!currentDoc) return

        const updatedPalets = currentDoc.palets.map(p =>
            p.id === detalle.id ? { ...p, ...cambios } : p
        )
        setCurrentDoc({ ...currentDoc, palets: updatedPalets })

        // Actualizar también el detalle escaneado
        if (scannedPaletData && scannedPaletData.id === detalle.id) {
            setScannedPaletData({ ...scannedPaletData, ...cambios })
        }

        toast.success("Cambios guardados localmente")
    }

    // --- SCANNER LOGIC (ZEBRA / HARDWARE) ---
    const handleGlobalScan = (code: string) => {
        // console.log("Global Scan Detected:", code)
        toast.info(`Escaneado: ${code}`)

        if (step === "search") {
            setDocQuery(code)
            handleSearchDoc(code)
            return
        }

        if (step === "work") {
            // Heuristic: If we are in storage mode and code matches location format (e.g. A-01-...)
            const isLocation = /^[A-Z]-\d{2}-\d{2}/.test(code)

            if (workMode === "storage" && isLocation) {
                setInputLocation(code)
                // Optional: Auto-focus next field or trigger action if pallet is already set
                toast.success(`Ubicación establecida: ${code}`)
                return
            }

            // Otherwise assume it's a product/pallet
            setInputPalet(code)
            // We need to trigger the logic, but state updates are async. 
            // We can call a modified version of handleScanPalet that accepts the code directly
            handleScanPaletWithCode(code)
        }
    }

    useScanDetection({
        onComplete: handleGlobalScan,
        minLength: 3,
        ignoreIfFocusOn: ["input", "textarea"] // Let inputs handle scans when focused
    })

    // Helper to get expected quantity for an item
    const getExpectedQty = (itemCode: string): number => {
        const orden = ordenes.find(o => o.id.toString() === currentDoc?.id)
        if (!orden) return 0
        const detalle = orden.detalles.find(d => d.item.codigo === itemCode || d.item.codigoBarra === itemCode)
        return detalle?.cantidadEsperada || 0
    }

    // Helper for direct scanning - NOW COUNTS INSTEAD OF OPENING MODAL
    const handleScanPaletWithCode = (code: string) => {
        if (!currentDoc) return

        const found = currentDoc.palets.find(p =>
            p.codigo === code ||
            p.itemCode === code
        )

        if (found) {
            // Increment scan count for this item
            const itemKey = found.itemCode
            const currentCount = scanCounts[itemKey] || 0
            const expectedQty = getExpectedQty(itemKey) || Number(found.cantidad) || 1
            const newCount = currentCount + 1

            setScanCounts(prev => ({ ...prev, [itemKey]: newCount }))
            setScannedPaletData(found)
            setInputPalet(code)

            // Show progress toast
            if (newCount >= expectedQty) {
                toast.success(`✓ ${found.descripcion}: ${newCount}/${expectedQty} COMPLETO`)
            } else {
                toast.info(`${found.descripcion}: ${newCount}/${expectedQty}`)
            }
        } else {
            // Unknown code - open modal for more info
            const tempDetalle: DetallePalet = {
                id: "temp",
                codigo: code,
                itemCode: code,
                descripcion: "Código no reconocido",
                cantidad: 0,
                unidad: "UNID",
                estado: "Pendiente"
            }
            setScannedPaletData(tempDetalle)
            setShowEditModal(true)
            toast.warning("Código no está en esta orden")
        }
    }

    // Helper for Input KeyDown (Enter) -> Manual Entry or Focused Scan
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: "doc" | "palet" | "location") => {
        if (e.key === "Enter") {
            const val = e.currentTarget.value
            if (!val) return

            if (field === "doc") {
                handleSearchDoc(val)
            } else if (field === "palet") {
                handleScanPaletWithCode(val)
            } else if (field === "location") {
                // Just move focus or confirm
                // If we have both, maybe trigger store?
                if (inputPalet) {
                    // handleStore() // Optional auto-submit
                }
            }
        }
    }

    // --- CAMERA SCANNER LOGIC ---
    useEffect(() => {
        if (!isScanning) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
                scannerRef.current = null
            }
            return
        }

        const timer = setTimeout(() => {
            if (scannerRef.current) return

            try {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true
                    },
                    false
                )
                scannerRef.current = scanner

                scanner.render(
                    (decodedText) => {
                        // ... (existing camera logic)
                        if (activeScanField === "doc") {
                            setDocQuery(decodedText)
                            handleSearchDoc(decodedText)
                        }
                        if (activeScanField === "palet") {
                            setInputPalet(decodedText)
                            handleScanPaletWithCode(decodedText)
                        }
                        if (activeScanField === "location") {
                            setInputLocation(decodedText)
                        }

                        scanner.clear().catch(console.error)
                        scannerRef.current = null
                        setIsScanning(false)
                    },
                    (error) => { /* scanning */ }
                )
            } catch (e) {
                console.error("Error initializing scanner:", e)
                toast.error("No se pudo iniciar la cámara. Verifique permisos.")
                setIsScanning(false)
            }
        }, 100)

        return () => {
            clearTimeout(timer)
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
                scannerRef.current = null
            }
        }
    }, [isScanning, activeScanField])

    const startScanner = (field: "doc" | "palet" | "location") => {
        setActiveScanField(field)
        setIsScanning(true)
    }

    // --- RENDER HELPERS ---
    const getFilteredPalets = () => {
        if (!currentDoc) return []
        if (workMode === "validation") {
            return currentDoc.palets.filter(p => p.estado === "Pendiente")
        } else {
            return currentDoc.palets.filter(p => p.estado === "Validado")
        }
    }

    const renderScannerOverlay = () => (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden p-2">
                <div id="reader" className="w-full"></div>
            </div>
            <Button
                className="mt-6 bg-red-600 text-white font-bold px-8 h-12"
                onClick={() => setIsScanning(false)}
            >
                CANCELAR
            </Button>
        </div>
    )

    if (isScanning) return renderScannerOverlay()

    // --- SEARCH VIEW ---
    if (step === "search") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-6">
                <div className="text-center space-y-2">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <ScanBarcode className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Scanner WMS</h1>
                    <p className="text-slate-500">
                        {workMode === "validation"
                            ? "Órdenes pendientes de validar"
                            : "Órdenes pendientes de almacenar"}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant={workMode === "validation" ? "default" : "outline"}
                        onClick={() => setWorkMode("validation")}
                        className={cn(workMode === "validation" && "bg-orange-600 hover:bg-orange-700")}
                    >
                        Validar
                    </Button>
                    <Button
                        variant={workMode === "storage" ? "default" : "outline"}
                        onClick={() => setWorkMode("storage")}
                        className={cn(workMode === "storage" && "bg-orange-600 hover:bg-orange-700")}
                    >
                        Almacenar
                    </Button>
                </div>

                {/* Órdenes disponibles */}
                <Card className="w-full max-w-md shadow-lg border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : ordenes.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No hay órdenes {workMode === "validation" ? "por validar" : "por almacenar"}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">
                                    Seleccione o escanee documento ({ordenes.length} disponibles)
                                </label>
                                {ordenes.slice(0, 5).map(orden => (
                                    <button
                                        key={orden.id}
                                        className="w-full p-3 text-left bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                        onClick={() => {
                                            setCurrentDoc(mapOrdenToDocumento(orden))
                                            setStep("work")
                                        }}
                                    >
                                        <div className="font-mono font-bold">{orden.nroDocumento}</div>
                                        <div className="text-xs text-slate-500">
                                            {orden.detalles.length} items • {orden.almacen.descripcion}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <label className="text-sm font-medium">O buscar por número</label>
                            <div className="flex gap-2">
                                <Input
                                    value={docQuery}
                                    onChange={(e) => setDocQuery(e.target.value)}
                                    onKeyDown={(e) => handleInputKeyDown(e, "doc")}
                                    placeholder="Nro documento..."
                                    className="h-12 text-lg"
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 w-12 shrink-0 border-slate-300 text-slate-500 hover:text-primary hover:border-primary"
                                    onClick={() => {
                                        toast.info("Zebra Scanner activo: Presione el gatillo físico")
                                    }}
                                    title="Zebra Scanner (Hardware)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                        <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                                        <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                                        <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                                        <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                                        <path d="M7 7h10v10H7z" />
                                        <path d="M12 17v-6" />
                                    </svg>
                                </Button>
                                <Button
                                    className="h-12 w-12 shrink-0 bg-primary hover:bg-primary/90"
                                    onClick={() => startScanner("doc")}
                                    title="Cámara"
                                >
                                    <ScanBarcode className="w-6 h-6" />
                                </Button>
                            </div>
                            <Button
                                className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 font-bold"
                                onClick={() => handleSearchDoc()}
                                disabled={isLoading}
                            >
                                BUSCAR DOCUMENTO
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- WORK VIEW ---
    return (
        <>
            <div className="min-h-screen bg-slate-100 flex flex-col">
                {/* HEADER */}
                <div className="bg-slate-900 text-white px-4 py-3 shadow-md sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2" onClick={() => setStep("search")}>
                            <ArrowLeft className="w-5 h-5 text-slate-400 cursor-pointer" />
                            <h2 className="font-bold text-lg tracking-wide">
                                {workMode === "validation" ? "VALIDACIÓN" : "ALM. EN UBICACIONES"}
                            </h2>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant={workMode === "validation" ? "default" : "secondary"}
                                className={cn("h-7 text-xs", workMode === "validation" ? "bg-orange-600" : "bg-slate-700")}
                                onClick={() => { setWorkMode("validation"); setScannedPaletData(null); }}
                            >
                                Validar
                            </Button>
                            <Button
                                size="sm"
                                variant={workMode === "storage" ? "default" : "secondary"}
                                className={cn("h-7 text-xs", workMode === "storage" ? "bg-orange-600" : "bg-slate-700")}
                                onClick={() => { setWorkMode("storage"); setScannedPaletData(null); }}
                            >
                                Almacen
                            </Button>
                        </div>
                    </div>

                    {/* Doc Info */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 border-t border-slate-700 pt-2">
                        <div>
                            <span className="text-slate-500 block">Nro. Doc:</span>
                            <span className="text-white font-mono">{currentDoc?.nroDocumento}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Estado:</span>
                            <span className="text-orange-400">{currentDoc?.estadoGlobal}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-3 space-y-4 max-w-md mx-auto w-full">
                    {/* INPUT SECTIONS */}
                    <Card className="shadow-md border-0 bg-white">
                        <CardContent className="p-4 space-y-4">
                            {/* Location Input (Storage Mode) */}
                            {workMode === "storage" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">
                                        Lectura código ubicación
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <Input
                                                className="pl-10 h-12 text-lg border-orange-200 focus-visible:ring-orange-500"
                                                placeholder="Ej: A-01-01-01"
                                                value={inputLocation}
                                                onChange={(e) => setInputLocation(e.target.value)}
                                                onKeyDown={(e) => handleInputKeyDown(e, "location")}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-12 w-12 shrink-0 border-slate-300 text-slate-500 hover:text-orange-600 hover:border-orange-600"
                                            onClick={() => {
                                                toast.info("Zebra Scanner activo: Presione el gatillo físico")
                                            }}
                                            title="Zebra Scanner"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                                                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                                                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                                                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                                                <path d="M7 7h10v10H7z" />
                                                <path d="M12 17v-6" />
                                            </svg>
                                        </Button>
                                        <Button
                                            className="h-12 w-12 bg-orange-500 hover:bg-orange-600 shrink-0"
                                            onClick={() => startScanner("location")}
                                            title="Cámara"
                                        >
                                            <ScanBarcode className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Pallet/Item Input */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">
                                    {workMode === "validation" ? "Código de producto a validar" : "Código de producto"}
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <Input
                                            className="pl-10 h-12 text-lg border-blue-200 focus-visible:ring-blue-500 font-mono"
                                            placeholder="Escanear o escribir código..."
                                            value={inputPalet}
                                            onChange={(e) => setInputPalet(e.target.value)}
                                            onKeyDown={(e) => handleInputKeyDown(e, "palet")}
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 shrink-0 border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-600"
                                        onClick={() => {
                                            toast.info("Zebra Scanner activo: Presione el gatillo físico")
                                        }}
                                        title="Zebra Scanner"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                            <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                                            <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                                            <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                                            <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                                            <path d="M7 7h10v10H7z" />
                                            <path d="M12 17v-6" />
                                        </svg>
                                    </Button>

                                    <Button
                                        className={cn("h-12 w-12 shrink-0", inputPalet ? "bg-blue-600" : "bg-orange-500")}
                                        onClick={inputPalet && !scannedPaletData ? handleScanPalet : () => startScanner("palet")}
                                        title="Cámara"
                                    >
                                        {inputPalet && !scannedPaletData ? <Search className="w-6 h-6" /> : <ScanBarcode className="w-6 h-6" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Scanned Item Details */}
                            <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase">Item</div>
                                    <div className="font-bold text-sm truncate">{scannedPaletData?.itemCode || "-"}</div>
                                </div>
                                <div className="border-l border-slate-200 pl-2">
                                    <div className="text-[10px] text-slate-400 uppercase">Cant.</div>
                                    <div className="font-bold text-sm text-blue-600">{scannedPaletData?.cantidad || "-"}</div>
                                </div>
                                <div className="border-l border-slate-200 pl-2">
                                    <div className="text-[10px] text-slate-400 uppercase">Lote</div>
                                    <div className="font-bold text-sm">{scannedPaletData?.lote || "-"}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {workMode === "validation" ? (
                                    <>
                                        <Button
                                            variant="destructive"
                                            className="h-12 font-bold bg-red-600 hover:bg-red-700 shadow-sm"
                                            disabled={!inputPalet || processingAction}
                                            onClick={handleReport}
                                        >
                                            REPORTAR
                                        </Button>
                                        <Button
                                            className="h-12 font-bold bg-orange-500 hover:bg-orange-600 shadow-md text-white"
                                            disabled={!inputPalet || processingAction}
                                            onClick={handleValidate}
                                        >
                                            {processingAction ? <Loader2 className="animate-spin" /> : "VALIDAR"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="col-span-2 h-12 font-bold bg-orange-500 hover:bg-orange-600 shadow-md text-white"
                                        disabled={!inputPalet || !inputLocation || processingAction}
                                        onClick={handleStore}
                                    >
                                        {processingAction ? <Loader2 className="animate-spin" /> : "ALMACENAR"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card >

                    {/* LIST SECTION */}
                    < div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200" >
                        <button
                            className="w-full bg-slate-100 p-3 flex justify-between items-center text-sm font-semibold text-slate-700"
                            onClick={() => setShowPendingList(!showPendingList)}
                        >
                            <span>
                                {workMode === "validation" ? "Items Pendientes" : "Items por Almacenar"}
                                <Badge variant="secondary" className="ml-2 bg-white">{getFilteredPalets().length}</Badge>
                            </span>
                            {showPendingList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {
                            showPendingList && (
                                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                    {getFilteredPalets().length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">
                                            {workMode === "validation"
                                                ? "Todos los items han sido validados."
                                                : "No hay items validados pendientes de ubicación."}
                                        </div>
                                    ) : (
                                        getFilteredPalets().map((p) => (
                                            <div
                                                key={p.id}
                                                className="grid grid-cols-3 text-xs p-3 hover:bg-slate-50 cursor-pointer"
                                                onClick={() => {
                                                    setInputPalet(p.codigo)
                                                    setScannedPaletData(p)
                                                }}
                                            >
                                                <div className="font-semibold text-slate-600 flex items-center">
                                                    {workMode === "validation"
                                                        ? <span className="text-amber-600">{p.estado}</span>
                                                        : <span className="text-green-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</span>
                                                    }
                                                </div>
                                                <div className="truncate text-slate-500">{p.itemCode}</div>
                                                <div className="text-right font-mono font-medium text-slate-800">{p.cantidad}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )
                        }
                    </div >

                    {/* Finalize Button - visible when at least one scan */}
                    {Object.keys(scanCounts).length > 0 && (
                        <Button
                            className="w-full h-14 font-bold text-lg bg-green-600 hover:bg-green-700 shadow-lg text-white"
                            onClick={() => setShowConfirmModal(true)}
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            FINALIZAR INGRESO ({Object.values(scanCounts).reduce((a, b) => a + b, 0)} items)
                        </Button>
                    )}
                </div >
            </div >

            {/* Modal de edición de detalle */}
            < EditDetalleModal
                open={showEditModal}
                onClose={handleModalClose}
                detalle={scannedPaletData}
                modo={workMode}
                onValidar={handleModalValidar}
                onAlmacenar={handleModalAlmacenar}
                onActualizar={handleModalActualizar}
            />

            {/* Modal de confirmación de ingreso */}
            <ConfirmIngresoModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={async (observacion: string) => {
                    if (!currentDoc) return
                    // Build detalles array from scanCounts
                    const orden = ordenes.find(o => o.id.toString() === currentDoc.id)
                    if (!orden) return

                    const detallesPayload = orden.detalles.map(d => ({
                        detalleId: d.id,
                        cantidadRecibida: scanCounts[d.item.codigo] || 0,
                        ubicacion: 'SIN-UBICACION'
                    }))

                    await MovilService.confirmarIngreso(
                        Number(currentDoc.id),
                        detallesPayload,
                        observacion,
                        'MOBILE_USER'
                    )

                    toast.success('Ingreso confirmado. Stock actualizado.')
                    setScanCounts({})
                    setStep('search')
                    await loadOrdenes(workMode)
                }}
                nroDocumento={currentDoc?.nroDocumento || ''}
                detalles={
                    currentDoc?.palets.map(p => {
                        const orden = ordenes.find(o => o.id.toString() === currentDoc.id)
                        const detalle = orden?.detalles.find(d => d.item.codigo === p.itemCode)
                        return {
                            id: p.id,
                            itemCode: p.itemCode,
                            descripcion: p.descripcion,
                            cantidadEsperada: detalle?.cantidadEsperada || 0,
                            cantidadEscaneada: scanCounts[p.itemCode] || 0
                        }
                    }) || []
                }
            />
        </>
    )
}
