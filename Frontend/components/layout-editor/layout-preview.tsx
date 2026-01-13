"use client"

import { useRef, useEffect, useCallback } from "react"
import { useLayoutStore, type LayoutShape } from "@/lib/stores/layout-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Box, MapPin, AlertTriangle, DoorOpen } from "lucide-react"

export function LayoutPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { shapes } = useLayoutStore()

  // Calculate bounds of all shapes
  const getBounds = useCallback(() => {
    if (shapes.length === 0) return { minX: 0, minY: 0, maxX: 400, maxY: 200 }

    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY
    shapes.forEach((shape) => {
      minX = Math.min(minX, shape.x)
      minY = Math.min(minY, shape.y)
      maxX = Math.max(maxX, shape.x + shape.width)
      maxY = Math.max(maxY, shape.y + shape.height)
    })
    return { minX: minX - 20, minY: minY - 20, maxX: maxX + 20, maxY: maxY + 20 }
  }, [shapes])

  const getShapeColor = (shape: LayoutShape) => {
    const colors: Record<string, string> = {
      rack: "rgba(59, 130, 246, 0.7)",
      zone: "rgba(34, 197, 94, 0.5)",
      obstacle: "rgba(239, 68, 68, 0.6)",
      "access-point": "rgba(168, 85, 247, 0.6)",
    }
    return colors[shape.type] || colors.rack
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const bounds = getBounds()
    const boundsWidth = bounds.maxX - bounds.minX
    const boundsHeight = bounds.maxY - bounds.minY

    // Calculate scale to fit preview
    const scaleX = canvas.width / boundsWidth
    const scaleY = canvas.height / boundsHeight
    const scale = Math.min(scaleX, scaleY) * 0.9

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()

    // Center the drawing
    const offsetX = (canvas.width - boundsWidth * scale) / 2 - bounds.minX * scale
    const offsetY = (canvas.height - boundsHeight * scale) / 2 - bounds.minY * scale
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Draw shapes
    shapes.forEach((shape) => {
      ctx.fillStyle = getShapeColor(shape)
      ctx.strokeStyle = shape.color || "#ffffff"
      ctx.lineWidth = 2 / scale

      // Rounded rectangle
      const radius = 4
      ctx.beginPath()
      ctx.moveTo(shape.x + radius, shape.y)
      ctx.lineTo(shape.x + shape.width - radius, shape.y)
      ctx.quadraticCurveTo(shape.x + shape.width, shape.y, shape.x + shape.width, shape.y + radius)
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height - radius)
      ctx.quadraticCurveTo(
        shape.x + shape.width,
        shape.y + shape.height,
        shape.x + shape.width - radius,
        shape.y + shape.height,
      )
      ctx.lineTo(shape.x + radius, shape.y + shape.height)
      ctx.quadraticCurveTo(shape.x, shape.y + shape.height, shape.x, shape.y + shape.height - radius)
      ctx.lineTo(shape.x, shape.y + radius)
      ctx.quadraticCurveTo(shape.x, shape.y, shape.x + radius, shape.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Label (smaller for preview)
      if (scale > 0.3) {
        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${Math.max(8, 10 / scale)}px Inter, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(shape.name, shape.x + shape.width / 2, shape.y + shape.height / 2)
      }
    })

    ctx.restore()
  }, [shapes, getBounds])

  useEffect(() => {
    draw()
  }, [draw])

  // Count shapes by type
  const counts = {
    rack: shapes.filter((s) => s.type === "rack").length,
    zone: shapes.filter((s) => s.type === "zone").length,
    obstacle: shapes.filter((s) => s.type === "obstacle").length,
    "access-point": shapes.filter((s) => s.type === "access-point").length,
  }

  // Calculate total positions
  const totalPositions = shapes
    .filter((s) => s.type === "rack")
    .reduce((acc, s) => acc + (s.levels || 1) * (s.positionsPerLevel || 1), 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Vista Previa del Diseño
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative rounded-lg overflow-hidden border border-border">
          <canvas ref={canvasRef} width={400} height={180} className="w-full" />
          {shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <p className="text-muted-foreground text-sm">Arrastra elementos para comenzar</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Box className="w-3 h-3 text-blue-500" />
            <span className="text-muted-foreground">Racks:</span>
            <Badge variant="secondary" className="h-5 px-1.5">
              {counts.rack}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Zonas:</span>
            <Badge variant="secondary" className="h-5 px-1.5">
              {counts.zone}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-muted-foreground">Obstáculos:</span>
            <Badge variant="secondary" className="h-5 px-1.5">
              {counts.obstacle}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <DoorOpen className="w-3 h-3 text-purple-500" />
            <span className="text-muted-foreground">Accesos:</span>
            <Badge variant="secondary" className="h-5 px-1.5">
              {counts["access-point"]}
            </Badge>
          </div>
        </div>

        {counts.rack > 0 && (
          <div className="bg-primary/10 rounded-lg p-2 text-center">
            <span className="text-xs text-muted-foreground">Total de ubicaciones generables:</span>
            <span className="text-lg font-bold text-primary ml-2">{totalPositions}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
