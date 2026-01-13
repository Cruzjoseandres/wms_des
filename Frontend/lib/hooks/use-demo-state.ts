"use client"

import { useState, useEffect } from "react"

/**
 * Hook para persistir estado en LocalStorage durante la demo.
 * Útil para que los campos de los formularios mantengan su valor al recargar.
 */
export function useDemoState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Inicializar estado con el valor de LocalStorage o el valor por defecto
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue

    try {
      const saved = localStorage.getItem(`demo_${key}`)
      return saved ? JSON.parse(saved) : defaultValue
    } catch (e) {
      console.error("[v0] Error reading from localStorage:", e)
      return defaultValue
    }
  })

  // Sincronizar con LocalStorage cuando el estado cambie
  useEffect(() => {
    try {
      localStorage.setItem(`demo_${key}`, JSON.stringify(state))
    } catch (e) {
      console.error("[v0] Error writing to localStorage:", e)
    }
  }, [key, state])

  return [state, setState]
}
