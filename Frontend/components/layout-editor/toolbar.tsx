"use client"

import type React from "react"

import { useLayoutStore, type ShapeType, type LayoutShape } from "@/lib/stores/layout-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  LayoutGrid,
  Square,
  DoorOpen,
  Building2,
  Trash2,
  Save,
  Upload,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"

const toolItems: { type: ShapeType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: "rack", icon: <LayoutGrid className="w-5 h-5" />, label: "Rack", color: "#3b82f6" },
  { type: "zone", icon: <Square className="w-5 h-5" />, label: "Zona", color: "#22c55e" },
  { type: "obstacle", icon: <Building2 className="w-5 h-5" />, label: "Obstáculo", color: "#ef4444" },
  { type: "access-point", icon: <DoorOpen className="w-5 h-5" />, label: "Acceso", color: "#a855f7" },
]

export function LayoutToolbar() {
  const { addShape, snapToGrid, setSnapToGrid, zoom, setZoom, clearLayout, shapes, setStagePosition } = useLayoutStore()

  const handleAddShape = (type: ShapeType) => {
    const tool = toolItems.find((t) => t.type === type)
    const newShape: LayoutShape = {
      id: `${type}-${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === "zone" ? 200 : type === "obstacle" ? 80 : 120,
      height: type === "zone" ? 150 : type === "obstacle" ? 80 : 80,
      rotation: 0,
      name: `${tool?.label || type} ${shapes.filter((s) => s.type === type).length + 1}`,
      color: tool?.color || "#3b82f6",
      levels: type === "rack" ? 3 : undefined,
      positionsPerLevel: type === "rack" ? 4 : undefined,
      zoneType: type === "zone" ? "storage" : undefined,
      obstacleType: type === "obstacle" ? "column" : undefined,
      accessType: type === "access-point" ? "loading" : undefined,
    }
    addShape(newShape)
  }

  const handleDragStart = (e: React.DragEvent, type: ShapeType) => {
    e.dataTransfer.setData("shapeType", type)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleSaveLayout = () => {
    const layoutJson = JSON.stringify(shapes, null, 2)
    const blob = new Blob([layoutJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "warehouse-layout.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadLayout = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string)
            useLayoutStore.getState().loadLayout(data)
          } catch (err) {
            console.error("Error loading layout:", err)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="w-16 lg:w-56 bg-card border-r border-border flex flex-col h-full shrink-0">
      <div className="p-2 lg:p-4 border-b border-border">
        <h3 className="text-xs lg:text-sm font-semibold text-foreground hidden lg:block">Herramientas</h3>
        <Grid3X3 className="w-5 h-5 text-muted-foreground lg:hidden mx-auto" />
      </div>

      {/* Tool items */}
      <div className="p-2 space-y-2 flex-1 overflow-y-auto">
        {toolItems.map((tool) => (
          <button
            key={tool.type}
            onClick={() => handleAddShape(tool.type)}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.type)}
            className="w-full flex items-center gap-2 p-2 lg:p-3 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing"
            style={{ borderLeftColor: tool.color, borderLeftWidth: 3 }}
          >
            <div style={{ color: tool.color }}>{tool.icon}</div>
            <span className="text-sm font-medium text-foreground hidden lg:block">{tool.label}</span>
          </button>
        ))}

        <Separator className="my-4" />

        {/* Zoom controls */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground hidden lg:block">Zoom: {Math.round(zoom * 100)}%</p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setZoom(zoom - 0.1)}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setZoom(zoom + 0.1)}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden lg:flex bg-transparent"
              onClick={() => {
                setZoom(1)
                setStagePosition({ x: 0, y: 0 })
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Grid snap toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="snap-grid" className="text-xs text-muted-foreground hidden lg:block">
            Snap a Grid
          </Label>
          <Grid3X3 className="w-4 h-4 text-muted-foreground lg:hidden" />
          <Switch id="snap-grid" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleSaveLayout}
        >
          <Save className="w-4 h-4" />
          <span className="hidden lg:block">Guardar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleLoadLayout}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden lg:block">Cargar</span>
        </Button>
        <Button variant="destructive" size="sm" className="w-full justify-start gap-2" onClick={clearLayout}>
          <Trash2 className="w-4 h-4" />
          <span className="hidden lg:block">Limpiar</span>
        </Button>
      </div>
    </div>
  )
}
