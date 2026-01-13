"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Shield,
  Activity,
  PackageSearch,
} from "lucide-react"

const superAdminMenuItems = [
  {
    title: "Panel Principal",
    icon: LayoutDashboard,
    href: "/super-admin",
  },
  {
    title: "Empresas",
    icon: Building2,
    href: "/super-admin/companies",
  },
  {
    title: "Usuarios Globales",
    icon: Users,
    href: "/super-admin/users",
  },
  {
    title: "Planes y Facturación",
    icon: CreditCard,
    href: "/super-admin/billing",
  },
  {
    title: "Analíticas Globales",
    icon: BarChart3,
    href: "/super-admin/analytics",
  },
  {
    title: "Actividad del Sistema",
    icon: Activity,
    href: "/super-admin/activity",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/super-admin/settings",
  },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/super-admin") return pathname === "/super-admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-20 lg:w-64 bg-gray-900 border-r border-red-900/30 flex flex-col h-screen fixed left-0 top-10 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-red-900/30 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-bold text-white">SGLA</h1>
          <p className="text-xs text-red-400">Super Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {superAdminMenuItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  "hover:bg-red-900/30",
                  isActive(item.href) ? "bg-red-900/50 text-red-400" : "text-gray-400",
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:block text-sm font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Back to Client View */}
      <div className="p-4 border-t border-red-900/30">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
        >
          <PackageSearch className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block text-sm font-medium">Vista Cliente</span>
        </Link>
      </div>
    </aside>
  )
}
