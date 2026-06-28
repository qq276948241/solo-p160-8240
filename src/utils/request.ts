import type { ApiResponse } from '../../shared/index.js'

export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  return res.json() as Promise<ApiResponse<T>>
}

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  let fullUrl = url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const query = searchParams.toString()
    if (query) {
      fullUrl += `?${query}`
    }
  }
  return request<T>(fullUrl, { method: 'GET' })
}

export async function post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function del<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  })
}
