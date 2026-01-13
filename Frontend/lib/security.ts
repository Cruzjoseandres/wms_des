// Utilidades de seguridad para prevenir vulnerabilidades comunes

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
} as const

export function verifyRequestOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  try {
    const originUrl = new URL(origin)
    return allowedOrigins.some((allowed) => {
      const allowedUrl = new URL(allowed)
      return originUrl.hostname === allowedUrl.hostname
    })
  } catch {
    return false
  }
}

export function createSecureHeaders(additionalHeaders: Record<string, string> = {}) {
  return {
    ...SECURITY_HEADERS,
    ...additionalHeaders,
  }
}
