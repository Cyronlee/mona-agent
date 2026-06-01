import { spawn, type Subprocess } from "bun"
import { prisma } from "../db/client.js"

interface ActiveProcess {
  subprocess: Subprocess
  jobId: string
}

/**
 * Manages background processes for the bash tool.
 * - Maintains an in-memory map of jobId -> subprocess for kill operations.
 * - On startup, marks any lingering "running" jobs as "failed" (zombie cleanup).
 */
class ProcessManager {
  private processes = new Map<string, ActiveProcess>()

  async initialize(): Promise<void> {
    const lingering = await prisma.backgroundJob.updateMany({
      where: { status: "running" },
      data: { status: "failed", logs: { set: "" } },
    })
    if (lingering.count > 0) {
      console.log(`[ProcessManager] Cleaned up ${lingering.count} stale running jobs.`)
    }
  }

  async spawn(jobId: string, command: string, cwd: string): Promise<number | null> {
    const subprocess = spawn({
      cmd: ["bash", "-c", command],
      cwd,
      stdout: "pipe",
      stderr: "pipe",
      stdin: "ignore",
    })

    this.processes.set(jobId, { subprocess, jobId })

    const pid = subprocess.pid ?? null

    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { pid, status: "running" },
    })

    this.#collectOutput(jobId, subprocess)

    return pid
  }

  async kill(jobId: string): Promise<boolean> {
    const entry = this.processes.get(jobId)
    if (!entry) return false

    entry.subprocess.kill()
    this.processes.delete(jobId)

    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: "failed" },
    })

    return true
  }

  isRunning(jobId: string): boolean {
    return this.processes.has(jobId)
  }

  #collectOutput(jobId: string, subprocess: Subprocess): void {
    const appendLog = async (chunk: string) => {
      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: { logs: { set: await this.#appendChunk(jobId, chunk) } },
      })
    }

    const drainStream = async (stream: ReadableStream<Uint8Array> | null) => {
      if (!stream) return
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          await appendLog(decoder.decode(value, { stream: true }))
        }
      } finally {
        reader.releaseLock()
      }
    }

    Promise.all([drainStream(subprocess.stdout), drainStream(subprocess.stderr)])
      .then(async () => {
        const exitCode = await subprocess.exited
        const status = exitCode === 0 ? "completed" : "failed"
        await prisma.backgroundJob.update({
          where: { id: jobId },
          data: { status },
        })
        this.processes.delete(jobId)
      })
      .catch(async (err) => {
        console.error(`[ProcessManager] Error collecting output for job ${jobId}:`, err)
        await prisma.backgroundJob.update({
          where: { id: jobId },
          data: { status: "failed" },
        })
        this.processes.delete(jobId)
      })
  }

  async #appendChunk(jobId: string, chunk: string): Promise<string> {
    const job = await prisma.backgroundJob.findUnique({ where: { id: jobId }, select: { logs: true } })
    return (job?.logs ?? "") + chunk
  }
}

export const processManager = new ProcessManager()
