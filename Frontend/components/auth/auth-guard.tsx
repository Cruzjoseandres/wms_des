"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAdminStore } from "@/lib/stores/admin-store"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isSuperAdmin } = useAdminStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      // Check super admin routes
      if (requireSuperAdmin && !isSuperAdmin) {
        router.push("/")
        return
      }

      // If authenticated user tries to access super-admin without being super admin
      if (pathname.startsWith("/super-admin") && !isSuperAdmin) {
        router.push("/")
        return
      }

      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isSuperAdmin, requireSuperAdmin, pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
