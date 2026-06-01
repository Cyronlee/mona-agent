import { get } from "@/lib/api-client"

export interface SessionSummary {
  id: string
  title: string
  updatedAt: string
}

export function fetchSessions() {
  return get<SessionSummary[]>("/chat/sessions")
}

export function fetchSession(id: string) {
  return get<{
    id: string
    title: string
    messages: unknown[]
  }>(`/chat/sessions/${id}`)
}
