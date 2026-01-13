"use client"

import { useAdminStore } from "@/lib/stores/admin-store"
import { useMemo } from "react"

/**
 * Hook para obtener el ID de organización efectivo
 * Si el super admin está simulando una empresa, devuelve ese ID
 * De lo contrario, devuelve el ID de la organización del usuario actual
 */
export function useTenant() {
  const { isSuperAdmin, impersonatingOrgId, impersonatingOrg, currentUser, organizations } = useAdminStore()

  const effectiveOrgId = useMemo(() => {
    if (isSuperAdmin && impersonatingOrgId) {
      return impersonatingOrgId
    }
    return currentUser?.organizationId || null
  }, [isSuperAdmin, impersonatingOrgId, currentUser?.organizationId])

  const effectiveOrg = useMemo(() => {
    if (isSuperAdmin && impersonatingOrg) {
      return impersonatingOrg
    }
    if (currentUser?.organizationId) {
      return organizations.find((org) => org.id === currentUser.organizationId) || null
    }
    return null
  }, [isSuperAdmin, impersonatingOrg, currentUser?.organizationId, organizations])

  const isImpersonating = isSuperAdmin && !!impersonatingOrgId

  return {
    effectiveOrgId,
    effectiveOrg,
    isImpersonating,
    isSuperAdmin,
  }
}

/**
 * Hook para construir queries filtradas por tenant
 */
export function useTenantQuery() {
  const { effectiveOrgId, isImpersonating, isSuperAdmin } = useTenant()

  /**
   * Añade el filtro de organización a una query de Supabase
   */
  const withOrgFilter = <T extends { eq: (column: string, value: string) => T }>(query: T): T => {
    if (effectiveOrgId) {
      return query.eq("organization_id", effectiveOrgId)
    }
    return query
  }

  /**
   * Devuelve los parámetros para añadir a una query fetch
   */
  const getQueryParams = () => {
    if (effectiveOrgId) {
      return { organization_id: effectiveOrgId }
    }
    return {}
  }

  return {
    effectiveOrgId,
    isImpersonating,
    isSuperAdmin,
    withOrgFilter,
    getQueryParams,
  }
}
