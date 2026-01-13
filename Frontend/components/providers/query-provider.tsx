"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mantener datos frescos por 30 segundos
            staleTime: 30 * 1000,
            // Mantener en caché por 5 minutos
            gcTime: 5 * 60 * 1000,
            // Reintentar 3 veces en caso de error (vital para WiFi inestable en almacén)
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch cuando la ventana vuelve a tener foco
            refetchOnWindowFocus: true,
            // No refetch automáticamente al montar
            refetchOnMount: false,
          },
          mutations: {
            // Reintentar mutaciones 2 veces
            retry: 2,
            retryDelay: 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
