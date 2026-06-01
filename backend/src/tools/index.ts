import fs from "fs/promises"
import path from "path"
import { tool } from "ai"
import { z } from "zod"
import { nanoid } from "nanoid"
import { prisma } from "../db/client.js"
import { processManager } from "../process-manager/index.js"

const MAX_FILE_LINES = 500
const DEFAULT_TIMEOUT_MS = 30_000
const WORKSPACE = process.env.AGENT_WORKSPACE ?? process.cwd()

// ─── Tool: read ──────────────────────────────────────────────────────────────

export const readTool = tool({
  description:
    "Read a file from the filesystem. If the file is too large and no line range is specified, only a window is returned with a warning.",
  parameters: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    lineStart: z.number().int().positive().optional().describe("1-indexed start line (inclusive)"),
    lineEnd: z.number().int().positive().optional().describe("1-indexed end line (inclusive)"),
  }),
  execute: async ({ path: filePath, lineStart, lineEnd }) => {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE, filePath)
    let content: string
    try {
      content = await fs.readFile(resolved, "utf-8")
    } catch (err: unknown) {
      return { error: `Cannot read file: ${(err as Error).message}` }
    }

    const lines = content.split("\n")
    const totalLines = lines.length

    if (lineStart !== undefined || lineEnd !== undefined) {
      const start = Math.max((lineStart ?? 1) - 1, 0)
      const end = Math.min((lineEnd ?? totalLines) - 1, totalLines - 1)
      const slice = lines.slice(start, end + 1).join("\n")
      return { content: slice, totalLines, returnedLines: [start + 1, end + 1] }
    }

    if (totalLines > MAX_FILE_LINES) {
      const slice = lines.slice(0, MAX_FILE_LINES).join("\n")
      return {
        content: slice,
        totalLines,
        returnedLines: [1, MAX_FILE_LINES],
        warning: `File has ${totalLines} lines. Only first ${MAX_FILE_LINES} lines returned. Use lineStart/lineEnd to read more.`,
      }
    }

    return { content, totalLines, returnedLines: [1, totalLines] }
  },
})

// ─── Tool: write ─────────────────────────────────────────────────────────────

export const writeTool = tool({
  description:
    "Write content to a file. Parent directories are created automatically (mkdir -p behavior).",
  parameters: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    content: z.string().describe("Full content to write"),
  }),
  execute: async ({ path: filePath, content }) => {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE, filePath)
    try {
      await fs.mkdir(path.dirname(resolved), { recursive: true })
      await fs.writeFile(resolved, content, "utf-8")
      return { success: true, path: resolved, bytesWritten: Buffer.byteLength(content, "utf-8") }
    } catch (err: unknown) {
      return { error: `Cannot write file: ${(err as Error).message}` }
    }
  },
})

// ─── Tool: edit ──────────────────────────────────────────────────────────────

function normalizeWhitespace(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim()
}

export const editTool = tool({
  description:
    "Perform a targeted search-and-replace on a file. Whitespace differences are ignored during matching. Use lineHint to disambiguate multiple matches.",
  parameters: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    search: z.string().describe("The exact block of text to find (whitespace-normalized)"),
    replace: z.string().describe("The replacement text"),
    lineHint: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Approximate line number to disambiguate when multiple matches exist"),
  }),
  execute: async ({ path: filePath, search, replace, lineHint }) => {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE, filePath)
    let original: string
    try {
      original = await fs.readFile(resolved, "utf-8")
    } catch (err: unknown) {
      return { error: `Cannot read file: ${(err as Error).message}` }
    }

    const normalizedSearch = normalizeWhitespace(search)
    const lines = original.split("\n")

    // Find all line indices where the normalized block could start
    const matchIndices: number[] = []
    for (let i = 0; i < lines.length; i++) {
      const candidate = lines.slice(i, i + search.split("\n").length).join("\n")
      if (normalizeWhitespace(candidate) === normalizedSearch) {
        matchIndices.push(i)
      }
    }

    if (matchIndices.length === 0) {
      return { error: "No match found. The search block does not exist in the file (even after whitespace normalization)." }
    }

    if (matchIndices.length > 1) {
      if (lineHint === undefined) {
        return {
          error: `Ambiguous: ${matchIndices.length} matches found at lines [${matchIndices.map((i) => i + 1).join(", ")}]. Provide lineHint to disambiguate.`,
        }
      }
      const closest = matchIndices.reduce((a, b) =>
        Math.abs(a - (lineHint - 1)) <= Math.abs(b - (lineHint - 1)) ? a : b,
      )
      matchIndices.length = 0
      matchIndices.push(closest)
    }

    const blockLineStart = matchIndices[0]
    const searchLineCount = search.split("\n").length
    const before = lines.slice(0, blockLineStart).join("\n")
    const after = lines.slice(blockLineStart + searchLineCount).join("\n")
    const updated = [before, replace, after].filter((s) => s !== "").join("\n")

    try {
      await fs.writeFile(resolved, updated, "utf-8")
      return { success: true, editedAtLine: blockLineStart + 1 }
    } catch (err: unknown) {
      return { error: `Cannot write file: ${(err as Error).message}` }
    }
  },
})

// ─── Tool: bash ──────────────────────────────────────────────────────────────

export const bashTool = tool({
  description:
    "Run a shell command. If background=true, the command is detached and a jobId is returned immediately for status tracking. Otherwise the command runs synchronously up to timeoutMs.",
  parameters: z.object({
    command: z.string().describe("The shell command to execute"),
    background: z
      .boolean()
      .optional()
      .default(false)
      .describe("If true, run asynchronously and return a jobId"),
    cwd: z.string().optional().describe("Working directory (defaults to AGENT_WORKSPACE)"),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(`Timeout in ms for foreground commands (default ${DEFAULT_TIMEOUT_MS})`),
  }),
  execute: async ({ command, background, cwd, timeoutMs }) => {
    const workDir = cwd ?? WORKSPACE

    if (background) {
      const job = await prisma.backgroundJob.create({
        data: {
          id: nanoid(),
          command,
          status: "running",
          cwd: workDir,
          logs: "",
        },
      })
      const pid = await processManager.spawn(job.id, command, workDir)
      return { jobId: job.id, pid, status: "running", message: "Background job started." }
    }

    // Foreground: run synchronously with timeout
    const timeout = timeoutMs ?? DEFAULT_TIMEOUT_MS
    const proc = Bun.spawn({
      cmd: ["bash", "-c", command],
      cwd: workDir,
      stdout: "pipe",
      stderr: "pipe",
      stdin: "ignore",
    })

    const timer = setTimeout(() => proc.kill(), timeout)

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    clearTimeout(timer)

    return {
      stdout: stdout.slice(0, 8000),
      stderr: stderr.slice(0, 2000),
      exitCode,
      timedOut: exitCode === null,
    }
  },
})

// ─── Tool: search_documents ──────────────────────────────────────────────────

export const searchDocumentsTool = tool({
  description:
    "Search documents in the document library. Returns a list of documents (without content) matching the optional folder and/or title query.",
  parameters: z.object({
    folder: z.string().optional().describe("Filter by folder name"),
    query: z.string().optional().describe("Search by title keyword"),
  }),
  execute: async ({ folder, query }) => {
    const where: Record<string, unknown> = {}
    if (folder) where.folder = folder
    if (query) where.title = { contains: query }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        folder: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return { documents, count: documents.length }
  },
})

// ─── Tool: get_document ──────────────────────────────────────────────────────

export const getDocumentTool = tool({
  description:
    "Get a single document by ID, including its full content.",
  parameters: z.object({
    id: z.string().describe("The document ID"),
  }),
  execute: async ({ id }) => {
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) return { error: "Document not found" }
    return document
  },
})

// ─── Tool: update_document ───────────────────────────────────────────────────

export const updateDocumentTool = tool({
  description:
    "Update a document's title, folder, or content. Only the provided fields are updated.",
  parameters: z.object({
    id: z.string().describe("The document ID"),
    title: z.string().optional().describe("New title"),
    folder: z.string().optional().describe("New folder name"),
    content: z.string().optional().describe("New content (Markdown)"),
  }),
  execute: async ({ id, title, folder, content }) => {
    const existing = await prisma.document.findUnique({ where: { id } })
    if (!existing) return { error: "Document not found" }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(folder !== undefined && { folder }),
        ...(content !== undefined && { content }),
      },
    })
    return document
  },
})

// ─── Tool: delete_document ───────────────────────────────────────────────────

export const deleteDocumentTool = tool({
  description:
    "Delete a document by ID.",
  parameters: z.object({
    id: z.string().describe("The document ID"),
  }),
  execute: async ({ id }) => {
    const existing = await prisma.document.findUnique({ where: { id } })
    if (!existing) return { error: "Document not found" }

    await prisma.document.delete({ where: { id } })
    return { success: true, message: `Document "${existing.title}" deleted.` }
  },
})

export const agentTools = {
  read: readTool,
  write: writeTool,
  edit: editTool,
  bash: bashTool,
  search_documents: searchDocumentsTool,
  get_document: getDocumentTool,
  update_document: updateDocumentTool,
  delete_document: deleteDocumentTool,
}
