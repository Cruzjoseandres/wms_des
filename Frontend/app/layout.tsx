import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TenantContextProvider } from "@/components/admin/tenant-context-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { HotkeysProvider } from "@/components/providers/hotkeys-provider"
import { AudioProvider } from "@/components/providers/audio-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SGLA - Sistema de Gestión Logística para Almacenes",
  description: "Soluciones Logísticas Integrales - WMS",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="sgla-theme"
        >
          <QueryProvider>
            <AudioProvider>
              <HotkeysProvider>
                <TenantContextProvider>{children}</TenantContextProvider>
              </HotkeysProvider>
            </AudioProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
