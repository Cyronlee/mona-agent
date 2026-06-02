export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  try {
    const { processManager } = await import("@/lib/runtime/process-manager")
    await processManager.initialize()
  } catch (err) {
    console.error("[instrumentation] ProcessManager init failed:", err)
  }
}
