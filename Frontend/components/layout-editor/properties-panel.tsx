"use client"

import { useLayoutStore } from "@/lib/stores/layout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X, Trash2, Cog, Copy, Ruler } from "lucide-react"
import { useState } from "react"

export function PropertiesPanel() {
  const { shapes, selectedShapeId, updateShape, deleteShape, selectShape, pixelsToMeters } = useLayoutStore()
  const selectedShape = shapes.find((s) => s.id === selectedShapeId)
  const [generatingLocations, setGeneratingLocations] = useState(false)
  const [locationsGenerated, setLocationsGenerated] = useState(0)

  if (!selectedShape) {
    return (
      <div className="w-64 bg-card border-l border-border p-4 hidden lg:flex flex-col items-center justify-center text-center h-full">
        <Cog className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Selecciona un elemento del lienzo para ver sus propiedades</p>
      </div>
    )
  }

  const handleGenerateLocations = () => {
    if (selectedShape.type !== "rack") return
    setGeneratingLocations(true)

    const totalLocations = (selectedShape.levels || 1) * (selectedShape.positionsPerLevel || 1)
    let generated = 0

    const interval = setInterval(() => {
      generated++
      setLocationsGenerated(generated)
      if (generated >= totalLocations) {
        clearInterval(interval)
        setGeneratingLocations(false)
        setTimeout(() => setLocationsGenerated(0), 3000)
      }
    }, 100)
  }

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Propiedades</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => selectShape(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic info */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              Nombre/Código
            </Label>
            <Input
              id="name"
              value={selectedShape.name}
              onChange={(e) => updateShape(selectedShape.id, { name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <p className="text-sm font-medium capitalize mt-1">
              {selectedShape.type === "rack"
                ? "Rack/Estantería"
                : selectedShape.type === "zone"
                  ? "Zona de Suelo"
                  : selectedShape.type === "obstacle"
                    ? "Obstáculo"
                    : "Punto de Acceso"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase">Dimensiones Mundo Real</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 bg-primary/10 rounded-lg">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Ancho</p>
              <p className="text-lg font-bold text-primary">{selectedShape.realWorldWidth?.toFixed(2) || "0"} m</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Alto</p>
              <p className="text-lg font-bold text-primary">{selectedShape.realWorldHeight?.toFixed(2) || "0"} m</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Escala: 50px = 1 metro (para cálculos de capacidad)
          </p>
        </div>

        <Separator />

        {/* Dimensions */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase">Dimensiones Canvas (píxeles)</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-xs text-muted-foreground">
                Ancho
              </Label>
              <Input
                id="width"
                type="number"
                value={selectedShape.width}
                onChange={(e) => updateShape(selectedShape.id, { width: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-muted-foreground">
                Alto
              </Label>
              <Input
                id="height"
                type="number"
                value={selectedShape.height}
                onChange={(e) => updateShape(selectedShape.id, { height: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x" className="text-xs text-muted-foreground">
                Posición X
              </Label>
              <Input
                id="x"
                type="number"
                value={Math.round(selectedShape.x)}
                onChange={(e) => updateShape(selectedShape.id, { x: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="y" className="text-xs text-muted-foreground">
                Posición Y
              </Label>
              <Input
                id="y"
                type="number"
                value={Math.round(selectedShape.y)}
                onChange={(e) => updateShape(selectedShape.id, { y: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Color */}
        <div>
          <Label htmlFor="color" className="text-xs text-muted-foreground">
            Color
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="color"
              type="color"
              value={selectedShape.color}
              onChange={(e) => updateShape(selectedShape.id, { color: e.target.value })}
              className="w-12 h-9 p-1"
            />
            <Input
              value={selectedShape.color}
              onChange={(e) => updateShape(selectedShape.id, { color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        {/* Rack-specific config */}
        {selectedShape.type === "rack" && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Config. WMS</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="levels" className="text-xs text-muted-foreground">
                    Niveles
                  </Label>
                  <Input
                    id="levels"
                    type="number"
                    min={1}
                    max={10}
                    value={selectedShape.levels || 1}
                    onChange={(e) => updateShape(selectedShape.id, { levels: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="positions" className="text-xs text-muted-foreground">
                    Posiciones/Nivel
                  </Label>
                  <Input
                    id="positions"
                    type="number"
                    min={1}
                    max={20}
                    value={selectedShape.positionsPerLevel || 1}
                    onChange={(e) => updateShape(selectedShape.id, { positionsPerLevel: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total de ubicaciones:</p>
                <p className="text-3xl font-bold text-primary mb-2">
                  {(selectedShape.levels || 1) * (selectedShape.positionsPerLevel || 1)}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Área del rack:{" "}
                    <span className="font-semibold">
                      {(selectedShape.realWorldWidth! * selectedShape.realWorldHeight!).toFixed(2)} m²
                    </span>
                  </p>
                  <p>
                    Capacidad estimada:{" "}
                    <span className="font-semibold">
                      {Math.floor(selectedShape.realWorldWidth! * selectedShape.realWorldHeight! * 2)} pallets
                    </span>
                  </p>
                </div>
              </div>

              <Button className="w-full" onClick={handleGenerateLocations} disabled={generatingLocations}>
                {generatingLocations ? (
                  <>Generando... {locationsGenerated}</>
                ) : locationsGenerated > 0 ? (
                  <>Generadas {locationsGenerated} ubicaciones</>
                ) : (
                  <>Generar Ubicaciones en BD</>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Zone-specific config */}
        {selectedShape.type === "zone" && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Tipo de Zona</p>
              <Select
                value={selectedShape.zoneType || "storage"}
                onValueChange={(value) => updateShape(selectedShape.id, { zoneType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reception">Recepción</SelectItem>
                  <SelectItem value="shipping">Despacho</SelectItem>
                  <SelectItem value="storage">Almacenamiento</SelectItem>
                  <SelectItem value="buffer">Pulmón</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Obstacle-specific config */}
        {selectedShape.type === "obstacle" && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Tipo de Obstáculo</p>
              <Select
                value={selectedShape.obstacleType || "column"}
                onValueChange={(value) => updateShape(selectedShape.id, { obstacleType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="column">Columna</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="wall">Pared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Access point config */}
        {selectedShape.type === "access-point" && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Tipo de Acceso</p>
              <Select
                value={selectedShape.accessType || "loading"}
                onValueChange={(value) => updateShape(selectedShape.id, { accessType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loading">Carga</SelectItem>
                  <SelectItem value="unloading">Descarga</SelectItem>
                  <SelectItem value="emergency">Emergencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={() => {
            const newShape = {
              ...selectedShape,
              id: `${selectedShape.type}-${Date.now()}`,
              x: selectedShape.x + 20,
              y: selectedShape.y + 20,
              name: `${selectedShape.name} (copia)`,
            }
            useLayoutStore.getState().addShape(newShape)
          }}
        >
          <Copy className="w-4 h-4" />
          Duplicar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => deleteShape(selectedShape.id)}
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </Button>
      </div>
    </div>
  )
}
