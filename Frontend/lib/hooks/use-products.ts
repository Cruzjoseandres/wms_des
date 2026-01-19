"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProductFormData } from "@/lib/schemas/product.schema"
import { ItemService, type ItemBackend } from "@/lib/api/item.service"

// Tipos reflejando el frontend, mapeados desde el backend
export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  categoryId: string
  categoryName?: string
  unit: string
  barcode?: string
  minStock: number
  maxStock?: number
  currentStock: number
  cost?: number
  price?: number
  isActive: boolean
  requiresLot: boolean
  requiresExpiration: boolean
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

// Mapper helper
const mapItemToProduct = (item: ItemBackend): Product => ({
  id: String(item.id),
  sku: item.codigo,
  name: item.descripcion,
  description: item.descripcion,
  categoryId: item.codSubcategoria || "general",
  categoryName: "General", // Placeholder
  unit: item.unidadMedida || "UND",
  barcode: item.codigo, // Usamos código como barcode por ahora
  minStock: 10,
  maxStock: 1000,
  currentStock: Number(item.stock) || 0,
  cost: 0,
  price: Number(item.precio) || 0,
  isActive: item.estado === 1,
  requiresLot: true, // Default
  requiresExpiration: true, // Default
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// Hooks
export function useProducts(filters?: { search?: string; categoryId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: async () => {
      // Fetch real data
      const items = await ItemService.getAll()

      // Client-side filtering (since backend might not support it yet)
      let filtered = items.map(mapItemToProduct)

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.sku.toLowerCase().includes(searchLower) ||
            (p.barcode && p.barcode.includes(searchLower)),
        )
      }

      if (filters?.isActive !== undefined) {
        filtered = filtered.filter((p) => p.isActive === filters.isActive)
      }

      return {
        data: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      } as ProductsResponse
    },
    // Mantener datos frescos por 30 segundos
    staleTime: 30 * 1000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      // Try to fetch specific item, handle mismatch of string/number id
      try {
        const item = await ItemService.getById(Number(id))
        return mapItemToProduct(item)
      } catch (e) {
        return null
      }
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // TODO: Implement create in ItemService and backend
      // Por ahora lanzamos error o simulamos
      throw new Error("Creación de producto no implementada en backend aún")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      // TODO: Implement update in ItemService
      throw new Error("Actualización no disponible")
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implement delete in ItemService
      throw new Error("Eliminación no disponible")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

