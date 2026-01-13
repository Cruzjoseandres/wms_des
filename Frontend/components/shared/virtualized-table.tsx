"use client"

import type React from "react"
import { useRef, useMemo, useState, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore, densityClasses } from "@/lib/stores/ui-store"

interface Column<T> {
  key: keyof T | string
  label: string
  width?: number
  minWidth?: number
  sortable?: boolean
  hideOnMobile?: boolean
  render?: (item: T, index: number) => React.ReactNode
}

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRowClick?: (item: T) => void
  onSelectionChange?: (selectedItems: T[]) => void
  showActions?: boolean
  showCheckbox?: boolean
  isLoading?: boolean
  maxHeight?: number
  emptyMessage?: string
  getRowId?: (item: T) => string | number
}

type SortDirection = "asc" | "desc" | null

export function VirtualizedTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  onEdit,
  onDelete,
  onRowClick,
  onSelectionChange,
  showActions = true,
  showCheckbox = false,
  isLoading = false,
  maxHeight = 600,
  emptyMessage = "No hay datos para mostrar",
  getRowId = (item) => item.id,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const { density } = useUIStore()
  const classes = densityClasses[density]

  // Estados locales
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  // Altura de fila según densidad
  const rowHeight = density === "compact" ? 36 : density === "comfortable" ? 48 : 64

  // Filtrado y ordenamiento
  const processedData = useMemo(() => {
    let result = [...data]

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchLower)),
      )
    }

    // Ordenar
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof T]
        const bVal = b[sortKey as keyof T]

        if (aVal === bVal) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1

        const comparison = aVal < bVal ? -1 : 1
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return result
  }, [data, search, sortKey, sortDirection])

  // Virtualización
  const virtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  // Handlers
  const handleSort = useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDirection("asc")
        return key
      }
      setSortDirection((prev) => {
        if (prev === "asc") return "desc"
        if (prev === "desc") return null
        return "asc"
      })
      return sortDirection === "desc" ? null : key
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === processedData.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(processedData.map(getRowId))
      setSelectedIds(allIds)
      onSelectionChange?.(processedData)
    }
  }, [processedData, selectedIds.size, onSelectionChange, getRowId])

  const handleSelectRow = useCallback(
    (item: T) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        const id = getRowId(item)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        onSelectionChange?.(processedData.filter((i) => newSet.has(getRowId(i))))
        return newSet
      })
    },
    [processedData, onSelectionChange, getRowId],
  )

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className={cn("ml-1 opacity-50", classes.iconSize)} />
    if (sortDirection === "asc") return <ArrowUp className={cn("ml-1 text-primary", classes.iconSize)} />
    if (sortDirection === "desc") return <ArrowDown className={cn("ml-1 text-primary", classes.iconSize)} />
    return <ArrowUpDown className={cn("ml-1 opacity-50", classes.iconSize)} />
  }

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {processedData.length.toLocaleString()} registros
          </span>
          {showCheckbox && selectedIds.size > 0 && (
            <span className="text-sm text-primary font-medium">{selectedIds.size} seleccionados</span>
          )}
        </div>
      </div>

      {/* Tabla virtualizada */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className={cn("flex bg-secondary border-b border-border", classes.rowHeight)}>
          {showCheckbox && (
            <div className="flex items-center justify-center w-12 shrink-0 border-r border-border">
              <Checkbox
                checked={selectedIds.size === processedData.length && processedData.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </div>
          )}
          {columns.map((col) => (
            <div
              key={String(col.key)}
              className={cn(
                "flex items-center font-semibold text-foreground shrink-0",
                classes.paddingX,
                classes.text,
                col.hideOnMobile && "hidden sm:flex",
                col.sortable && "cursor-pointer hover:bg-muted/50 transition-colors",
              )}
              style={{ width: col.width || 150, minWidth: col.minWidth || 100 }}
              onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
            >
              <span className="truncate">{col.label}</span>
              {col.sortable && getSortIcon(String(col.key))}
            </div>
          ))}
          {showActions && (
            <div
              className={cn("flex items-center justify-center font-semibold text-foreground shrink-0", classes.text)}
              style={{ width: 100 }}
            >
              Acciones
            </div>
          )}
        </div>

        {/* Body virtualizado */}
        <div ref={parentRef} className="overflow-auto" style={{ maxHeight, contain: "strict" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">{emptyMessage}</div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = processedData[virtualRow.index]
                const isSelected = selectedIds.has(getRowId(item))
                const isEven = virtualRow.index % 2 === 0

                return (
                  <div
                    key={getRowId(item)}
                    className={cn(
                      "flex absolute left-0 w-full transition-colors",
                      isEven ? "bg-card" : "bg-card/50",
                      isSelected && "bg-primary/10",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onRowClick?.(item)}
                  >
                    {showCheckbox && (
                      <div
                        className="flex items-center justify-center w-12 shrink-0 border-r border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => handleSelectRow(item)} />
                      </div>
                    )}
                    {columns.map((col) => (
                      <div
                        key={String(col.key)}
                        className={cn(
                          "flex items-center text-foreground shrink-0 overflow-hidden",
                          classes.paddingX,
                          classes.text,
                          col.hideOnMobile && "hidden sm:flex",
                        )}
                        style={{ width: col.width || 150, minWidth: col.minWidth || 100 }}
                      >
                        <span className="truncate">
                          {col.render ? col.render(item, virtualRow.index) : String(item[col.key as keyof T] ?? "")}
                        </span>
                      </div>
                    ))}
                    {showActions && (
                      <div
                        className="flex items-center justify-center gap-1 shrink-0"
                        style={{ width: 100 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10",
                              density === "compact" ? "h-6 w-6" : density === "comfortable" ? "h-8 w-8" : "h-10 w-10",
                            )}
                            onClick={() => onEdit(item)}
                          >
                            <Edit className={classes.iconSize} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "text-red-400 hover:text-red-300 hover:bg-red-400/10",
                              density === "compact" ? "h-6 w-6" : density === "comfortable" ? "h-8 w-8" : "h-10 w-10",
                            )}
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className={classes.iconSize} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info de scroll */}
      {processedData.length > 50 && (
        <p className="text-xs text-muted-foreground text-center">
          Mostrando {Math.min(virtualizer.getVirtualItems().length, processedData.length)} de{" "}
          {processedData.length.toLocaleString()} registros (scroll para ver más)
        </p>
      )}
    </div>
  )
}
