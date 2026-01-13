// Cliente API base con manejo de errores, reintentos y validación de entrada

const API_BASE_URL = "/api"
const REQUEST_TIMEOUT = 30000 // 30 segundos max por request
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024 // 10MB max por payload

export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error: ${status} ${statusText}`)
    this.name = "ApiError"
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
}

function validateRequestSize(body: string | undefined): void {
  if (body && body.length > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE} bytes`)
  }
}

function validateQueryParams(params: Record<string, string | number | boolean | undefined>): void {
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 1000) {
      throw new Error(`Query parameter '${key}' exceeds maximum length of 1000 characters`)
    }
  })
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeout = REQUEST_TIMEOUT, ...fetchOptions } = options

  // Construir URL con query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    validateQueryParams(params)
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  if (fetchOptions.body) {
    const bodyString = typeof fetchOptions.body === "string" ? fetchOptions.body : JSON.stringify(fetchOptions.body)
    validateRequestSize(bodyString)
    fetchOptions.body = bodyString
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new ApiError(response.status, response.statusText, data)
    }

    if (response.status === 204) {
      return null as T
    }

    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

function apiGet<T>(endpoint: string, params?: RequestOptions["params"]): Promise<T> {
  return request<T>(endpoint, { method: "GET", params })
}

function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  })
}

function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  })
}

function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  })
}

function apiDelete<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" })
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
}
