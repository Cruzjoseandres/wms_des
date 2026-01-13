"use client"

import dynamic from "next/dynamic"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutGrid } from "lucide-react"

// Dynamic import to avoid SSR issues with canvas
const LayoutEditor = dynamic(() => import("@/components/layout-editor/layout-editor").then((mod) => mod.LayoutEditor), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-[240px] rounded-lg" />
        <div className="lg:col-span-2">
          <Skeleton className="h-[240px] rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  ),
})

export default function LayoutAlmacenPage() {
  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Layout de Almacén"
          description="Diseñador visual 2D para distribuir racks, zonas y ubicaciones"
          icon={<LayoutGrid className="w-6 h-6" />}
        />
        <LayoutEditor />
      </div>
    </MainLayout>
  )
}
