"use client"

import { useCallback, useState } from "react"
import { useAudio } from "@/components/providers/audio-provider"

interface OptimisticActionOptions<T, R> {
  onOptimisticUpdate: (data: T) => void
  onRevert: () => void
  action: (data: T) => Promise<R>
  onSuccess?: (result: R, data: T) => void
  onError?: (error: Error, data: T) => void
}

export function useOptimisticAction<T, R>({
  onOptimisticUpdate,
  onRevert,
  action,
  onSuccess,
  onError,
}: OptimisticActionOptions<T, R>) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { playSuccess, playError } = useAudio()

  const execute = useCallback(
    async (data: T) => {
      setIsPending(true)
      setError(null)

      // Aplicar update optimista inmediatamente
      onOptimisticUpdate(data)

      try {
        const result = await action(data)
        playSuccess()
        onSuccess?.(result, data)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error desconocido")
        setError(error)
        playError()

        // Revertir cambios
        onRevert()
        onError?.(error, data)

        throw error
      } finally {
        setIsPending(false)
      }
    },
    [onOptimisticUpdate, onRevert, action, onSuccess, onError, playSuccess, playError],
  )

  return {
    execute,
    isPending,
    error,
  }
}
