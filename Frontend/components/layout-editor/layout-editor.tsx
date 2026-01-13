"use client"

import { useRef, useState, useEffect } from "react"
import { LayoutToolbar } from "./toolbar"
import { PropertiesPanel } from "./properties-panel"
import { CanvasStage } from "./canvas-stage"
import { LayoutPreview } from "./layout-preview"
import { TemplatesPanel } from "./templates-panel"
import { useLayoutStore } from "@/lib/stores/layout-store"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export function LayoutEditor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [showProperties, setShowProperties] = useState(true)
  const { shapes, selectedShapeId } = useLayoutStore()

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [showProperties])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview takes 1 column */}
        <div className="lg:col-span-1">
          <LayoutPreview />
        </div>
        {/* Templates takes 2 columns */}
        <div className="lg:col-span-2">
          <TemplatesPanel />
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex h-[calc(100vh-460px)] min-h-[400px] bg-background rounded-lg border border-border overflow-hidden">
        {/* Left toolbar */}
        <LayoutToolbar />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas header */}
          <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Objetos: <span className="text-foreground font-medium">{shapes.length}</span>
              </span>
              <span className="text-sm text-muted-foreground hidden sm:block">
                Seleccionado:{" "}
                <span className="text-foreground font-medium">
                  {selectedShapeId ? shapes.find((s) => s.id === selectedShapeId)?.name : "Ninguno"}
                </span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowProperties(!showProperties)} className="gap-2">
              {showProperties ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">Panel</span>
            </Button>
          </div>

          {/* Canvas container */}
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <CanvasStage width={dimensions.width} height={dimensions.height} />
          </div>
        </div>

        {/* Right properties panel */}
        {showProperties && <PropertiesPanel />}
      </div>
    </div>
  )
}
