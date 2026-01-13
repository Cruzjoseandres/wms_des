import { z } from "zod"

// Schema para items de pedido
const orderItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  sku: z.string(),
  name: z.string(),
  quantity: z.coerce.number().int().positive("Cantidad debe ser mayor a 0"),
  unit: z.string(),
  lotNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// Schema para pedidos
export const orderSchema = z.object({
  orderNumber: z.string().optional(), // Generado automáticamente si no se proporciona

  customerId: z.string().min(1, "Cliente requerido"),

  customerName: z.string().min(2, "Nombre de cliente requerido"),

  customerAddress: z.string().min(5, "Dirección requerida"),

  priority: z.enum(["low", "normal", "high", "urgent"], {
    errorMap: () => ({ message: "Seleccione una prioridad válida" }),
  }),

  type: z.enum(["sale", "transfer", "return", "sample"], {
    errorMap: () => ({ message: "Seleccione un tipo válido" }),
  }),

  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un producto"),

  deliveryDate: z.coerce.date().optional(),

  notes: z.string().max(1000, "Notas no pueden exceder 1000 caracteres").optional(),

  warehouseId: z.string().min(1, "Almacén requerido"),

  shippingMethod: z.string().optional(),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderItemFormData = z.infer<typeof orderItemSchema>
