"use client"

import { useEffect, type ReactNode } from "react"
import { useAdminStore, type Organization, type UserProfile } from "@/lib/stores/admin-store"

// Mock data for demo purposes
const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Distribuidora Central",
    slug: "distribuidora-central",
    plan: "enterprise",
    createdAt: "2024-01-15",
    usersCount: 25,
    warehousesCount: 4,
    isActive: true,
  },
  {
    id: "org-002",
    name: "Logística Express",
    slug: "logistica-express",
    plan: "pro",
    createdAt: "2024-03-20",
    usersCount: 12,
    warehousesCount: 2,
    isActive: true,
  },
  {
    id: "org-003",
    name: "Almacenes del Sur",
    slug: "almacenes-sur",
    plan: "pro",
    createdAt: "2024-05-10",
    usersCount: 8,
    warehousesCount: 1,
    isActive: true,
  },
  {
    id: "org-004",
    name: "Comercial Norte",
    slug: "comercial-norte",
    plan: "free",
    createdAt: "2024-06-01",
    usersCount: 3,
    warehousesCount: 1,
    isActive: true,
  },
  {
    id: "org-005",
    name: "Importadora Global",
    slug: "importadora-global",
    plan: "enterprise",
    createdAt: "2023-11-20",
    usersCount: 45,
    warehousesCount: 6,
    isActive: true,
  },
]

// For demo, we'll use a super admin user
const mockSuperAdmin: UserProfile = {
  id: "user-super-001",
  email: "superadmin@sgla.com",
  fullName: "Super Administrador",
  role: "super_admin",
  organizationId: null,
}

interface TenantContextProviderProps {
  children: ReactNode
}

export function TenantContextProvider({ children }: TenantContextProviderProps) {
  const { setCurrentUser, setOrganizations } = useAdminStore()

  useEffect(() => {
    // Initialize with mock data (in real app, fetch from Supabase)
    setCurrentUser(mockSuperAdmin)
    setOrganizations(mockOrganizations)
  }, [setCurrentUser, setOrganizations])

  return <>{children}</>
}
