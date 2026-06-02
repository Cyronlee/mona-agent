import fs from "node:fs/promises"
import { spawn } from "node:child_process"
import path from "node:path"
import { tool } from "ai"
import { z } from "zod"
import { agentWorkspace } from "../runtime/paths"
import { processManager } from "../runtime/process-manager"

const MAX_FILE_LINES = 500
const DEFAULT_TIMEOUT_MS = 30_000

function resolvePath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(agentWorkspace(), filePath)
}

type ReadResult = {
  content?: string
  totalLines?: number
  returnedLines?: [number, number]
  warning?: string
  error?: string
}

export const readTool = tool({
  description:
    "Read a file from the filesystem. If the file is too large and no line range is specified, only a window is returned with a warning.",
  inputSchema: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    lineStart: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("1-indexed start line (inclusive)"),
    lineEnd: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("1-indexed end line (inclusive)"),
  }),
  execute: async ({ path: filePath, lineStart, lineEnd }): Promise<ReadResult> => {
    const resolved = resolvePath(filePath)
    let content: string
    try {
      content = await fs.readFile(resolved, "utf-8")
    } catch (err) {
      return { error: `Cannot read file: ${(err as Error).message}` }
    }

    const lines = content.split("\n")
    const totalLines = lines.length

    if (lineStart !== undefined || lineEnd !== undefined) {
      const start = Math.max((lineStart ?? 1) - 1, 0)
      const end = Math.min((lineEnd ?? totalLines) - 1, totalLines - 1)
      const slice = lines.slice(start, end + 1).join("\n")
      return {
        content: slice,
        totalLines,
        returnedLines: [start + 1, end + 1],
      }
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

type WriteResult = {
  success?: boolean
  path?: string
  bytesWritten?: number
  error?: string
}

export const writeTool = tool({
  description:
    "Write content to a file. Parent directories are created automatically (mkdir -p behavior).",
  inputSchema: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    content: z.string().describe("Full content to write"),
  }),
  execute: async ({ path: filePath, content }): Promise<WriteResult> => {
    const resolved = resolvePath(filePath)
    try {
      await fs.mkdir(path.dirname(resolved), { recursive: true })
      await fs.writeFile(resolved, content, "utf-8")
      return {
        success: true,
        path: resolved,
        bytesWritten: Buffer.byteLength(content, "utf-8"),
      }
    } catch (err) {
      return { error: `Cannot write file: ${(err as Error).message}` }
    }
  },
})

function normalizeWhitespace(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim()
}

type EditResult = {
  success?: boolean
  editedAtLine?: number
  error?: string
}

export const editTool = tool({
  description:
    "Perform a targeted search-and-replace on a file. Whitespace differences are ignored during matching. Use lineHint to disambiguate multiple matches.",
  inputSchema: z.object({
    path: z.string().describe("Absolute or workspace-relative file path"),
    search: z
      .string()
      .describe("The exact block of text to find (whitespace-normalized)"),
    replace: z.string().describe("The replacement text"),
    lineHint: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        "Approximate line number to disambiguate when multiple matches exist",
      ),
  }),
  execute: async ({
    path: filePath,
    search,
    replace,
    lineHint,
  }): Promise<EditResult> => {
    const resolved = resolvePath(filePath)
    let original: string
    try {
      original = await fs.readFile(resolved, "utf-8")
    } catch (err) {
      return { error: `Cannot read file: ${(err as Error).message}` }
    }

    const normalizedSearch = normalizeWhitespace(search)
    const lines = original.split("\n")
    const searchLineCount = search.split("\n").length

    const matchIndices: number[] = []
    for (let i = 0; i <= lines.length - searchLineCount; i++) {
      const candidate = lines.slice(i, i + searchLineCount).join("\n")
      if (normalizeWhitespace(candidate) === normalizedSearch) {
        matchIndices.push(i)
      }
    }

    if (matchIndices.length === 0) {
      return {
        error:
          "No match found. The search block does not exist in the file (even after whitespace normalization).",
      }
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
    const before = lines.slice(0, blockLineStart)
    const after = lines.slice(blockLineStart + searchLineCount)
    const updated = [...before, replace, ...after].join("\n")

    try {
      await fs.writeFile(resolved, updated, "utf-8")
      return { success: true, editedAtLine: blockLineStart + 1 }
    } catch (err) {
      return { error: `Cannot write file: ${(err as Error).message}` }
    }
  },
})

type BashResult = {
  stdout?: string
  stderr?: string
  exitCode?: number | null
  timedOut?: boolean
  jobId?: string
  pid?: number | null
  status?: string
  message?: string
}

export const bashTool = tool({
  description:
    "Run a shell command. If background=true, the command is detached and a jobId is returned immediately for status tracking. Otherwise the command runs synchronously up to timeoutMs.",
  inputSchema: z.object({
    command: z.string().describe("The shell command to execute"),
    background: z
      .boolean()
      .optional()
      .default(false)
      .describe("If true, run asynchronously and return a jobId"),
    cwd: z
      .string()
      .optional()
      .describe("Working directory (defaults to AGENT_WORKSPACE)"),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        `Timeout in ms for foreground commands (default ${DEFAULT_TIMEOUT_MS})`,
      ),
    projectSlug: z
      .string()
      .optional()
      .describe(
        "Project slug to scope background jobs (required for background=true)",
      ),
  }),
  execute: async ({
    command,
    background,
    cwd,
    timeoutMs,
    projectSlug,
  }): Promise<BashResult> => {
    const workDir = cwd ?? agentWorkspace()

    if (background) {
      const scope = projectSlug ?? "_default"
      const job = await processManager.createAndSpawn(scope, command, workDir)
      return {
        jobId: job.id,
        pid: job.pid,
        status: job.status,
        message: "Background job started.",
      }
    }

    const timeout = timeoutMs ?? DEFAULT_TIMEOUT_MS
    return new Promise<BashResult>((resolve) => {
      const child = spawn("bash", ["-c", command], {
        cwd: workDir,
        stdio: ["ignore", "pipe", "pipe"],
      })

      const decoder = new TextDecoder("utf-8")
      const stdoutChunks: Buffer[] = []
      const stderrChunks: Buffer[] = []

      child.stdout?.on("data", (buf: Buffer) => {
        stdoutChunks.push(buf)
      })
      child.stderr?.on("data", (buf: Buffer) => {
        stderrChunks.push(buf)
      })

      let timedOut = false
      const timer = setTimeout(() => {
        timedOut = true
        try {
          child.kill("SIGTERM")
        } catch {
          // ignore
        }
      }, timeout)

      child.on("error", () => {
        clearTimeout(timer)
        resolve({ stdout: "", stderr: "", exitCode: null, timedOut })
      })

      child.on("close", (code) => {
        clearTimeout(timer)
        const stdout = decoder.decode(Buffer.concat(stdoutChunks))
        const stderr = decoder.decode(Buffer.concat(stderrChunks))
        resolve({
          stdout: stdout.slice(0, 8000),
          stderr: stderr.slice(0, 2000),
          exitCode: code,
          timedOut,
        })
      })
    })
  },
})

export const agentTools = {
  read: readTool,
  write: writeTool,
  edit: editTool,
  bash: bashTool,
}
