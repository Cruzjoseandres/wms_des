import type React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireSuperAdmin>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  )
}
