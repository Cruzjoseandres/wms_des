"use client"
import { User, Building2, Settings, LogOut, UserCircle, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useRouter } from "next/navigation"
import { CommandPalette } from "@/components/layout/command-palette"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import Link from "next/link"
import { useDemoState } from "@/lib/hooks/use-demo-state"
import { ModeSwitcher } from "@/components/layout/mode-switcher" // Corrected ModeSwitcher import path

export function Header() {
  const router = useRouter()
  const { isSuperAdmin, impersonatingOrg, currentUser, clearImpersonation, setMobileSidebarOpen, logout } =
    useAdminStore()
  const { searchQuery, setSearchQuery } = useDemoState()

  const orgDisplay = impersonatingOrg ? impersonatingOrg.name : "PT9 NUEVO CEDIS"

  const handleGoToSuperAdmin = () => {
    clearImpersonation()
    router.push("/super-admin")
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <header className="h-14 bg-card/50 backdrop-blur-sm border-b border-border flex items-center px-2 sm:px-4 lg:px-6 shrink-0 gap-2 sm:gap-4 justify-between sticky top-0 z-30">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden h-8 w-8 mr-1 sm:mr-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Left section - Company info */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm truncate block max-w-[80px] sm:max-w-[120px] lg:max-w-[200px] font-semibold text-foreground">
              {orgDisplay}
            </span>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 flex justify-center min-w-0 max-w-xl mx-2 sm:mx-4">
          <div className="w-full hidden md:block">
            <CommandPalette />
          </div>
          <div className="md:hidden">
            <CommandPalette iconOnly />
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <div className="hidden xs:flex items-center gap-0.5 sm:gap-1.5">
            <ModeSwitcher /> {/* Use ModeSwitcher */}
          </div>

          {/* Notifications dropdown */}
          <NotificationsDropdown />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser?.fullName || "Super Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email || "admin@sgla.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="cursor-pointer">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracion" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleGoToSuperAdmin} className="text-destructive focus:text-destructive">
                    <User className="w-4 h-4 mr-2" />
                    Panel Super Admin
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
