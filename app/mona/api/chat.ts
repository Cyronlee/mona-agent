// Client-side API client for the agent coding chat feature.
// All types mirror the JSON shapes returned by the chat Route Handlers.

export type ChatSession = {
  id: string;
  title: string;
  projectSlug: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCallsJson?: string | null;
  createdAt: string;
};

export type ChatSessionDetail = ChatSession & {
  messages: ChatMessage[];
};

export type BackgroundJob = {
  id: string;
  command: string;
  cwd: string;
  pid: number | null;
  status: "running" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export function listSessions(projectSlug: string): Promise<ChatSession[]> {
  return apiFetch(`/api/projects/${projectSlug}/chat/sessions`);
}

export function getSession(
  projectSlug: string,
  sessionId: string,
): Promise<ChatSessionDetail> {
  return apiFetch(`/api/projects/${projectSlug}/chat/sessions/${sessionId}`);
}

export function deleteSession(
  projectSlug: string,
  sessionId: string,
): Promise<{ ok: true }> {
  return apiDelete(`/api/projects/${projectSlug}/chat/sessions/${sessionId}`);
}

export function getJob(
  projectSlug: string,
  jobId: string,
): Promise<BackgroundJob> {
  return apiFetch(`/api/projects/${projectSlug}/chat/jobs/${jobId}`);
}
