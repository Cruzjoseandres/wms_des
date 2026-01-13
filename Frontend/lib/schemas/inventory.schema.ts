import { z } from "zod"

// Schema para movimientos de inventario
export const inventoryMovementSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),

  locationId: z.string().min(1, "Ubicación requerida"),

  quantity: z.coerce.number().int().positive("Cantidad debe ser mayor a 0"),

  type: z.enum(["in", "out", "adjustment", "transfer"], {
    errorMap: () => ({ message: "Tipo de movimiento inválido" }),
  }),

  reason: z.string().min(3, "Motivo requerido").max(500),

  referenceNumber: z.string().optional(),

  lotNumber: z.string().optional(),

  expirationDate: z.coerce.date().optional(),

  notes: z.string().max(1000).optional(),
})

export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>

// Schema para conteo de inventario
export const inventoryCountSchema = z.object({
  locationId: z.string().min(1, "Ubicación requerida"),

  productId: z.string().min(1, "Producto requerido"),

  systemQuantity: z.coerce.number().int().min(0),

  countedQuantity: z.coerce.number().int().min(0, "Cantidad contada no puede ser negativa"),

  lotNumber: z.string().optional(),

  notes: z.string().max(500).optional(),
})

export type InventoryCountFormData = z.infer<typeof inventoryCountSchema>
