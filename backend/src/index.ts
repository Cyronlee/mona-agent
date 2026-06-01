import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { processManager } from "./process-manager/index.js"
import { chatRouter } from "./routes/chat.js"
import { documentsRouter } from "./routes/documents.js"

const PORT = Number(process.env.PORT ?? 3000)

const app = new Hono()

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(logger())
app.use(
  cors({
    origin: ["http://localhost:5678", "http://localhost:4173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Session-Id", "X-Vercel-AI-Data-Stream"],
  }),
)

// ── Routes ──────────────────────────────────────────────────────────────────
app.route("/api/chat", chatRouter)
app.route("/api/documents", documentsRouter)

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }))

// ── Startup ─────────────────────────────────────────────────────────────────
async function main() {
  await processManager.initialize()
  console.log(`[Mona] Backend running on http://localhost:${PORT}`)

  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  })
}

main().catch((err) => {
  console.error("[Mona] Fatal startup error:", err)
  process.exit(1)
})
