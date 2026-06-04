import fs from "node:fs/promises"
import path from "node:path"
import { nanoid } from "nanoid"
import {
  sessionsDir,
  sessionJsonPath,
  sessionJsonlPath,
} from "./paths"
import { withFileLock } from "./lock"

export type ChatSession = {
  id: string
  title: string
  projectSlug: string
  createdAt: string
  updatedAt: string
}

async function ensureSessionsDir(projectSlug: string): Promise<void> {
  await fs.mkdir(sessionsDir(projectSlug), { recursive: true })
}

async function readSessionFile(filePath: string): Promise<ChatSession | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    return JSON.parse(raw) as ChatSession
  } catch {
    return null
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const tmp = `${filePath}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8")
  await fs.rename(tmp, filePath)
}

export async function listSessions(projectSlug: string): Promise<ChatSession[]> {
  await ensureSessionsDir(projectSlug)
  const entries = await fs.readdir(sessionsDir(projectSlug))
  const jsonFiles = entries.filter((name) => name.endsWith(".json"))
  const sessions: ChatSession[] = []
  for (const file of jsonFiles) {
    const session = await readSessionFile(
      path.join(sessionsDir(projectSlug), file),
    )
    if (session) sessions.push(session)
  }
  sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return sessions
}

export async function getSession(
  projectSlug: string,
  sessionId: string,
): Promise<ChatSession | null> {
  return readSessionFile(sessionJsonPath(projectSlug, sessionId))
}

export async function createSession(
  projectSlug: string,
  title: string,
): Promise<ChatSession> {
  await ensureSessionsDir(projectSlug)
  const now = new Date().toISOString()
  const session: ChatSession = {
    id: nanoid(),
    title: title.slice(0, 60),
    projectSlug,
    createdAt: now,
    updatedAt: now,
  }
  const filePath = sessionJsonPath(projectSlug, session.id)
  await writeJsonAtomic(filePath, session)
  await fs.writeFile(sessionJsonlPath(projectSlug, session.id), "", "utf-8")
  return session
}

export type SessionUpdate = {
  title?: string
  updatedAt?: string
}

export async function updateSession(
  projectSlug: string,
  sessionId: string,
  patch: SessionUpdate,
): Promise<ChatSession | null> {
  await ensureSessionsDir(projectSlug)
  const filePath = sessionJsonPath(projectSlug, sessionId)
  return withFileLock(filePath, async () => {
    const existing = await readSessionFile(filePath)
    if (!existing) return null
    const next: ChatSession = {
      ...existing,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      updatedAt: patch.updatedAt ?? new Date().toISOString(),
    }
    await writeJsonAtomic(filePath, next)
    return next
  })
}

export async function touchSession(
  projectSlug: string,
  sessionId: string,
): Promise<void> {
  await updateSession(projectSlug, sessionId, {})
}

export async function deleteSession(
  projectSlug: string,
  sessionId: string,
): Promise<boolean> {
  await ensureSessionsDir(projectSlug)
  const jsonPath = sessionJsonPath(projectSlug, sessionId)
  const jsonlPath = sessionJsonlPath(projectSlug, sessionId)
  const results = await Promise.allSettled([
    fs.unlink(jsonPath),
    fs.unlink(jsonlPath),
  ])
  const jsonRemoved = results[0].status === "fulfilled"
  const jsonlMissing =
    results[1].status === "rejected" &&
    (results[1] as PromiseRejectedResult).reason instanceof Error &&
    ((results[1] as PromiseRejectedResult).reason as NodeJS.ErrnoException).code ===
      "ENOENT"
  const jsonlRemoved = results[1].status === "fulfilled" || jsonlMissing
  return jsonRemoved && jsonlRemoved
}
