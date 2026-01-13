// Validadores de seguridad para requests

import { z } from "zod"

export const RequestLimits = {
  MAX_PAYLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_QUERY_PARAM_LENGTH: 1000,
  MAX_QUERY_PARAM_COUNT: 50,
  REQUEST_TIMEOUT: 30000, // 30 segundos
  MAX_ARRAY_SIZE: 1000,
  MAX_STRING_LENGTH: 10000,
}

export function validatePayloadSize(payload: string | undefined): void {
  if (payload && payload.length > RequestLimits.MAX_PAYLOAD_SIZE) {
    throw new Error(
      `Payload exceeds maximum size of ${RequestLimits.MAX_PAYLOAD_SIZE} bytes (received: ${payload.length})`,
    )
  }
}

export function validateQueryParams(params: Record<string, unknown>): void {
  const paramCount = Object.keys(params).length

  if (paramCount > RequestLimits.MAX_QUERY_PARAM_COUNT) {
    throw new Error(
      `Too many query parameters. Maximum: ${RequestLimits.MAX_QUERY_PARAM_COUNT}, received: ${paramCount}`,
    )
  }

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > RequestLimits.MAX_QUERY_PARAM_LENGTH) {
      throw new Error(
        `Query parameter '${key}' exceeds maximum length of ${RequestLimits.MAX_QUERY_PARAM_LENGTH} characters`,
      )
    }
  })
}

// Schema base para todas las requests
export const BaseRequestSchema = z.object({
  // Agregar campos comunes de validación
})

// Validadores para tipos comunes
export const CommonSchemas = {
  id: z.string().uuid("ID debe ser UUID válido"),
  email: z.string().email("Email inválido"),
  url: z.string().url("URL inválida"),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug inválido"),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,}$/, "Teléfono inválido"),
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
}

export function createSafeRequestValidator<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): z.infer<T> => {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validación fallida: ${error.errors.map((e) => e.message).join(", ")}`)
      }
      throw error
    }
  }
}
