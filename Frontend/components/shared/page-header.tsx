"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  onNew?: () => void
  newLabel?: string
  onImport?: () => void
  onExport?: () => void
  children?: React.ReactNode
  actions?: React.ReactNode
  loader2?: boolean
}

export function PageHeader({
  title,
  description,
  onNew,
  newLabel = "Nuevo",
  onImport,
  onExport,
  children,
  actions,
  loader2 = false,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {actions}
        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        )}
        {onImport && (
          <Button
            variant="outline"
            onClick={onImport}
            className="bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
        )}
        {onNew && (
          <Button
            onClick={onNew}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden xs:inline">{newLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
