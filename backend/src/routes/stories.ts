import { Hono } from "hono"
import { prisma } from "../db/client.js"

export const storiesRouter = new Hono()

const ALLOWED: Record<string, string[]> = {
  BACKLOG: ["IN_PROGRESS", "BLOCKED", "CANCELLED"],
  IN_PROGRESS: ["BACKLOG", "IN_REVIEW", "BLOCKED", "CANCELLED"],
  IN_REVIEW: ["IN_PROGRESS", "DONE", "BLOCKED", "CANCELLED"],
  DONE: [],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  CANCELLED: [],
}

/**
 * GET /api/stories
 * Returns all story cards, optionally filtered by ?status=BACKLOG
 */
storiesRouter.get("/", async (c) => {
  const status = c.req.query("status")
  const where = status ? { status: status as never } : undefined
  const stories = await prisma.storyCard.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { document: { select: { id: true, title: true, folder: true } } },
  })
  return c.json(stories)
})

/**
 * POST /api/stories
 * Creates a new story card.
 */
storiesRouter.post("/", async (c) => {
  let body: {
    title?: string
    content?: string
    priority?: string
    documentId?: string
    tags?: string[]
  }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  if (!body.title) {
    return c.json({ error: "title is required" }, 400)
  }

  const story = await prisma.storyCard.create({
    data: {
      title: body.title,
      content: body.content ?? "",
      priority: body.priority ?? "medium",
      documentId: body.documentId ?? null,
      tags: body.tags ? JSON.stringify(body.tags) : "[]",
    },
    include: { document: { select: { id: true, title: true, folder: true } } },
  })

  await prisma.storyStatusLog.create({
    data: {
      cardId: story.id,
      fromStatus: null,
      toStatus: "BACKLOG",
    },
  })

  return c.json(story, 201)
})

/**
 * GET /api/stories/:id
 * Returns a single story card with statusLogs.
 */
storiesRouter.get("/:id", async (c) => {
  const id = c.req.param("id")
  const story = await prisma.storyCard.findUnique({
    where: { id },
    include: {
      statusLogs: { orderBy: { createdAt: "asc" } },
      document: { select: { id: true, title: true, folder: true } },
    },
  })
  if (!story) return c.json({ error: "Story not found" }, 404)
  return c.json(story)
})

/**
 * PATCH /api/stories/:id
 * Updates story fields (title, content, priority, tags).
 */
storiesRouter.patch("/:id", async (c) => {
  const id = c.req.param("id")
  let body: {
    title?: string
    content?: string
    priority?: string
    tags?: string[]
  }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const existing = await prisma.storyCard.findUnique({ where: { id } })
  if (!existing) return c.json({ error: "Story not found" }, 404)

  const story = await prisma.storyCard.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.tags !== undefined && { tags: JSON.stringify(body.tags) }),
    },
    include: { document: { select: { id: true, title: true, folder: true } } },
  })
  return c.json(story)
})

/**
 * PATCH /api/stories/:id/status
 * Transitions story status. Validates allowed transitions.
 */
storiesRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id")
  let body: { status?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  if (!body.status) {
    return c.json({ error: "status is required" }, 400)
  }

  const existing = await prisma.storyCard.findUnique({ where: { id } })
  if (!existing) return c.json({ error: "Story not found" }, 404)

  const fromStatus = existing.status
  const toStatus = body.status

  const allowed = ALLOWED[fromStatus] ?? []
  if (!allowed.includes(toStatus)) {
    return c.json(
      {
        error: `Transition from ${fromStatus} to ${toStatus} is not allowed`,
      },
      400,
    )
  }

  const story = await prisma.storyCard.update({
    where: { id },
    data: { status: toStatus as never },
    include: { document: { select: { id: true, title: true, folder: true } } },
  })

  await prisma.storyStatusLog.create({
    data: {
      cardId: id,
      fromStatus: fromStatus,
      toStatus: toStatus as never,
    },
  })

  return c.json(story)
})

/**
 * DELETE /api/stories/:id
 * Deletes a story card.
 */
storiesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id")
  const existing = await prisma.storyCard.findUnique({ where: { id } })
  if (!existing) return c.json({ error: "Story not found" }, 404)

  await prisma.storyCard.delete({ where: { id } })
  return c.json({ success: true })
})
