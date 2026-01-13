"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProductFormData } from "@/lib/schemas/product.schema"

// Tipos
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

// Datos mock para demo (hasta conectar con backend real)
const MOCK_PRODUCTS: Product[] = Array.from({ length: 100 }, (_, i) => ({
  id: `prod-${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, "0")}`,
  name: `Producto ${i + 1}`,
  description: `Descripción del producto ${i + 1}`,
  categoryId: `cat-${(i % 4) + 1}`,
  categoryName: ["Electrónicos", "Alimentos", "Textiles", "Químicos"][i % 4],
  unit: ["UND", "KG", "LT", "CJ"][i % 4],
  barcode: `750${String(i + 1).padStart(10, "0")}`,
  minStock: 10,
  maxStock: 100,
  currentStock: Math.floor(Math.random() * 150),
  cost: Math.floor(Math.random() * 100) + 10,
  price: Math.floor(Math.random() * 200) + 50,
  isActive: Math.random() > 0.1,
  requiresLot: Math.random() > 0.7,
  requiresExpiration: Math.random() > 0.8,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date().toISOString(),
}))

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
      // Simular latencia de red
      await new Promise((r) => setTimeout(r, 300))

      let filtered = [...MOCK_PRODUCTS]

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.sku.toLowerCase().includes(searchLower) ||
            p.barcode?.includes(searchLower),
        )
      }

      if (filters?.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === filters.categoryId)
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
    staleTime: 30 * 1000, // 30 segundos
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return MOCK_PRODUCTS.find((p) => p.id === id) || null
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Simular llamada API
      await new Promise((r) => setTimeout(r, 500))

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...data,
        currentStock: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Agregar a mock data
      MOCK_PRODUCTS.unshift(newProduct)

      return newProduct
    },
    onSuccess: () => {
      // Invalidar queries para refrescar listas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      await new Promise((r) => setTimeout(r, 500))

      const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
      if (index === -1) throw new Error("Producto no encontrado")

      MOCK_PRODUCTS[index] = {
        ...MOCK_PRODUCTS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return MOCK_PRODUCTS[index]
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })

      // Guardar estado anterior
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))

      // Optimistic update
      queryClient.setQueryData(productKeys.detail(id), (old: Product | undefined) =>
        old ? { ...old, ...data } : undefined,
      )

      return { previousProduct }
    },
    onError: (err, { id }, context) => {
      // Revertir en caso de error
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct)
      }
    },
    onSettled: (_, __, { id }) => {
      // Refrescar datos
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300))

      const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
      if (index === -1) throw new Error("Producto no encontrado")

      MOCK_PRODUCTS.splice(index, 1)
      return { success: true }
    },
    onMutate: async (id) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Guardar estado anterior
      const previousProducts = queryClient.getQueryData(productKeys.lists())

      // Optimistic delete - remover de la lista inmediatamente
      queryClient.setQueryData(productKeys.list({}), (old: ProductsResponse | undefined) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((p) => p.id !== id),
          total: old.total - 1,
        }
      })

      return { previousProducts }
    },
    onError: (err, id, context) => {
      // Revertir en caso de error
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
