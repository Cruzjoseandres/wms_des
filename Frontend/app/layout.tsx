import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TenantContextProvider } from "@/components/admin/tenant-context-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { HotkeysProvider } from "@/components/providers/hotkeys-provider"
import { AudioProvider } from "@/components/providers/audio-provider"
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SGLA - Sistema de Gestión Logística para Almacenes",
  description: "Soluciones Logísticas Integrales - WMS",
  generator: 'v0.app',
  manifest: '/manifest.json',
  keywords: ['WMS', 'almacén', 'logística', 'inventario', 'SGLA'],
  authors: [{ name: 'SGLA' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SGLA WMS',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'SGLA WMS',
    title: 'SGLA - Sistema de Gestión Logística para Almacenes',
    description: 'Soluciones Logísticas Integrales - WMS',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        {/* PWA Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
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
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}

