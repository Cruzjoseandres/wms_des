import { z } from "zod"

// Schema base para productos
export const productSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU debe tener al menos 3 caracteres")
    .max(50, "SKU no puede exceder 50 caracteres")
    .regex(/^[A-Z0-9-]+$/i, "SKU solo puede contener letras, números y guiones"),

  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(200, "Nombre no puede exceder 200 caracteres"),

  description: z.string().max(1000, "Descripción no puede exceder 1000 caracteres").optional(),

  categoryId: z.string().min(1, "Debe seleccionar una categoría"),

  subcategoryId: z.string().optional(),

  barcode: z
    .string()
    .regex(/^[0-9]{8,14}$/, "Código de barras debe tener entre 8 y 14 dígitos")
    .optional()
    .or(z.literal("")),

  unit: z.enum(["UND", "KG", "LT", "MT", "CJ", "PQ"], {
    errorMap: () => ({ message: "Seleccione una unidad válida" }),
  }),

  weight: z.coerce.number().min(0, "Peso no puede ser negativo").optional(),

  volume: z.coerce.number().min(0, "Volumen no puede ser negativo").optional(),

  minStock: z.coerce.number().int().min(0, "Stock mínimo no puede ser negativo").default(0),

  maxStock: z.coerce.number().int().min(0, "Stock máximo no puede ser negativo").optional(),

  reorderPoint: z.coerce.number().int().min(0, "Punto de reorden no puede ser negativo").optional(),

  cost: z.coerce.number().min(0, "Costo no puede ser negativo").optional(),

  price: z.coerce.number().min(0, "Precio no puede ser negativo").optional(),

  isActive: z.boolean().default(true),

  requiresLot: z.boolean().default(false),

  requiresExpiration: z.boolean().default(false),

  hazardous: z.boolean().default(false),

  temperatureControlled: z.boolean().default(false),

  minTemperature: z.coerce.number().optional(),

  maxTemperature: z.coerce.number().optional(),
})

// Refinar para validaciones cruzadas
export const productSchemaRefined = productSchema.refine(
  (data) => {
    if (data.maxStock && data.minStock > data.maxStock) {
      return false
    }
    return true
  },
  {
    message: "Stock mínimo no puede ser mayor que stock máximo",
    path: ["minStock"],
  },
)

export type ProductFormData = z.infer<typeof productSchema>

// Schema para búsqueda/filtros
export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  hasStock: z.boolean().optional(),
})

export type ProductFilterData = z.infer<typeof productFilterSchema>
