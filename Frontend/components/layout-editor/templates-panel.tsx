"use client"

import type React from "react"

import { useState } from "react"
import { useLayoutStore, type LayoutShape } from "@/lib/stores/layout-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { LayoutTemplate, Warehouse, Package, Grid3X3, Store, AlertTriangle } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  shapes: LayoutShape[]
  stats: {
    racks: number
    zones: number
    positions: number
  }
}

const templates: Template[] = [
  {
    id: "small-warehouse",
    name: "Almacén Pequeño",
    description: "Ideal para bodegas de 200-500m², con 2 zonas y 6 racks",
    icon: <Package className="w-5 h-5" />,
    stats: { racks: 6, zones: 2, positions: 72 },
    shapes: [
      // Reception zone
      {
        id: "zone-1",
        type: "zone",
        x: 20,
        y: 20,
        width: 180,
        height: 100,
        rotation: 0,
        name: "Recepción",
        color: "#22c55e",
        zoneType: "reception",
      },
      // Shipping zone
      {
        id: "zone-2",
        type: "zone",
        x: 20,
        y: 280,
        width: 180,
        height: 100,
        rotation: 0,
        name: "Despacho",
        color: "#22c55e",
        zoneType: "shipping",
      },
      // Racks row 1
      {
        id: "rack-1",
        type: "rack",
        x: 240,
        y: 20,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack A1",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-2",
        type: "rack",
        x: 360,
        y: 20,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack A2",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-3",
        type: "rack",
        x: 480,
        y: 20,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack A3",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      // Racks row 2
      {
        id: "rack-4",
        type: "rack",
        x: 240,
        y: 120,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack B1",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-5",
        type: "rack",
        x: 360,
        y: 120,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack B2",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-6",
        type: "rack",
        x: 480,
        y: 120,
        width: 100,
        height: 60,
        rotation: 0,
        name: "Rack B3",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      // Access points
      {
        id: "access-1",
        type: "access-point",
        x: 20,
        y: 180,
        width: 60,
        height: 60,
        rotation: 0,
        name: "Entrada",
        color: "#a855f7",
        accessType: "loading",
      },
    ],
  },
  {
    id: "medium-warehouse",
    name: "Almacén Mediano",
    description: "Para bodegas de 500-1500m², con múltiples zonas y pasillos",
    icon: <Warehouse className="w-5 h-5" />,
    stats: { racks: 12, zones: 4, positions: 192 },
    shapes: [
      // Reception zone
      {
        id: "zone-1",
        type: "zone",
        x: 20,
        y: 20,
        width: 200,
        height: 120,
        rotation: 0,
        name: "Recepción",
        color: "#22c55e",
        zoneType: "reception",
      },
      // Buffer zone
      {
        id: "zone-2",
        type: "zone",
        x: 20,
        y: 160,
        width: 200,
        height: 80,
        rotation: 0,
        name: "Buffer",
        color: "#f59e0b",
        zoneType: "buffer",
      },
      // Shipping zone
      {
        id: "zone-3",
        type: "zone",
        x: 20,
        y: 260,
        width: 200,
        height: 120,
        rotation: 0,
        name: "Despacho",
        color: "#22c55e",
        zoneType: "shipping",
      },
      // Storage zone label
      {
        id: "zone-4",
        type: "zone",
        x: 260,
        y: 20,
        width: 480,
        height: 360,
        rotation: 0,
        name: "Zona de Almacenaje",
        color: "#0ea5e9",
        zoneType: "storage",
      },
      // Racks - Column A
      {
        id: "rack-1",
        type: "rack",
        x: 280,
        y: 40,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack A1",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-2",
        type: "rack",
        x: 280,
        y: 130,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack A2",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-3",
        type: "rack",
        x: 280,
        y: 220,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack A3",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-4",
        type: "rack",
        x: 280,
        y: 310,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack A4",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      // Racks - Column B
      {
        id: "rack-5",
        type: "rack",
        x: 420,
        y: 40,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack B1",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-6",
        type: "rack",
        x: 420,
        y: 130,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack B2",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-7",
        type: "rack",
        x: 420,
        y: 220,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack B3",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-8",
        type: "rack",
        x: 420,
        y: 310,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack B4",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      // Racks - Column C
      {
        id: "rack-9",
        type: "rack",
        x: 560,
        y: 40,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack C1",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-10",
        type: "rack",
        x: 560,
        y: 130,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack C2",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-11",
        type: "rack",
        x: 560,
        y: 220,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack C3",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      {
        id: "rack-12",
        type: "rack",
        x: 560,
        y: 310,
        width: 100,
        height: 70,
        rotation: 0,
        name: "Rack C4",
        color: "#3b82f6",
        levels: 4,
        positionsPerLevel: 4,
      },
      // Obstacles (columns)
      {
        id: "obs-1",
        type: "obstacle",
        x: 700,
        y: 100,
        width: 40,
        height: 40,
        rotation: 0,
        name: "Columna 1",
        color: "#ef4444",
        obstacleType: "column",
      },
      {
        id: "obs-2",
        type: "obstacle",
        x: 700,
        y: 260,
        width: 40,
        height: 40,
        rotation: 0,
        name: "Columna 2",
        color: "#ef4444",
        obstacleType: "column",
      },
      // Access points
      {
        id: "access-1",
        type: "access-point",
        x: 100,
        y: 400,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Andén 1",
        color: "#a855f7",
        accessType: "loading",
      },
      {
        id: "access-2",
        type: "access-point",
        x: 700,
        y: 180,
        width: 50,
        height: 60,
        rotation: 0,
        name: "Emergencia",
        color: "#dc2626",
        accessType: "emergency",
      },
    ],
  },
  {
    id: "retail-store",
    name: "Tienda Retail",
    description: "Layout para tienda con área de ventas y bodega trasera",
    icon: <Store className="w-5 h-5" />,
    stats: { racks: 8, zones: 3, positions: 64 },
    shapes: [
      // Sales floor
      {
        id: "zone-1",
        type: "zone",
        x: 20,
        y: 20,
        width: 400,
        height: 200,
        rotation: 0,
        name: "Área de Ventas",
        color: "#0ea5e9",
        zoneType: "storage",
      },
      // Back storage
      {
        id: "zone-2",
        type: "zone",
        x: 20,
        y: 240,
        width: 300,
        height: 140,
        rotation: 0,
        name: "Bodega",
        color: "#22c55e",
        zoneType: "storage",
      },
      // Receiving area
      {
        id: "zone-3",
        type: "zone",
        x: 340,
        y: 240,
        width: 150,
        height: 140,
        rotation: 0,
        name: "Recepción",
        color: "#f59e0b",
        zoneType: "reception",
      },
      // Display racks in sales area
      {
        id: "rack-1",
        type: "rack",
        x: 40,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Góndola 1",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-2",
        type: "rack",
        x: 140,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Góndola 2",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-3",
        type: "rack",
        x: 240,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Góndola 3",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-4",
        type: "rack",
        x: 340,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Góndola 4",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      // Back storage racks
      {
        id: "rack-5",
        type: "rack",
        x: 40,
        y: 260,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Estante A",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-6",
        type: "rack",
        x: 140,
        y: 260,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Estante B",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-7",
        type: "rack",
        x: 40,
        y: 330,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Estante C",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      {
        id: "rack-8",
        type: "rack",
        x: 140,
        y: 330,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Estante D",
        color: "#3b82f6",
        levels: 2,
        positionsPerLevel: 4,
      },
      // Counter
      {
        id: "obs-1",
        type: "obstacle",
        x: 40,
        y: 150,
        width: 160,
        height: 40,
        rotation: 0,
        name: "Mostrador",
        color: "#6b7280",
        obstacleType: "office",
      },
      // Access
      {
        id: "access-1",
        type: "access-point",
        x: 440,
        y: 280,
        width: 50,
        height: 80,
        rotation: 0,
        name: "Puerta Trasera",
        color: "#a855f7",
        accessType: "loading",
      },
    ],
  },
  {
    id: "cold-storage",
    name: "Cámara Frigorífica",
    description: "Layout optimizado para almacenamiento en frío con zonas de temperatura",
    icon: <Grid3X3 className="w-5 h-5" />,
    stats: { racks: 10, zones: 3, positions: 120 },
    shapes: [
      // Antechamber
      {
        id: "zone-1",
        type: "zone",
        x: 20,
        y: 20,
        width: 120,
        height: 280,
        rotation: 0,
        name: "Antecámara",
        color: "#0ea5e9",
        zoneType: "buffer",
      },
      // Cold zone 1
      {
        id: "zone-2",
        type: "zone",
        x: 160,
        y: 20,
        width: 280,
        height: 130,
        rotation: 0,
        name: "Zona Fría (-5°C)",
        color: "#06b6d4",
        zoneType: "storage",
      },
      // Cold zone 2
      {
        id: "zone-3",
        type: "zone",
        x: 160,
        y: 170,
        width: 280,
        height: 130,
        rotation: 0,
        name: "Zona Congelados (-20°C)",
        color: "#3b82f6",
        zoneType: "storage",
      },
      // Racks in cold zone 1
      {
        id: "rack-1",
        type: "rack",
        x: 180,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack F1",
        color: "#06b6d4",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-2",
        type: "rack",
        x: 280,
        y: 40,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack F2",
        color: "#06b6d4",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-3",
        type: "rack",
        x: 180,
        y: 100,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack F3",
        color: "#06b6d4",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-4",
        type: "rack",
        x: 280,
        y: 100,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack F4",
        color: "#06b6d4",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-5",
        type: "rack",
        x: 380,
        y: 40,
        width: 80,
        height: 110,
        rotation: 0,
        name: "Rack F5",
        color: "#06b6d4",
        levels: 3,
        positionsPerLevel: 4,
      },
      // Racks in frozen zone
      {
        id: "rack-6",
        type: "rack",
        x: 180,
        y: 190,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack C1",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-7",
        type: "rack",
        x: 280,
        y: 190,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack C2",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-8",
        type: "rack",
        x: 180,
        y: 250,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack C3",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-9",
        type: "rack",
        x: 280,
        y: 250,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Rack C4",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      {
        id: "rack-10",
        type: "rack",
        x: 380,
        y: 190,
        width: 80,
        height: 110,
        rotation: 0,
        name: "Rack C5",
        color: "#3b82f6",
        levels: 3,
        positionsPerLevel: 4,
      },
      // Access
      {
        id: "access-1",
        type: "access-point",
        x: 40,
        y: 320,
        width: 80,
        height: 50,
        rotation: 0,
        name: "Andén Refrigerado",
        color: "#a855f7",
        accessType: "loading",
      },
    ],
  },
]

export function TemplatesPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { shapes, loadLayout, clearLayout } = useLayoutStore()

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    if (shapes.length > 0) {
      setConfirmOpen(true)
    } else {
      applyTemplate(template)
    }
  }

  const applyTemplate = (template: Template) => {
    clearLayout()
    // Add unique IDs to avoid conflicts
    const shapesWithNewIds = template.shapes.map((shape) => ({
      ...shape,
      id: `${shape.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }))
    loadLayout(shapesWithNewIds)
    setConfirmOpen(false)
    setSelectedTemplate(null)
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            Plantillas Prediseñadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="flex flex-col items-start p-3 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-2 mb-2 w-full">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{template.name}</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {template.stats.racks} racks
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {template.stats.zones} zonas
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.stats.positions} pos.
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Reemplazar diseño actual
            </DialogTitle>
            <DialogDescription>
              Ya tienes {shapes.length} elementos en tu diseño. Al aplicar la plantilla "{selectedTemplate?.name}" se
              reemplazará todo el contenido actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="default" onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}>
              Aplicar Plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
