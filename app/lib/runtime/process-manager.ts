import { spawn, type ChildProcess } from "node:child_process"
import fs from "node:fs/promises"
import { jobLogPath, projectDir } from "./paths"
import {
  createJob,
  updateJobPid,
  updateJobStatus,
  listAllJobs,
  type BackgroundJob,
  type JobStatus,
} from "./jobs"
import { withFileLock } from "./lock"

type ActiveProcess = {
  child: ChildProcess
  projectSlug: string
  jobId: string
  logPath: string
}

class ProcessManager {
  private processes = new Map<string, ActiveProcess>()

  async initialize(): Promise<void> {
    const all = await listAllJobs()
    const stale: Array<{ projectSlug: string; jobId: string }> = []
    for (const { projectSlug, job } of all) {
      if (job.status === "running") {
        stale.push({ projectSlug, jobId: job.id })
      }
    }
    for (const { projectSlug, jobId } of stale) {
      await updateJobStatus(projectSlug, jobId, "failed")
    }
    if (stale.length > 0) {
      console.log(
        `[ProcessManager] Cleaned up ${stale.length} stale running jobs.`,
      )
    }
  }

  async spawn(
    projectSlug: string,
    jobId: string,
    command: string,
    cwd: string,
  ): Promise<number | null> {
    await fs.mkdir(projectDir(projectSlug), { recursive: true })
    const child = spawn("bash", ["-c", command], {
      cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    })
    const pid = child.pid ?? null
    const logPath = jobLogPath(projectSlug, jobId)
    const entry: ActiveProcess = { child, projectSlug, jobId, logPath }
    this.processes.set(jobId, entry)

    await updateJobPid(projectSlug, jobId, pid)
    await fs.writeFile(logPath, "", "utf-8")
    this.#collectOutput(entry)
    return pid
  }

  isRunning(jobId: string): boolean {
    return this.processes.has(jobId)
  }

  async kill(jobId: string): Promise<boolean> {
    const entry = this.processes.get(jobId)
    if (!entry) return false
    try {
      entry.child.kill("SIGTERM")
    } catch {
      // ignore kill errors
    }
    this.processes.delete(jobId)
    await updateJobStatus(entry.projectSlug, jobId, "failed")
    return true
  }

  async createAndSpawn(
    projectSlug: string,
    command: string,
    cwd: string,
  ): Promise<BackgroundJob> {
    const job = await createJob(projectSlug, command, cwd)
    const pid = await this.spawn(projectSlug, job.id, command, cwd)
    if (pid !== null) {
      job.pid = pid
    }
    return job
  }

  #collectOutput(entry: ActiveProcess): void {
    const { child, projectSlug, jobId, logPath } = entry
    const decoder = new TextDecoder("utf-8")

    const append = (chunk: string): Promise<void> =>
      withFileLock(logPath, async () => {
        await fs.appendFile(logPath, chunk, "utf-8")
      })

    const handleChunk = (buf: Buffer | null): void => {
      if (!buf || buf.length === 0) return
      const text = decoder.decode(buf, { stream: true })
      if (text.length > 0) {
        void append(text)
      }
    }

    child.stdout?.on("data", handleChunk)
    child.stderr?.on("data", handleChunk)

    const finalize = (status: JobStatus): void => {
      this.processes.delete(jobId)
      void updateJobStatus(projectSlug, jobId, status)
    }

    child.on("error", () => {
      finalize("failed")
    })

    child.on("close", (code) => {
      finalize(code === 0 ? "completed" : "failed")
    })
  }
}

declare global {
  var __monaProcessManager: ProcessManager | undefined
}

export const processManager: ProcessManager =
  globalThis.__monaProcessManager ?? new ProcessManager()
if (!globalThis.__monaProcessManager) {
  globalThis.__monaProcessManager = processManager
}
