import { Hono } from "hono"
import { AgentRunner } from "../agent/runner.js"
import { prisma } from "../db/client.js"

export const chatRouter = new Hono()

/**
 * POST /api/chat
 *
 * Body (JSON):
 *   { messages: [{ role: "user", content: string }, ...], sessionId?: string }
 *
 * Compatible with the Vercel AI SDK `useChat` / `DefaultChatTransport` (UIMessage Stream Protocol).
 * The last user message is extracted and passed to AgentRunner.
 */
chatRouter.post("/", async (c) => {
  let body: {
    messages?: Array<{
      role: string
      content: string | Array<{ type: string; text?: string }>
      parts?: Array<{ type: string; text?: string }>
    }>
    sessionId?: string
  }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const messages = body.messages ?? []
  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  if (!lastUser) {
    return c.json({ error: "No user message found" }, 400)
  }

  // AI SDK v6 may send content as string or as parts array
  let userText: string
  if (typeof lastUser.content === "string" && lastUser.content) {
    userText = lastUser.content
  } else if (lastUser.parts && lastUser.parts.length > 0) {
    userText = lastUser.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
  } else if (Array.isArray(lastUser.content)) {
    userText = lastUser.content
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
  } else {
    return c.json({ error: "No user text found" }, 400)
  }

  return AgentRunner.run(body.sessionId ?? null, userText)
})

/**
 * GET /api/chat/sessions
 * Returns all sessions ordered by most recent update.
 */
chatRouter.get("/sessions", async (c) => {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return c.json(sessions)
})

/**
 * GET /api/chat/sessions/:id
 * Returns a single session with all its messages.
 */
chatRouter.get("/sessions/:id", async (c) => {
  const id = c.req.param("id")
  const session = await prisma.chatSession.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!session) return c.json({ error: "Session not found" }, 404)
  return c.json(session)
})

/**
 * GET /api/chat/jobs/:id
 * Returns a background job's status and logs.
 */
chatRouter.get("/jobs/:id", async (c) => {
  const id = c.req.param("id")
  const job = await prisma.backgroundJob.findUnique({ where: { id } })
  if (!job) return c.json({ error: "Job not found" }, 404)
  return c.json(job)
})
