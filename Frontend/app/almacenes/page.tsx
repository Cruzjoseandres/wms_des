"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIngresosStore } from "@/lib/stores/ingresos-store"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Warehouse, Snowflake, Package, AlertCircle, Loader2, ArrowRight } from "lucide-react"

interface Almacen {
  id: string
  nombre: string
  ubicacion: string
  tipo: "distribucion" | "refrigerado" | "general" | "especial"
  capacidad: number
  ocupacion: number
  icon: React.ReactNode
}

const almacenes: Almacen[] = [
  {
    id: "001",
    nombre: "Centro de Distribución Principal",
    ubicacion: "Zona Industrial Sur",
    tipo: "distribucion",
    capacidad: 5000,
    ocupacion: 3400,
    icon: <Warehouse className="w-8 h-8" />,
  },
  {
    id: "002",
    nombre: "Almacén Refrigerado",
    ubicacion: "Zona Industrial Sur",
    tipo: "refrigerado",
    capacidad: 1000,
    ocupacion: 780,
    icon: <Snowflake className="w-8 h-8" />,
  },
  {
    id: "003",
    nombre: "Bodega de Productos",
    ubicacion: "Centro",
    tipo: "general",
    capacidad: 2000,
    ocupacion: 1200,
    icon: <Package className="w-8 h-8" />,
  },
  {
    id: "004",
    nombre: "Almacén Especial",
    ubicacion: "Zona Industrial Norte",
    tipo: "especial",
    capacidad: 500,
    ocupacion: 150,
    icon: <AlertCircle className="w-8 h-8" />,
  },
]

export default function AlmacenesPage() {
  const router = useRouter()
  const setSelectedAlmacen = useIngresosStore((s) => s.setSelectedAlmacen)
  const { isAuthenticated } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleSelectAlmacen = (almacenId: string) => {
    setIsLoading(true)
    setSelectedId(almacenId)
    setTimeout(() => {
      setSelectedAlmacen(almacenId)
      router.push("/ingresos")
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative w-full min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Seleccionar Almacén</h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Elige el almacén en el que deseas trabajar. Los datos están completamente aislados por almacén.
            </p>
          </div>
        </div>

        {/* Almacenes Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto w-full">
          {almacenes.map((almacen) => {
            const porcentaje = Math.round((almacen.ocupacion / almacen.capacidad) * 100)
            const disponible = almacen.capacidad - almacen.ocupacion
            const isSelected = selectedId === almacen.id

            return (
              <Card
                key={almacen.id}
                className={`bg-slate-800/50 border-slate-700/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer group overflow-hidden backdrop-blur-sm ${
                  isSelected ? "border-orange-500 shadow-lg shadow-orange-500/20" : ""
                }`}
                onClick={() => handleSelectAlmacen(almacen.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {almacen.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-white truncate">{almacen.nombre}</CardTitle>
                        <CardDescription className="text-xs text-slate-400 truncate">
                          {almacen.ubicacion}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Ocupación</span>
                      <span className="font-semibold text-white">{porcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          porcentaje > 90 ? "bg-red-500" : porcentaje > 70 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2.5 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <p className="text-slate-400 text-xs font-medium">Usado</p>
                      <p className="font-bold text-lg text-white">{almacen.ocupacion}</p>
                    </div>
                    <div className="p-2.5 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <p className="text-slate-400 text-xs font-medium">Disponible</p>
                      <p className="font-bold text-lg text-white">{disponible}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectAlmacen(almacen.id)}
                    disabled={isSelected}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all group/btn"
                  >
                    {isSelected ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Acceder
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          © 2025 SGLA WMS - Soluciones Logísticas Integrales
        </div>
      </div>
    </div>
  )
}
