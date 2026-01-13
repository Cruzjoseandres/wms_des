// Validación y acceso seguro a variables de entorno
// NUNCA exportar esto a cliente

const requiredEnvVars = [
  // Database
  // "DATABASE_URL",
  // API
  // "API_SECRET",
  // "API_KEY",
  // Auth
  // "NEXTAUTH_SECRET",
  // "NEXTAUTH_URL",
]

function validateEnv() {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.warn(`[Warning] Missing environment variables: ${missing.join(", ")}`)
  }
}

// Ejecutar validación en servidor
if (typeof window === "undefined") {
  validateEnv()
}

// Getter seguro para variables de entorno (solo servidor)
export function getServerEnv(key: string): string | undefined {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() debe ser llamado solo en servidor")
  }
  return process.env[key]
}

// Variables públicas seguras (si es necesario)
export const publicEnv = {
  // Agregar aquí solo variables públicas que necesiten exposición al cliente
  // Todas deben empezar con NEXT_PUBLIC_
}

// Validar que no haya secretos accidentales
export function assertNoSecretExposure() {
  if (typeof window !== "undefined") {
    const dangerousKeys = Object.keys(process.env).filter((key) => !key.startsWith("NEXT_PUBLIC_") && process.env[key])
    if (dangerousKeys.length > 0) {
      console.error("[Security] Secretos expuestos en cliente:", dangerousKeys)
    }
  }
}
