import { Hono } from "hono"
import { prisma } from "../db/client.js"

export const documentsRouter = new Hono()

/**
 * GET /api/documents/folders
 * Returns all distinct folder names.
 */
documentsRouter.get("/folders", async (c) => {
  const rows = await prisma.document.findMany({
    distinct: ["folder"],
    select: { folder: true },
    orderBy: { folder: "asc" },
  })
  return c.json(rows.map((r) => r.folder))
})

/**
 * GET /api/documents
 * Returns all documents, optionally filtered by folder.
 */
documentsRouter.get("/", async (c) => {
  const folder = c.req.query("folder")
  const where = folder ? { folder } : undefined
  const documents = await prisma.document.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  })
  return c.json(documents)
})

/**
 * POST /api/documents
 * Creates a new document. Body: { folder, title, content }
 */
documentsRouter.post("/", async (c) => {
  let body: { folder?: string; title?: string; content?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  if (!body.folder || !body.title) {
    return c.json({ error: "folder and title are required" }, 400)
  }

  const document = await prisma.document.create({
    data: {
      folder: body.folder,
      title: body.title,
      content: body.content ?? "",
    },
  })
  return c.json(document, 201)
})

/**
 * GET /api/documents/:id
 * Returns a single document.
 */
documentsRouter.get("/:id", async (c) => {
  const id = c.req.param("id")
  const document = await prisma.document.findUnique({ where: { id } })
  if (!document) return c.json({ error: "Document not found" }, 404)
  return c.json(document)
})

/**
 * PATCH /api/documents/:id
 * Updates a document. Body: { title?, folder?, content? }
 */
documentsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id")
  let body: { title?: string; folder?: string; content?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const existing = await prisma.document.findUnique({ where: { id } })
  if (!existing) return c.json({ error: "Document not found" }, 404)

  const document = await prisma.document.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.folder !== undefined && { folder: body.folder }),
      ...(body.content !== undefined && { content: body.content }),
    },
  })
  return c.json(document)
})

/**
 * DELETE /api/documents/:id
 * Deletes a document.
 */
documentsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id")
  const existing = await prisma.document.findUnique({ where: { id } })
  if (!existing) return c.json({ error: "Document not found" }, 404)

  await prisma.document.delete({ where: { id } })
  return c.json({ success: true })
})
