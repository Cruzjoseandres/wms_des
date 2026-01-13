"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"

export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const router = useRouter()
  const [showPrompt, setShowPrompt] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const defaultMessage = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"

  // Manejar beforeunload (cierre de pestaña/navegador)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = message || defaultMessage
      return message || defaultMessage
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, message])

  // Función para navegar de forma segura
  const safeNavigate = useCallback(
    (path: string) => {
      if (isDirty) {
        setPendingNavigation(path)
        setShowPrompt(true)
      } else {
        router.push(path)
      }
    },
    [isDirty, router],
  )

  // Confirmar navegación
  const confirmNavigation = useCallback(() => {
    setShowPrompt(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [pendingNavigation, router])

  // Cancelar navegación
  const cancelNavigation = useCallback(() => {
    setShowPrompt(false)
    setPendingNavigation(null)
  }, [])

  return {
    showPrompt,
    confirmNavigation,
    cancelNavigation,
    safeNavigate,
  }
}
