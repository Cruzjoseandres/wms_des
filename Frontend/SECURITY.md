# Política de Seguridad - SGLA WMS

## Vulnerabilidades Corregidas

### CVE-2025-55184 & CVE-2025-67779 (DoS - Alta gravedad)
**Estado**: ✅ PARCHADO en Next.js 16.0.10

Solicitudes HTTP especialmente diseñadas podían provocar bucles infinitos en Server Components.

**Mitigation**:
- Next.js actualizado a 16.0.10
- Timeouts implementados en cliente API (30s max)
- Validación de tamaño de payload (10MB max)

### CVE-2025-55183 (Source Code Disclosure - Gravedad media)
**Estado**: ✅ PARCHADO en Next.js 16.0.10

Una solicitud específica podía revelar código fuente compilado de Server Functions.

**Mitigation**:
- Next.js actualizado a 16.0.10
- Header `X-Content-Type-Options: nosniff` implementado
- Variables de entorno validadas y nunca expuestas en cliente
- Secretos únicamente accedidos vía variables de entorno en runtime

## Mejores Prácticas

### Variables de Entorno
\`\`\`
✅ CORRECTO:
- const secret = process.env.API_KEY
- Accedido solo en Server Components/Actions
- Nunca logeado en cliente

❌ INCORRECTO:
- export const secret = "hardcoded-value"
- Usar en componentes cliente
- Exponer en error messages
\`\`\`

### Request Validation
- Todos los payloads validados con Zod
- Tamaño máximo: 10MB por request
- Timeout: 30 segundos por request
- Query params: máximo 1000 caracteres por parámetro

### CORS & Origin Verification
- Headers de seguridad configurados en next.config.mjs
- Verificación de origen antes de aceptar requests
- No exponer detalles de error a clientes no autenticados

## Actualización Recomendada

Ejecutar después de hacer pull:
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

## Reportar Vulnerabilidades

Para reportar vulnerabilidades de seguridad, enviar email a: **security@sgla.dev** (configurar según necesario)

No abrir issues públicos para vulnerabilidades no parcheadas.
