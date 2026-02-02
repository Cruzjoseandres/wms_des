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
    Loader2,
    Package
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MovilService } from "@/lib/api/movil.service"
import { EstadoDetalle, type OrdenMovil, type DetalleMovil } from "@/lib/models"
import { EditDetalleModal } from "@/components/ingresos/edit-detalle-modal"
import { ConfirmIngresoModal } from "@/components/ingresos/confirm-ingreso-modal"
import { useScanDetection } from "@/hooks/use-scan-detection"

// --- TYPES ---
interface DetallePalet {
    id: string
    detalleId: number // ID del backend para API calls
    codigo: string // LPN / Pallet ID o código de producto
    itemCode: string
    descripcion: string
    cantidad: number
    cantidadEsperada: number
    cantidadRecibida: number
    unidad: string
    estado: "Pendiente" | "Validado" | "Almacenado" | "Reportado"
    estadoBackend: EstadoDetalle
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
    resumen?: {
        totalDetalles: number
        pendientes: number
        validados: number
        almacenados: number
    }
}

// Helper para mapear estado del backend a string de UI
function getEstadoUI(estado: EstadoDetalle): "Pendiente" | "Validado" | "Almacenado" {
    switch (estado) {
        case EstadoDetalle.VALIDADO: return "Validado"
        case EstadoDetalle.ALMACENADO: return "Almacenado"
        default: return "Pendiente"
    }
}

// Helper para mapear órdenes del backend al formato del componente
function mapOrdenToDocumento(orden: OrdenMovil): DocumentoIngreso {
    const palets: DetallePalet[] = orden.detalles.map((d: DetalleMovil) => ({
        id: String(d.id),
        detalleId: d.id,
        codigo: d.item.codigoBarra || d.item.codigo,
        itemCode: d.item.codigo,
        descripcion: d.item.descripcion,
        cantidad: d.cantidad,
        cantidadEsperada: d.cantidadEsperada,
        cantidadRecibida: d.cantidadRecibida || 0,
        unidad: "UNID",
        estado: getEstadoUI(d.estado),
        estadoBackend: d.estado,
        lote: d.lote || undefined,
    }))

    // Determinar estado global basado en los detalles
    const pendientes = palets.filter(p => p.estadoBackend === EstadoDetalle.PENDIENTE).length
    const validados = palets.filter(p => p.estadoBackend === EstadoDetalle.VALIDADO).length
    const almacenados = palets.filter(p => p.estadoBackend === EstadoDetalle.ALMACENADO).length

    let estadoGlobal = "POR VALIDAR"
    if (almacenados === palets.length) {
        estadoGlobal = "COMPLETADO"
    } else if (validados > 0 || almacenados > 0) {
        estadoGlobal = "PARCIAL"
    }

    return {
        id: String(orden.id),
        nroDocumento: orden.nroDocumento,
        fecha: new Date(orden.createdAt).toLocaleString("es-ES"),
        tipoIngreso: orden.origen,
        estadoGlobal,
        palets,
        resumen: orden.resumen || {
            totalDetalles: palets.length,
            pendientes,
            validados,
            almacenados,
        }
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
    const loadOrdenes = async (mode: "validation" | "storage"): Promise<OrdenMovil[]> => {
        setIsLoading(true)
        try {
            const data = mode === "validation"
                ? await MovilService.getOrdenesPorValidar()
                : await MovilService.getOrdenesPorAlmacenar()
            setOrdenes(data)
            console.log(`Órdenes cargadas (${mode}):`, data)
            return data
        } catch (error) {
            console.error("Error cargando órdenes:", error)
            toast.error("Error al cargar órdenes")
            return []
        } finally {
            setIsLoading(false)
        }
    }

    // Helper para cambiar de modo y recargar datos
    const handleModeSwitch = async (newMode: "validation" | "storage") => {
        setWorkMode(newMode)
        setScannedPaletData(null)
        setInputPalet("")
        setScanCounts({})

        // Recargar órdenes para el nuevo modo
        const newOrdenes = await loadOrdenes(newMode)

        // Si hay documento actual, buscar su versión actualizada
        if (currentDoc) {
            const updatedOrden = newOrdenes.find(o => o.id.toString() === currentDoc.id)
            if (updatedOrden) {
                setCurrentDoc(mapOrdenToDocumento(updatedOrden))
            } else {
                // La orden ya no está en este modo (completado), preguntar qué hacer
                toast.info("El documento actual no tiene items pendientes en este modo")
            }
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

    const handleValidate = () => {
        // NEW: Just increment count instead of calling API
        const code = inputPalet || scannedPaletData?.codigo
        if (!code) {
            toast.error("Escanee un código primero")
            return
        }
        handleScanPaletWithCode(code)
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
    // These handlers use 'any' because EditDetalleModal has its own internal type
    const handleModalClose = () => {
        setShowEditModal(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleModalValidar = async (detalle: any) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleModalAlmacenar = async (detalle: any, ubicacion: string) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleModalActualizar = (detalle: any, cambios: any) => {
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

    // Helper to get expected quantity for an item
    const getExpectedQty = (itemCode: string): number => {
        const orden = ordenes.find(o => o.id.toString() === currentDoc?.id)
        if (!orden) return 0
        const detalle = orden.detalles.find(d => d.item.codigo === itemCode || d.item.codigoBarra === itemCode)
        return detalle?.cantidadEsperada || 0
    }

    // Helper to get detalle by code
    const getDetalleByCode = (code: string): DetallePalet | undefined => {
        return currentDoc?.palets.find(p =>
            p.codigo === code || p.itemCode === code
        )
    }

    // Handle individual product validation
    const handleValidarProducto = async (detalle: DetallePalet, cantidad: number) => {
        setProcessingAction(true)
        try {
            const result = await MovilService.validarDetalle(
                detalle.detalleId,
                cantidad,
                "MOBILE_USER"
            )

            toast.success(`✓ ${detalle.descripcion} validado (${cantidad} unidades)`)

            // Update local state
            if (currentDoc) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === detalle.id
                        ? { ...p, estado: "Validado" as const, estadoBackend: EstadoDetalle.VALIDADO, cantidadRecibida: cantidad }
                        : p
                )
                const validados = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.VALIDADO).length
                const almacenados = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.ALMACENADO).length
                const pendientes = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.PENDIENTE).length

                setCurrentDoc({
                    ...currentDoc,
                    palets: updatedPalets,
                    estadoGlobal: pendientes === 0 ? "VALIDADO" : "PARCIAL",
                    resumen: { totalDetalles: updatedPalets.length, pendientes, validados, almacenados }
                })
            }

            // Clear current selection
            setScannedPaletData(null)
            setInputPalet("")
            setScanCounts(prev => {
                const newCounts = { ...prev }
                delete newCounts[detalle.itemCode]
                return newCounts
            })

            // Reload data
            await loadOrdenes(workMode)

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al validar"
            toast.error(errorMessage)
        } finally {
            setProcessingAction(false)
        }
    }

    // Handle individual product storage
    const handleAlmacenarProducto = async (detalle: DetallePalet, ubicacion: string) => {
        setProcessingAction(true)
        try {
            const result = await MovilService.almacenarDetalle(
                detalle.detalleId,
                ubicacion,
                "MOBILE_USER"
            )

            toast.success(`✓ ${detalle.descripcion} almacenado en ${ubicacion}`)

            // Update local state
            if (currentDoc) {
                const updatedPalets = currentDoc.palets.map(p =>
                    p.id === detalle.id
                        ? { ...p, estado: "Almacenado" as const, estadoBackend: EstadoDetalle.ALMACENADO, ubicacion }
                        : p
                )
                const validados = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.VALIDADO).length
                const almacenados = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.ALMACENADO).length
                const pendientes = updatedPalets.filter(p => p.estadoBackend === EstadoDetalle.PENDIENTE).length

                setCurrentDoc({
                    ...currentDoc,
                    palets: updatedPalets,
                    estadoGlobal: almacenados === updatedPalets.length ? "COMPLETADO" : "PARCIAL",
                    resumen: { totalDetalles: updatedPalets.length, pendientes, validados, almacenados }
                })
            }

            // Clear inputs
            setScannedPaletData(null)
            setInputPalet("")
            setInputLocation("")

            // Reload data
            await loadOrdenes(workMode)

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al almacenar"
            toast.error(errorMessage)
        } finally {
            setProcessingAction(false)
        }
    }

    // Helper for direct scanning - Count and auto-validate when complete
    const handleScanPaletWithCode = async (code: string) => {
        if (!currentDoc) return

        console.log("[SCAN] Code received:", code)

        const found = getDetalleByCode(code)

        if (found) {
            // Check if already processed
            if (workMode === "validation" && found.estadoBackend !== EstadoDetalle.PENDIENTE) {
                toast.warning(`${found.descripcion} ya fue validado`)
                return
            }
            if (workMode === "storage" && found.estadoBackend !== EstadoDetalle.VALIDADO) {
                toast.warning(`${found.descripcion} no está listo para almacenar`)
                return
            }

            // Increment scan count for this item
            const itemKey = found.itemCode
            const currentCount = scanCounts[itemKey] || 0
            const expectedQty = found.cantidadEsperada || getExpectedQty(itemKey) || 1
            const newCount = currentCount + 1

            console.log("[SCAN] Incrementing count:", { itemKey, currentCount, newCount, expectedQty })

            setScanCounts(prev => ({ ...prev, [itemKey]: newCount }))
            setScannedPaletData(found)
            setInputPalet(code)

            // Show progress toast and auto-validate when complete
            if (newCount >= expectedQty) {
                toast.success(`✓ ${found.descripcion}: ${newCount}/${expectedQty} COMPLETO`)

                // Auto-validate if in validation mode
                if (workMode === "validation") {
                    await handleValidarProducto(found, newCount)
                }
            } else {
                toast.info(`${found.descripcion}: ${newCount}/${expectedQty}`)
            }
        } else {
            // Unknown code - open modal for more info
            console.log("[SCAN] Code not found, opening modal")
            const tempDetalle: DetallePalet = {
                id: "temp",
                detalleId: 0,
                codigo: code,
                itemCode: code,
                descripcion: "Código no reconocido",
                cantidad: 0,
                cantidadEsperada: 0,
                cantidadRecibida: 0,
                unidad: "UNID",
                estado: "Pendiente",
                estadoBackend: EstadoDetalle.PENDIENTE
            }
            setScannedPaletData(tempDetalle)
            setShowEditModal(true)
            toast.warning("Código no está en esta orden")
        }
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
            // En modo validación: mostrar pendientes
            return currentDoc.palets.filter(p =>
                p.estadoBackend === EstadoDetalle.PENDIENTE || p.estado === "Pendiente"
            )
        } else {
            // En modo almacenaje: mostrar validados (listos para almacenar)
            return currentDoc.palets.filter(p =>
                p.estadoBackend === EstadoDetalle.VALIDADO || p.estado === "Validado"
            )
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
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-start p-4 pt-12 space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                        <ScanBarcode className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Scanner WMS</h1>
                    <p className="text-slate-400 text-sm">
                        {workMode === "validation"
                            ? "Validación de productos"
                            : "Almacenamiento en ubicaciones"}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
                    <Button
                        variant="ghost"
                        onClick={() => setWorkMode("validation")}
                        className={cn(
                            "px-6 h-10 rounded-lg transition-all",
                            workMode === "validation"
                                ? "bg-orange-600 text-white hover:bg-orange-600"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                        )}
                    >
                        Validar
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setWorkMode("storage")}
                        className={cn(
                            "px-6 h-10 rounded-lg transition-all",
                            workMode === "storage"
                                ? "bg-orange-600 text-white hover:bg-orange-600"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                        )}
                    >
                        Almacenar
                    </Button>
                </div>

                {/* Zebra Scanner Active Indicator */}
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-xs font-medium">Escáner Zebra Activo</span>
                </div>

                {/* Órdenes disponibles */}
                <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 shadow-xl">
                    <CardContent className="pt-6 space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                <span className="text-slate-400 text-sm">Cargando órdenes...</span>
                            </div>
                        ) : ordenes.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                                    <Box className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400">
                                    No hay órdenes {workMode === "validation" ? "por validar" : "por almacenar"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-300">
                                        Órdenes disponibles
                                    </label>
                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                        {ordenes.length}
                                    </Badge>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {ordenes.slice(0, 5).map(orden => (
                                        <button
                                            key={orden.id}
                                            className="w-full p-3 text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-orange-500/50 rounded-xl transition-all group"
                                            onClick={() => {
                                                setCurrentDoc(mapOrdenToDocumento(orden))
                                                setStep("work")
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-white group-hover:text-orange-400 transition-colors">
                                                    {orden.nroDocumento}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90" />
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {orden.detalles.length} items • {orden.almacen.descripcion}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-700 pt-4 space-y-3">
                            <label className="text-sm font-medium text-slate-300">Buscar por número</label>
                            <div className="flex gap-2">
                                <Input
                                    value={docQuery}
                                    onChange={(e) => setDocQuery(e.target.value)}
                                    onKeyDown={(e) => handleInputKeyDown(e, "doc")}
                                    placeholder="Nro documento..."
                                    className="h-12 text-lg bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                                />
                                <Button
                                    className="h-12 w-12 shrink-0 bg-orange-600 hover:bg-orange-700"
                                    onClick={() => startScanner("doc")}
                                    title="Cámara"
                                >
                                    <ScanBarcode className="w-6 h-6" />
                                </Button>
                            </div>
                            <Button
                                className="w-full h-12 text-base bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 font-semibold shadow-lg shadow-orange-500/20"
                                onClick={() => handleSearchDoc()}
                                disabled={isLoading}
                            >
                                <Search className="w-5 h-5 mr-2" />
                                BUSCAR DOCUMENTO
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer hint */}
                <p className="text-slate-500 text-xs text-center max-w-xs">
                    Escanea el código de barras del documento o selecciona uno de la lista
                </p>
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
                                onClick={() => handleModeSwitch("validation")}
                            >
                                Validar
                            </Button>
                            <Button
                                size="sm"
                                variant={workMode === "storage" ? "default" : "secondary"}
                                className={cn("h-7 text-xs", workMode === "storage" ? "bg-orange-600" : "bg-slate-700")}
                                onClick={() => handleModeSwitch("storage")}
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
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                        <span>📍 Escanear ubicación</span>
                                        {inputLocation && (
                                            <span className="text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded text-xs">
                                                {inputLocation}
                                            </span>
                                        )}
                                    </label>

                                    {/* Zebra Scanner for Location */}
                                    <div
                                        className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl p-3 shadow-lg border border-orange-400/30 cursor-pointer hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 transition-all duration-200"
                                        onClick={() => toast.info("Escanee la etiqueta de ubicación con el Zebra")}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/20 rounded-lg p-2.5 backdrop-blur-sm">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-semibold">Escanear Ubicación</div>
                                                <div className="text-orange-200 text-xs">Apunte a la etiqueta del rack</div>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-green-400 opacity-50"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Input */}
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📍</span>
                                            <Input
                                                className="pl-9 h-10 text-base border-slate-200 focus-visible:ring-orange-500 font-mono bg-slate-50"
                                                placeholder="Ej: A-01-01-01"
                                                value={inputLocation}
                                                onChange={(e) => setInputLocation(e.target.value)}
                                                onKeyDown={(e) => handleInputKeyDown(e, "location")}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-10 px-3 shrink-0 border-slate-300 text-slate-600 hover:text-orange-600 hover:border-orange-500 hover:bg-orange-50"
                                            onClick={() => startScanner("location")}
                                            title="Cámara"
                                        >
                                            <ScanBarcode className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Pallet/Item Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        {workMode === "validation" ? "Escanear producto" : "Código de producto"}
                                    </label>
                                    {/* Zebra Status Indicator */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                        </span>
                                        <span className="text-green-600 font-medium">Zebra Activo</span>
                                    </div>
                                </div>

                                {/* Zebra Scanner Primary Button */}
                                <div
                                    className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-4 shadow-lg border border-blue-500/30 cursor-pointer hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-200"
                                    onClick={() => toast.info("Escáner Zebra listo - Presione el gatillo del dispositivo")}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Scanner Icon */}
                                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white">
                                                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                                                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                                                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                                                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                                                <path d="M7 8h10" />
                                                <path d="M7 12h10" />
                                                <path d="M7 16h6" />
                                            </svg>
                                        </div>
                                        {/* Text Content */}
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-lg">Escáner Zebra</div>
                                            <div className="text-blue-200 text-sm">Presione el gatillo para escanear</div>
                                        </div>
                                        {/* Active Indicator */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="relative">
                                                <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-green-400 opacity-50"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                                            </div>
                                            <span className="text-[10px] text-green-300 font-medium uppercase">Listo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Input Methods */}
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input
                                            className="pl-9 h-11 text-base border-slate-200 focus-visible:ring-blue-500 font-mono bg-slate-50"
                                            placeholder="O ingrese código manual..."
                                            value={inputPalet}
                                            onChange={(e) => setInputPalet(e.target.value)}
                                            onKeyDown={(e) => handleInputKeyDown(e, "palet")}
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="h-11 px-3 shrink-0 border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50"
                                        onClick={inputPalet && !scannedPaletData ? handleScanPalet : () => startScanner("palet")}
                                        title={inputPalet ? "Buscar" : "Cámara"}
                                    >
                                        {inputPalet && !scannedPaletData ? (
                                            <Search className="w-5 h-5" />
                                        ) : (
                                            <ScanBarcode className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Scanned Item Details - Enhanced Card */}
                            {scannedPaletData ? (
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                                    {/* Product Info Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">Producto seleccionado</div>
                                            <div className="font-bold text-lg text-slate-800">{scannedPaletData.descripcion || scannedPaletData.itemCode}</div>
                                            <div className="text-sm text-slate-500 font-mono">{scannedPaletData.itemCode}</div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                            scannedPaletData.estado === "Validado" ? "bg-green-100 text-green-700" :
                                                scannedPaletData.estado === "Almacenado" ? "bg-blue-100 text-blue-700" :
                                                    "bg-orange-100 text-orange-700"
                                        )}>
                                            {scannedPaletData.estado}
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Progreso de escaneo</span>
                                            <span className="font-bold text-slate-800">
                                                {scanCounts[scannedPaletData.itemCode] || 0} / {scannedPaletData.cantidadEsperada}
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-300",
                                                    (scanCounts[scannedPaletData.itemCode] || 0) >= scannedPaletData.cantidadEsperada
                                                        ? "bg-gradient-to-r from-green-500 to-green-400"
                                                        : "bg-gradient-to-r from-blue-500 to-blue-400"
                                                )}
                                                style={{
                                                    width: `${Math.min(100, ((scanCounts[scannedPaletData.itemCode] || 0) / scannedPaletData.cantidadEsperada) * 100)}%`
                                                }}
                                            />
                                        </div>
                                        {(scanCounts[scannedPaletData.itemCode] || 0) >= scannedPaletData.cantidadEsperada && (
                                            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Cantidad completa - Listo para validar</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-700">{scannedPaletData.cantidadEsperada}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">Esperado</div>
                                        </div>
                                        <div className="text-center border-x border-slate-200">
                                            <div className="text-2xl font-bold text-blue-600">{scanCounts[scannedPaletData.itemCode] || 0}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">Escaneado</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-2xl font-bold",
                                                (scannedPaletData.cantidadEsperada - (scanCounts[scannedPaletData.itemCode] || 0)) <= 0
                                                    ? "text-green-600" : "text-orange-500"
                                            )}>
                                                {Math.max(0, scannedPaletData.cantidadEsperada - (scanCounts[scannedPaletData.itemCode] || 0))}
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase">Faltante</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-6 border border-dashed border-slate-300 text-center">
                                    <Box className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <div className="text-slate-500 text-sm">Escanee un producto para comenzar</div>
                                    <div className="text-slate-400 text-xs mt-1">Use el escáner Zebra o la cámara</div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                {workMode === "validation" ? (
                                    <>
                                        {/* Validate Button */}
                                        {scannedPaletData && scannedPaletData.estadoBackend === EstadoDetalle.PENDIENTE && (
                                            <Button
                                                className={cn(
                                                    "w-full h-14 font-bold shadow-lg text-white transition-all",
                                                    (scanCounts[scannedPaletData.itemCode] || 0) >= scannedPaletData.cantidadEsperada
                                                        ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 ring-2 ring-green-300 ring-offset-2 animate-pulse"
                                                        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                                                )}
                                                disabled={!inputPalet || processingAction || (scanCounts[scannedPaletData?.itemCode || ""] || 0) === 0}
                                                onClick={() => {
                                                    const count = scanCounts[scannedPaletData.itemCode] || 0
                                                    if (count > 0) {
                                                        handleValidarProducto(scannedPaletData, count)
                                                    } else {
                                                        toast.warning("Escanee al menos un producto primero")
                                                    }
                                                }}
                                            >
                                                {processingAction ? <Loader2 className="animate-spin" /> : (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                        <span>VALIDAR ({scanCounts[scannedPaletData?.itemCode || ""] || 0} unidades)</span>
                                                    </div>
                                                )}
                                            </Button>
                                        )}
                                        {/* Report Incident Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 font-medium border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                            disabled={!inputPalet || processingAction}
                                            onClick={handleReport}
                                        >
                                            <span className="text-red-500">⚠️</span>
                                            <span className="ml-2">Reportar Incidencia</span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full h-12 font-bold bg-orange-500 hover:bg-orange-600 shadow-md text-white"
                                        disabled={!scannedPaletData || !inputLocation || processingAction}
                                        onClick={() => {
                                            if (scannedPaletData && inputLocation) {
                                                handleAlmacenarProducto(scannedPaletData, inputLocation)
                                            }
                                        }}
                                    >
                                        {processingAction ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <Package className="w-5 h-5 mr-2" />
                                                ALMACENAR EN {inputLocation || "..."}                                            </>
                                        )}
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
