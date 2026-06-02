import fs from "node:fs/promises"
import path from "node:path"
import { nanoid } from "nanoid"
import { jobJsonPath, jobsDir } from "./paths"
import { withFileLock } from "./lock"

export type JobStatus = "running" | "completed" | "failed"

export type BackgroundJob = {
  id: string
  command: string
  cwd: string
  pid: number | null
  status: JobStatus
  createdAt: string
  updatedAt: string
}

async function ensureJobsDir(projectSlug: string): Promise<void> {
  await fs.mkdir(jobsDir(projectSlug), { recursive: true })
}

async function readJobFile(filePath: string): Promise<BackgroundJob | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    return JSON.parse(raw) as BackgroundJob
  } catch {
    return null
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const tmp = `${filePath}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8")
  await fs.rename(tmp, filePath)
}

export async function createJob(
  projectSlug: string,
  command: string,
  cwd: string,
): Promise<BackgroundJob> {
  await ensureJobsDir(projectSlug)
  const now = new Date().toISOString()
  const job: BackgroundJob = {
    id: nanoid(),
    command,
    cwd,
    pid: null,
    status: "running",
    createdAt: now,
    updatedAt: now,
  }
  await writeJsonAtomic(jobJsonPath(projectSlug, job.id), job)
  return job
}

export async function getJob(
  projectSlug: string,
  jobId: string,
): Promise<BackgroundJob | null> {
  return readJobFile(jobJsonPath(projectSlug, jobId))
}

export async function updateJobStatus(
  projectSlug: string,
  jobId: string,
  status: JobStatus,
): Promise<BackgroundJob | null> {
  const filePath = jobJsonPath(projectSlug, jobId)
  return withFileLock(filePath, async () => {
    const existing = await readJobFile(filePath)
    if (!existing) return null
    const next: BackgroundJob = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonAtomic(filePath, next)
    return next
  })
}

export async function updateJobPid(
  projectSlug: string,
  jobId: string,
  pid: number | null,
): Promise<BackgroundJob | null> {
  const filePath = jobJsonPath(projectSlug, jobId)
  return withFileLock(filePath, async () => {
    const existing = await readJobFile(filePath)
    if (!existing) return null
    const next: BackgroundJob = {
      ...existing,
      pid,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonAtomic(filePath, next)
    return next
  })
}

export async function listAllJobs(): Promise<
  Array<{ projectSlug: string; job: BackgroundJob }>
> {
  const projectsRoot = process.env.PROJECTS_ROOT
  if (!projectsRoot) return []
  const results: Array<{ projectSlug: string; job: BackgroundJob }> = []
  let projectSlugs: string[]
  try {
    projectSlugs = await fs.readdir(projectsRoot)
  } catch {
    return results
  }
  for (const projectSlug of projectSlugs) {
    const projectPath = path.join(projectsRoot, projectSlug)
    let isDir = false
    try {
      const stat = await fs.stat(projectPath)
      isDir = stat.isDirectory()
    } catch {
      isDir = false
    }
    if (!isDir) continue
    const dir = jobsDir(projectSlug)
    let entries: string[]
    try {
      entries = await fs.readdir(dir)
    } catch {
      continue
    }
    for (const file of entries) {
      if (!file.endsWith(".json")) continue
      const job = await readJobFile(path.join(dir, file))
      if (job) results.push({ projectSlug, job })
    }
  }
  return results
}
