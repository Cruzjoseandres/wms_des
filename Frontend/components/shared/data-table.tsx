"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: keyof T | string
  label: string
  hideOnMobile?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  showActions?: boolean
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  onEdit,
  onDelete,
  showActions = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-sm"
          />
        </div>
        <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
          <SelectTrigger className="w-full sm:w-32 bg-secondary border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 filas</SelectItem>
            <SelectItem value="25">25 filas</SelectItem>
            <SelectItem value="50">50 filas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                {columns.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className={cn(
                      "text-foreground font-semibold text-xs sm:text-sm whitespace-nowrap",
                      col.hideOnMobile && "hidden sm:table-cell",
                    )}
                  >
                    {col.label}
                  </TableHead>
                ))}
                {showActions && (
                  <TableHead className="text-foreground font-semibold w-20 sm:w-24 text-xs sm:text-sm">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, idx) => (
                <TableRow key={item.id} className={cn(idx % 2 === 0 ? "bg-card" : "bg-card/50", "hover:bg-muted/50")}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={cn(
                        "text-foreground text-xs sm:text-sm py-2 sm:py-3",
                        col.hideOnMobile && "hidden sm:table-cell",
                      )}
                    >
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="py-2 sm:py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          onClick={() => onEdit?.(item)}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => onDelete?.(item)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Mostrando {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredData.length)} de {filteredData.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-secondary border-border h-8 px-2 sm:px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs sm:text-sm text-foreground whitespace-nowrap">
            {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="bg-secondary border-border h-8 px-2 sm:px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
