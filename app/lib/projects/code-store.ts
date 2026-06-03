import fs from "node:fs/promises"
import path from "node:path"
import {
  projectDir,
  projectContentRoot,
  resolveProjectCodePath,
} from "@/lib/runtime/paths"

const MAX_TEXT_FILE_BYTES = 1024 * 1024

const TEXT_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".css",
  ".csv",
  ".go",
  ".html",
  ".java",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".py",
  ".rb",
  ".rs",
  ".sh",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".vue",
  ".xml",
  ".yaml",
  ".yml",
])

export type ProjectCodeNode = {
  path: string
  name: string
  kind: "file" | "directory"
  children?: ProjectCodeNode[]
}

export type ProjectCodeFile = {
  path: string
  content: string
  language: string
  size: number
  updatedAt: string
}

export class ProjectCodeError extends Error {
  readonly status: 400 | 403 | 404 | 415 | 422

  constructor(message: string, status: 400 | 403 | 404 | 415 | 422) {
    super(message)
    this.name = "ProjectCodeError"
    this.status = status
  }
}

async function ensureDirExists(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true })
}

async function assertProjectExists(projectSlug: string): Promise<void> {
  const root = projectDir(projectSlug)
  try {
    const stats = await fs.stat(root)
    if (!stats.isDirectory()) {
      throw new ProjectCodeError("Project not found", 404)
    }
    await fs.access(path.join(root, "project.json"))
  } catch (error) {
    if (error instanceof ProjectCodeError) {
      throw error
    }
    throw new ProjectCodeError("Project not found", 404)
  }
}

function normalizeRelativePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "")
}

function toRelativeCodePath(projectSlug: string, absolutePath: string): string {
  const root = projectContentRoot(projectSlug)
  return path.relative(root, absolutePath).split(path.sep).join("/")
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".ts") return "typescript"
  if (ext === ".tsx") return "tsx"
  if (ext === ".js") return "javascript"
  if (ext === ".jsx") return "jsx"
  if (ext === ".md") return "markdown"
  if (ext === ".yml" || ext === ".yaml") return "yaml"
  if (ext === ".sh") return "bash"
  if (ext === ".svg") return "xml"
  return ext.slice(1) || "text"
}

function isTextExtension(filePath: string): boolean {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function assertTextBuffer(buffer: Buffer, filePath: string): void {
  if (!isTextExtension(filePath) && buffer.includes(0)) {
    throw new ProjectCodeError("Binary files are not supported in Code view", 415)
  }
}

async function buildNodeTree(
  projectSlug: string,
  absoluteDir: string,
): Promise<ProjectCodeNode[]> {
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true })
  const visibleEntries = entries
    .filter((entry) => !entry.name.startsWith(".") && entry.name !== "node_modules")
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

  const nodes = await Promise.all(
    visibleEntries.map(async (entry) => {
      const absolutePath = path.join(absoluteDir, entry.name)
      const relativePath = toRelativeCodePath(projectSlug, absolutePath)

      if (entry.isDirectory()) {
        const children = await buildNodeTree(projectSlug, absolutePath)
        return {
          path: relativePath,
          name: entry.name,
          kind: "directory" as const,
          children,
        }
      }

      return {
        path: relativePath,
        name: entry.name,
        kind: "file" as const,
      }
    }),
  )

  return nodes
}

export async function ensureProjectCodeDir(projectSlug: string): Promise<string> {
  await assertProjectExists(projectSlug)
  const root = projectContentRoot(projectSlug)
  await ensureDirExists(root)
  return root
}

export async function listProjectCodeTree(
  projectSlug: string,
): Promise<ProjectCodeNode[]> {
  const root = await ensureProjectCodeDir(projectSlug)
  return buildNodeTree(projectSlug, root)
}

export async function readProjectCodeFile(
  projectSlug: string,
  relativePath: string,
): Promise<ProjectCodeFile> {
  const normalizedPath = normalizeRelativePath(relativePath)
  if (!normalizedPath) {
    throw new ProjectCodeError("path is required", 400)
  }

  let absolutePath: string
  try {
    absolutePath = resolveProjectCodePath(projectSlug, normalizedPath)
  } catch {
    throw new ProjectCodeError("Invalid code path", 403)
  }

  let stats
  try {
    stats = await fs.stat(absolutePath)
  } catch {
    throw new ProjectCodeError("Code file not found", 404)
  }

  if (!stats.isFile()) {
    throw new ProjectCodeError("Requested path is not a file", 422)
  }

  if (stats.size > MAX_TEXT_FILE_BYTES) {
    throw new ProjectCodeError("File is too large for Code view", 422)
  }

  const buffer = await fs.readFile(absolutePath)
  assertTextBuffer(buffer, absolutePath)

  return {
    path: normalizedPath,
    content: buffer.toString("utf-8"),
    language: detectLanguage(absolutePath),
    size: stats.size,
    updatedAt: stats.mtime.toISOString(),
  }
}