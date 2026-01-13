"use client"

import type React from "react"
import { useRef, useEffect, useCallback, useState } from "react"
import { useLayoutStore, type LayoutShape, type ShapeType } from "@/lib/stores/layout-store"

interface CanvasStageProps {
  width: number
  height: number
}

export function CanvasStage({ width, height }: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const {
    shapes,
    selectedShapeId,
    zoom,
    stagePosition,
    gridSize,
    snapToGrid,
    selectShape,
    updateShape,
    addShape,
    setZoom,
    setStagePosition,
    snapToGridCoordinate,
  } = useLayoutStore()

  const getShapeColor = (shape: LayoutShape, isSelected: boolean) => {
    const colors: Record<string, { fill: string; stroke: string }> = {
      rack: { fill: "rgba(59, 130, 246, 0.6)", stroke: "#3b82f6" },
      zone: { fill: "rgba(34, 197, 94, 0.4)", stroke: "#22c55e" },
      obstacle: { fill: "rgba(239, 68, 68, 0.5)", stroke: "#ef4444" },
      "access-point": { fill: "rgba(168, 85, 247, 0.5)", stroke: "#a855f7" },
    }
    const color = colors[shape.type] || colors.rack
    return {
      fill: isSelected ? color.fill.replace(/0\.[456]/, "0.8") : color.fill,
      stroke: isSelected ? "#fbbf24" : color.stroke,
      strokeWidth: isSelected ? 3 : 2,
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(stagePosition.x, stagePosition.y)
    ctx.scale(zoom, zoom)

    // Draw grid
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 0.5 / zoom
    ctx.globalAlpha = 0.3

    const gridWidth = (width * 3) / zoom
    const gridHeight = (height * 3) / zoom
    const startX = -gridWidth / 2
    const startY = -gridHeight / 2

    for (let x = startX; x <= startX + gridWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, startY + gridHeight)
      ctx.stroke()
    }

    for (let y = startY; y <= startY + gridHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(startX + gridWidth, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1

    // Draw shapes
    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShapeId
      const colors = getShapeColor(shape, isSelected)

      const displayX = shape.id === draggedShapeId && tempPosition ? tempPosition.x : shape.x
      const displayY = shape.id === draggedShapeId && tempPosition ? tempPosition.y : shape.y

      ctx.fillStyle = colors.fill
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = colors.strokeWidth / zoom

      // Draw shape with rounded corners
      const radius = 4
      ctx.beginPath()
      ctx.moveTo(displayX + radius, displayY)
      ctx.lineTo(displayX + shape.width - radius, displayY)
      ctx.quadraticCurveTo(displayX + shape.width, displayY, displayX + shape.width, displayY + radius)
      ctx.lineTo(displayX + shape.width, displayY + shape.height - radius)
      ctx.quadraticCurveTo(
        displayX + shape.width,
        displayY + shape.height,
        displayX + shape.width - radius,
        displayY + shape.height,
      )
      ctx.lineTo(displayX + radius, displayY + shape.height)
      ctx.quadraticCurveTo(displayX, displayY + shape.height, displayX, displayY + shape.height - radius)
      ctx.lineTo(displayX, displayY + radius)
      ctx.quadraticCurveTo(displayX, displayY, displayX + radius, displayY)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw label
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${Math.max(10, 14 / zoom)}px Inter, system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const maxWidth = shape.width - 10
      let displayName = shape.name
      while (ctx.measureText(displayName).width > maxWidth && displayName.length > 3) {
        displayName = displayName.slice(0, -1)
      }
      if (displayName !== shape.name) displayName += "..."

      ctx.fillText(displayName, displayX + shape.width / 2, displayY + shape.height / 2)

      // Draw type indicator
      ctx.font = `${Math.max(8, 10 / zoom)}px Inter, system-ui, sans-serif`
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      const typeLabels: Record<string, string> = {
        rack: "RACK",
        zone: "ZONA",
        obstacle: "OBSTÁCULO",
        "access-point": "ACCESO",
      }
      ctx.fillText(
        typeLabels[shape.type] || shape.type.toUpperCase(),
        displayX + shape.width / 2,
        displayY + shape.height / 2 + 14 / zoom,
      )

      // Draw selection handles
      if (isSelected) {
        const handleSize = 8 / zoom
        ctx.fillStyle = "#fbbf24"
        const handles = [
          { x: displayX, y: displayY },
          { x: displayX + shape.width, y: displayY },
          { x: displayX, y: displayY + shape.height },
          { x: displayX + shape.width, y: displayY + shape.height },
        ]
        handles.forEach((handle) => {
          ctx.beginPath()
          ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
          ctx.fill()
        })
      }
    })

    ctx.restore()
  }, [shapes, selectedShapeId, zoom, stagePosition, gridSize, width, height, draggedShapeId, tempPosition])

  useEffect(() => {
    draw()
  }, [draw])

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const x = (screenX - rect.left - stagePosition.x) / zoom
      const y = (screenY - rect.top - stagePosition.y) / zoom

      return { x, y }
    },
    [zoom, stagePosition],
  )

  const findShapeAtPosition = useCallback(
    (x: number, y: number): LayoutShape | null => {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
          return shape
        }
      }
      return null
    },
    [shapes],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      const shape = findShapeAtPosition(x, y)

      if (shape) {
        selectShape(shape.id)
        setIsDragging(true)
        setDraggedShapeId(shape.id)
        setDragStart({ x: x - shape.x, y: y - shape.y })
        setTempPosition({ x: shape.x, y: shape.y })
      } else {
        selectShape(null)
        setIsPanning(true)
        setPanStart({ x: e.clientX - stagePosition.x, y: e.clientY - stagePosition.y })
      }
    },
    [screenToCanvas, findShapeAtPosition, selectShape, stagePosition],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging && draggedShapeId) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        const newX = x - dragStart.x
        const newY = y - dragStart.y

        setTempPosition({ x: newX, y: newY })
      } else if (isPanning) {
        setStagePosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    },
    [isDragging, draggedShapeId, isPanning, screenToCanvas, dragStart, panStart, setStagePosition],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging && draggedShapeId && tempPosition) {
      let finalX = tempPosition.x
      let finalY = tempPosition.y

      if (snapToGrid) {
        finalX = snapToGridCoordinate(finalX, gridSize)
        finalY = snapToGridCoordinate(finalY, gridSize)
      }

      updateShape(draggedShapeId, { x: finalX, y: finalY })
    }

    setIsDragging(false)
    setDraggedShapeId(null)
    setTempPosition(null)
    setIsPanning(false)
  }, [isDragging, draggedShapeId, tempPosition, snapToGrid, gridSize, snapToGridCoordinate, updateShape])

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const mousePointTo = {
        x: (mouseX - stagePosition.x) / zoom,
        y: (mouseY - stagePosition.y) / zoom,
      }

      const direction = e.deltaY > 0 ? -1 : 1
      const newScale = direction > 0 ? zoom * 1.1 : zoom / 1.1
      const clampedScale = Math.max(0.1, Math.min(3, newScale))

      setZoom(clampedScale)
      setStagePosition({
        x: mouseX - mousePointTo.x * clampedScale,
        y: mouseY - mousePointTo.y * clampedScale,
      })
    },
    [zoom, stagePosition, setZoom, setStagePosition],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const shapeType = e.dataTransfer.getData("shapeType") as ShapeType
      if (!shapeType) return

      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      let finalX = x - 50
      let finalY = y - 30

      if (snapToGrid) {
        finalX = snapToGridCoordinate(finalX, gridSize)
        finalY = snapToGridCoordinate(finalY, gridSize)
      }

      const typeLabels: Record<ShapeType, string> = {
        rack: "Rack",
        zone: "Zona",
        obstacle: "Obstáculo",
        "access-point": "Acceso",
      }

      const typeColors: Record<ShapeType, string> = {
        rack: "#3b82f6",
        zone: "#22c55e",
        obstacle: "#ef4444",
        "access-point": "#a855f7",
      }

      const newShape: LayoutShape = {
        id: `${shapeType}-${Date.now()}`,
        type: shapeType,
        x: finalX,
        y: finalY,
        width: shapeType === "zone" ? 200 : shapeType === "obstacle" ? 80 : 120,
        height: shapeType === "zone" ? 150 : 80,
        name: `${typeLabels[shapeType]} ${shapes.length + 1}`,
        color: typeColors[shapeType],
        rotation: 0,
        levels: shapeType === "rack" ? 3 : undefined,
        positionsPerLevel: shapeType === "rack" ? 4 : undefined,
        zoneType: shapeType === "zone" ? "storage" : undefined,
        obstacleType: shapeType === "obstacle" ? "column" : undefined,
        accessType: shapeType === "access-point" ? "loading" : undefined,
      }

      addShape(newShape)
    },
    [screenToCanvas, gridSize, snapToGrid, snapToGridCoordinate, shapes.length, addShape],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair"
        style={{ backgroundColor: "#1e293b" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
    </div>
  )
}
