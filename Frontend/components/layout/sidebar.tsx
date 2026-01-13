"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useUIStore, type UIDensity } from "@/lib/stores/ui-store"
import { useTheme } from "@/components/providers/theme-provider"
import { ScannerModal } from "@/components/scanner/scanner-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  PackageSearch,
  PackagePlus,
  Warehouse,
  PackageX,
  ClipboardList,
  Settings,
  Radio,
  ChevronDown,
  FileX,
  Tag,
  PanelLeftClose,
  PanelLeft,
  X,
  Users,
  Database,
  FileText,
  CreditCard,
  Server,
  Activity,
  ScanBarcode,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/layout/command-palette"

const clientMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Ingresos",
    icon: PackagePlus,
    href: "/ingresos",
    submenu: [
      { title: "Registro de Ingreso", href: "/ingresos/registro" },
      { title: "Ingreso Masivo", href: "/ingresos/masivo" },
      { title: "Ubicación de Ítems", href: "/ingresos/ubicacion" },
    ],
  },
  {
    title: "Salidas",
    icon: PackageX,
    href: "/salidas",
    submenu: [
      { title: "Registro de Pedidos", href: "/salidas/pedidos" },
      { title: "Programación", href: "/salidas/programacion" },
      { title: "Picking", href: "/salidas/picking" },
      { title: "Packing", href: "/salidas/packing" },
      { title: "Despacho", href: "/salidas/despacho" },
    ],
  },
  {
    title: "Anulaciones",
    icon: FileX,
    href: "/anulaciones",
  },
  {
    title: "Etiquetado",
    icon: Tag,
    href: "/etiquetado",
  },
  {
    title: "Inventarios",
    icon: ClipboardList,
    href: "/inventario",
    submenu: [
      { title: "Gestión de Inventarios", href: "/inventario/gestion" },
      { title: "Corte de Stock", href: "/inventario/corte" },
      { title: "Captura de Datos", href: "/inventario/captura" },
    ],
  },
  {
    title: "Almacén",
    icon: Warehouse,
    href: "/almacen",
    submenu: [
      { title: "Control de Stock", href: "/almacen/stock" },
      { title: "Reubicación", href: "/almacen/reubicacion" },
      { title: "Kardex", href: "/almacen/kardex" },
      { title: "Layout de Almacén", href: "/layout-almacen" },
    ],
  },
  {
    title: "Administración",
    icon: Settings,
    href: "/administracion",
    submenu: [
      { title: "Productos", href: "/administracion/productos" },
      { title: "Categorías", href: "/administracion/categorias" },
      { title: "Almacenes", href: "/administracion/almacenes" },
      { title: "Bodegas", href: "/administracion/bodegas" },
      { title: "Racks", href: "/administracion/racks" },
      { title: "Ubicaciones", href: "/administracion/ubicaciones" },
      { title: "Proveedores", href: "/administracion/proveedores" },
      { title: "Usuarios", href: "/administracion/usuarios" },
    ],
  },
  {
    title: "Lectura RF",
    icon: Radio,
    href: "/lectura-rf",
    submenu: [
      { title: "Lectura RFID", href: "/lectura-rf" },
      { title: "Verificación RF", href: "/lectura-rf/verificacion" },
      { title: "Etiquetado RF", href: "/lectura-rf/etiquetado" },
    ],
  },
]

const superAdminMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/super-admin" },
  { title: "Tenants", icon: Users, href: "/super-admin/companies" },
  { title: "Usuarios Globales", icon: Users, href: "/super-admin/users" },
  { title: "Logs", icon: FileText, href: "/super-admin/activity" },
  { title: "Base de Datos", icon: Database, href: "/super-admin/analytics" },
  { title: "Facturación Global", icon: CreditCard, href: "/super-admin/billing" },
  { title: "Servidores", icon: Server, href: "/super-admin/settings" },
  { title: "Monitoreo", icon: Activity, href: "/super-admin/analytics" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(["Dashboard"])
  const { isSuperAdmin, viewMode, sidebarCollapsed, mobileSidebarOpen, toggleSidebar, setMobileSidebarOpen } =
    useAdminStore()
  const { density, setDensity } = useUIStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [scannerOpen, setScannerOpen] = useState(false)

  const menuItems = isSuperAdmin && viewMode === "SUPER_ADMIN" ? superAdminMenuItems : clientMenuItems

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/" || href === "/super-admin") return pathname === href
    return pathname.startsWith(href)
  }

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname, setMobileSidebarOpen])

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50",
          "h-screen",
          "transition-all duration-300 ease-in-out",
          // Desktop: show as collapsed or expanded with smooth width transition
          sidebarCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile: show as drawer with slide animation
          mobileSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo and collapse button */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-3 shrink-0 h-16">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div
              className={cn(
                "rounded-lg bg-gradient-to-br from-orange-500 via-slate-600 to-slate-800 flex items-center justify-center shrink-0",
                "transition-all duration-300 ease-in-out",
                "w-10 h-10 shadow-lg shadow-orange-500/20",
              )}
            >
              <PackageSearch className="w-5 h-5 text-white" />
            </div>
            <div
              className={cn(
                "transition-all duration-300 ease-in-out origin-left flex flex-col justify-center",
                sidebarCollapsed ? "lg:opacity-0 lg:scale-90 lg:w-0" : "opacity-100 scale-100 w-auto",
              )}
            >
              <h1 className="text-[11px] font-bold text-sidebar-foreground whitespace-nowrap leading-tight tracking-wider">
                CADENA LOGÍSTICA
              </h1>
              <p className="text-xl font-black text-orange-500 whitespace-nowrap leading-none tracking-tighter italic">
                SGLA
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-transform duration-200 hover:scale-110 shrink-0"
          >
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 lg:hidden border-b border-sidebar-border">
          <CommandPalette mobile />
        </div>

        {/* Navigation - Added flex-1 and overflow-y-auto for proper scrolling */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex items-center">
                          <Link
                            href={item.submenu[0].href}
                            className={cn(
                              "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-l-lg transition-all duration-200",
                              "hover:bg-sidebar-accent hover:pl-4",
                              isActive(item.href) ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground",
                            )}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="flex-1 text-left text-sm font-medium truncate transition-opacity duration-200">
                              {item.title}
                            </span>
                          </Link>
                          <button
                            onClick={() => toggleMenu(item.title)}
                            className={cn(
                              "px-2 py-2.5 rounded-r-lg transition-all duration-200",
                              "hover:bg-sidebar-accent",
                              isActive(item.href) ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "transition-transform duration-200",
                                openMenus.includes(item.title) ? "rotate-0" : "-rotate-90",
                              )}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </button>
                        </div>

                        {openMenus.includes(item.title) && (
                          <ul className="mt-1 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {item.submenu.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "block px-3 py-2 rounded-lg text-sm transition-all duration-200 truncate",
                                    "hover:bg-sidebar-accent hover:pl-4",
                                    pathname === sub.href ? "bg-primary/20 text-primary" : "text-muted-foreground",
                                  )}
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    {sidebarCollapsed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.submenu[0].href}
                            className={cn(
                              "flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200",
                              "hover:bg-sidebar-accent hover:scale-110",
                              isActive(item.href) ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground",
                            )}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="p-0 bg-popover border-border animate-in fade-in-0 zoom-in-95 duration-200"
                        >
                          <div className="py-2 min-w-[180px]">
                            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                              {item.title}
                            </p>
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  "block px-3 py-2 text-sm transition-colors duration-150",
                                  "hover:bg-accent",
                                  pathname === sub.href ? "bg-primary/20 text-primary" : "text-popover-foreground",
                                )}
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          "hover:bg-sidebar-accent",
                          sidebarCollapsed ? "justify-center hover:scale-110" : "justify-start hover:pl-4",
                          isActive(item.href) ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-sm font-medium truncate transition-opacity duration-200">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent
                        side="right"
                        className="bg-popover border-border animate-in fade-in-0 zoom-in-95 duration-200"
                      >
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom - Added mt-auto and pb-safe for always visible footer */}
        <div className="mt-auto border-t border-sidebar-border shrink-0">
          <div className={cn("flex flex-col p-2 gap-2", sidebarCollapsed ? "items-center" : "px-4 py-3")}>
            {/* Scanner Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={sidebarCollapsed ? "icon" : "sm"}
                  onClick={() => setScannerOpen(true)}
                  className={cn(
                    "text-muted-foreground hover:text-foreground w-full",
                    sidebarCollapsed ? "h-10 w-10" : "justify-start gap-3 h-10 px-3",
                  )}
                >
                  <ScanBarcode className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">Escanear</span>}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && <TooltipContent side="right">Abrir Escáner</TooltipContent>}
            </Tooltip>

            {/* Density and Theme Controls Row */}
            <div className={cn("flex items-center gap-2", sidebarCollapsed ? "flex-col" : "justify-between")}>
              {/* Density Selector */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">Densidad de interfaz</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align={sidebarCollapsed ? "start" : "end"} side="right" className="w-56 ml-2">
                  <DropdownMenuLabel>Densidad de Interfaz</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={density} onValueChange={(v) => setDensity(v as UIDensity)}>
                    <DropdownMenuRadioItem value="compact" className="cursor-pointer">
                      Compacto
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="comfortable" className="cursor-pointer">
                      Cómodo
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="spacious" className="cursor-pointer">
                      Amplio
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {resolvedTheme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4 text-yellow-500" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">Cambiar tema</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align={sidebarCollapsed ? "start" : "end"} side="right" className="ml-2">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" /> Claro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" /> Oscuro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" /> Sistema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="p-4 border-t border-sidebar-border">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium shrink-0 transition-transform duration-200 hover:scale-110">
                  FM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Fernando Melid</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {viewMode === "SUPER_ADMIN" ? "Super Admin" : "Cliente"}
                  </p>
                </div>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer transition-transform duration-200 hover:scale-110">
                      FM
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">Fernando Melid</p>
                  <p className="text-xs text-muted-foreground">
                    {viewMode === "SUPER_ADMIN" ? "Super Admin" : "Cliente"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>

      {/* Scanner Modal accessible from Sidebar */}
      <ScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
    </TooltipProvider>
  )
}
