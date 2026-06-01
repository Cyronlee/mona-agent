const API_BASE = "http://localhost:5679"

interface RequestOptions extends RequestInit {
  /** Path under /api, e.g. "/documents" */
  path: string
}

async function request<T>(options: RequestOptions): Promise<T> {
  const { path, ...init } = options
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`
    )
  }
  return res.json() as Promise<T>
}

export function get<T>(path: string, params?: Record<string, string>) {
  const qs = params
    ? "?" + new URLSearchParams(params).toString()
    : ""
  return request<T>({ path: path + qs, method: "GET" })
}

export function post<T>(path: string, body?: unknown) {
  return request<T>({
    path,
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

export function patch<T>(path: string, body?: unknown) {
  return request<T>({
    path,
    method: "PATCH",
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

export function del<T>(path: string) {
  return request<T>({ path, method: "DELETE" })
}
