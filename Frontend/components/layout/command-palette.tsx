"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Warehouse,
  ClipboardList,
  Radio,
  Settings,
  Users,
  Building2,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useDemoState } from "@/lib/hooks/use-demo-state"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, group: "Navegación" },
  { name: "Ingresos - Registro", href: "/ingresos/registro", icon: ArrowDownToLine, group: "Ingresos" },
  { name: "Ingresos - Masivo", href: "/ingresos/masivo", icon: ArrowDownToLine, group: "Ingresos" },
  { name: "Ingresos - Ubicación", href: "/ingresos/ubicacion", icon: ArrowDownToLine, group: "Ingresos" },
  { name: "Salidas - Pedidos", href: "/salidas/pedidos", icon: ArrowUpFromLine, group: "Salidas" },
  { name: "Salidas - Programación", href: "/salidas/programacion", icon: ArrowUpFromLine, group: "Salidas" },
  { name: "Salidas - Picking", href: "/salidas/picking", icon: ArrowUpFromLine, group: "Salidas" },
  { name: "Salidas - Packing", href: "/salidas/packing", icon: ArrowUpFromLine, group: "Salidas" },
  { name: "Salidas - Despacho", href: "/salidas/despacho", icon: ArrowUpFromLine, group: "Salidas" },
  { name: "Almacén - Stock", href: "/almacen/stock", icon: Warehouse, group: "Almacén" },
  { name: "Almacén - Reubicación", href: "/almacen/reubicacion", icon: Warehouse, group: "Almacén" },
  { name: "Almacén - Kardex", href: "/almacen/kardex", icon: Warehouse, group: "Almacén" },
  { name: "Inventario - Gestión", href: "/inventario/gestion", icon: ClipboardList, group: "Inventario" },
  { name: "Inventario - Corte", href: "/inventario/corte", icon: ClipboardList, group: "Inventario" },
  { name: "Inventario - Captura", href: "/inventario/captura", icon: ClipboardList, group: "Inventario" },
  { name: "Lectura RF", href: "/lectura-rf", icon: Radio, group: "RFID" },
  { name: "Productos", href: "/administracion/productos", icon: Package, group: "Administración" },
  { name: "Categorías", href: "/administracion/categorias", icon: Package, group: "Administración" },
  { name: "Almacenes", href: "/administracion/almacenes", icon: Building2, group: "Administración" },
  { name: "Ubicaciones", href: "/administracion/ubicaciones", icon: Building2, group: "Administración" },
  { name: "Usuarios", href: "/administracion/usuarios", icon: Users, group: "Administración" },
  { name: "Perfil", href: "/perfil", icon: Users, group: "Usuario" },
  { name: "Configuración", href: "/configuracion", icon: Settings, group: "Usuario" },
]

export function CommandPalette({ mobile }: { mobile?: boolean } = {}) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const [lastSearch, setLastSearch] = useDemoState("header_last_search", "")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const groupedItems = navigationItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, typeof navigationItems>,
  )

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-lg bg-muted/50 text-sm text-muted-foreground hover:bg-muted",
          mobile ? "w-full" : "sm:w-64 lg:w-96"
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline-flex truncate">
          {lastSearch ? `Última búsqueda: ${lastSearch}` : "Buscar SKU, orden #, cliente..."}
        </span>
        <span className="sm:hidden">{lastSearch || "Buscar..."}</span>
        {!mobile && (
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas, comandos..." value={lastSearch} onValueChange={setLastSearch} />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items], index) => (
            <React.Fragment key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.name}
                    onSelect={() => runCommand(() => router.push(item.href))}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
