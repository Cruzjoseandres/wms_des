import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "super_admin" | "admin" | "manager" | "operator" | "viewer"
export type ViewMode = "SUPER_ADMIN" | "CLIENT"

export interface Organization {
  id: string
  name: string
  slug: string
  plan: "free" | "pro" | "enterprise"
  logo?: string
  createdAt: string
  usersCount: number
  warehousesCount: number
  isActive: boolean
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  organizationId: string | null
  avatarUrl?: string
}

export const DEMO_USERS: { email: string; password: string; profile: UserProfile }[] = [
  {
    email: "admin@melidsoft.com",
    password: "admin123",
    profile: {
      id: "usr-super-001",
      email: "admin@melidsoft.com",
      fullName: "Super Administrador",
      role: "super_admin",
      organizationId: null,
      avatarUrl: undefined,
    },
  },
  {
    email: "operador@empresa.com",
    password: "operador123",
    profile: {
      id: "usr-op-001",
      email: "operador@empresa.com",
      fullName: "Juan Operador",
      role: "operator",
      organizationId: "org-001",
      avatarUrl: undefined,
    },
  },
  {
    email: "admin@farmacorp.com",
    password: "admin123",
    profile: {
      id: "usr-admin-001",
      email: "admin@farmacorp.com",
      fullName: "María Administradora",
      role: "admin",
      organizationId: "org-001",
      avatarUrl: undefined,
    },
  },
]

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: "org-001",
    name: "FarmaCorp S.A.",
    slug: "farmacorp",
    plan: "enterprise",
    createdAt: "2024-01-15",
    usersCount: 25,
    warehousesCount: 3,
    isActive: true,
  },
  {
    id: "org-002",
    name: "Distribuidora Central",
    slug: "dist-central",
    plan: "pro",
    createdAt: "2024-03-20",
    usersCount: 12,
    warehousesCount: 2,
    isActive: true,
  },
  {
    id: "org-003",
    name: "LogiTech Solutions",
    slug: "logitech-sol",
    plan: "pro",
    createdAt: "2024-06-10",
    usersCount: 8,
    warehousesCount: 1,
    isActive: true,
  },
  {
    id: "org-004",
    name: "MegaStock Inc.",
    slug: "megastock",
    plan: "enterprise",
    createdAt: "2024-02-28",
    usersCount: 45,
    warehousesCount: 5,
    isActive: true,
  },
  {
    id: "org-005",
    name: "Bodega Express",
    slug: "bodega-express",
    plan: "free",
    createdAt: "2024-08-05",
    usersCount: 3,
    warehousesCount: 1,
    isActive: false,
  },
]

interface AdminState {
  // Auth state
  isAuthenticated: boolean
  currentUser: UserProfile | null
  isSuperAdmin: boolean

  viewMode: ViewMode

  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean

  // Impersonation state
  impersonatingOrgId: string | null
  impersonatingOrg: Organization | null

  // Organizations list (for super admin)
  organizations: Organization[]

  // Actions
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  setCurrentUser: (user: UserProfile | null) => void
  setImpersonation: (orgId: string | null, org?: Organization | null) => void
  clearImpersonation: () => void
  setOrganizations: (orgs: Organization[]) => void
  addOrganization: (org: Organization) => void

  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void

  // Computed
  getEffectiveOrgId: () => string | null
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      isSuperAdmin: false,
      viewMode: "CLIENT",
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      impersonatingOrgId: null,
      impersonatingOrg: null,
      organizations: DEMO_ORGANIZATIONS,

      login: (email, password) => {
        const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
        if (user) {
          const isSuperAdmin = user.profile.role === "super_admin"
          set({
            isAuthenticated: true,
            currentUser: user.profile,
            isSuperAdmin,
            viewMode: isSuperAdmin ? "SUPER_ADMIN" : "CLIENT",
          })
          return { success: true }
        }
        return { success: false, error: "Credenciales inválidas" }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          isSuperAdmin: false,
          viewMode: "CLIENT",
          impersonatingOrgId: null,
          impersonatingOrg: null,
        })
      },

      setCurrentUser: (user) =>
        set({
          currentUser: user,
          isSuperAdmin: user?.role === "super_admin",
          isAuthenticated: !!user,
        }),

      setImpersonation: (orgId, org = null) =>
        set({
          impersonatingOrgId: orgId,
          impersonatingOrg: org,
          viewMode: "CLIENT",
        }),

      clearImpersonation: () =>
        set({
          impersonatingOrgId: null,
          impersonatingOrg: null,
        }),

      setOrganizations: (orgs) => set({ organizations: orgs }),

      addOrganization: (org) =>
        set((state) => ({
          organizations: [...state.organizations, org],
        })),

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === "SUPER_ADMIN" ? "CLIENT" : "SUPER_ADMIN",
        })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      getEffectiveOrgId: () => {
        const state = get()
        if (state.isSuperAdmin && state.impersonatingOrgId) {
          return state.impersonatingOrgId
        }
        return state.currentUser?.organizationId || null
      },
    }),
    {
      name: "sgla-admin-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        isSuperAdmin: state.isSuperAdmin,
        impersonatingOrgId: state.impersonatingOrgId,
        impersonatingOrg: state.impersonatingOrg,
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        organizations: state.organizations,
      }),
    },
  ),
)
