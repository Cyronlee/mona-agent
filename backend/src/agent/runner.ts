import { createGoogleGenerativeAI } from "@ai-sdk/google"
import {
  streamText,
  isLoopFinished,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type CoreMessage,
} from "ai"
import { prisma } from "../db/client.js"
import { agentTools } from "../tools/index.js"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

const MODEL = google("gemini-3.5-flash")

/**
 * Metadata injected into every assistant message start chunk.
 * The frontend reads `message.metadata.sessionId` from `onFinish` to
 * associate the response with the correct session.
 */
interface MessageMeta {
  sessionId: string
}

/**
 * AgentRunner is the core agent loop abstraction.
 *
 * It is deliberately decoupled from any HTTP transport:
 *  - HTTP route calls run() and turns the returned Response into an HTTP response.
 *  - Future headless/background agents can call run() directly, ignoring the Response
 *    or consuming it to drive UI updates via WebSocket / SSE on a different channel.
 *
 * All messages and tool calls are persisted to SQLite via Prisma in real time.
 */
export class AgentRunner {
  /**
   * Run the agent loop for a given session.
   *
   * @param sessionId - The ChatSession.id to persist messages under.
   *                    Pass null to create a new session automatically.
   * @param userMessage - The new user message text.
   * @param additionalHeaders - Extra headers to include in the HTTP response.
   * @returns A standard `Response` using the AI SDK UIMessage stream protocol.
   */
  static async run(
    sessionId: string | null,
    userMessage: string,
    additionalHeaders: Record<string, string> = {},
  ): Promise<Response> {
    // ── 1. Resolve or create session ─────────────────────────────────────────
    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null

    if (!session) {
      session = await prisma.chatSession.create({
        data: { title: userMessage.slice(0, 60) },
      })
    }

    const activeSessionId = session.id

    // ── 2. Persist the incoming user message ─────────────────────────────────
    await prisma.chatMessage.create({
      data: {
        sessionId: activeSessionId,
        role: "user",
        content: userMessage,
      },
    })

    // ── 3. Load full history from DB as CoreMessages ──────────────────────────
    const history = await AgentRunner.#loadHistory(activeSessionId)

    // ── 4. Run streamText with maxSteps = Infinity ────────────────────────────
    const result = streamText({
      model: MODEL,
      messages: history,
      tools: agentTools,
      stopWhen: isLoopFinished(),
      onFinish: async ({ steps, text }) => {
        // Persist each step as a single assistant message.
        // A step may contain tool calls + their results, plus optional text.
        // We group tool calls & results together so #loadHistory can reconstruct
        // a valid CoreMessage pair (assistant tool-call + tool tool-result).
        for (const step of steps) {
          const hasTool = step.toolCalls && step.toolCalls.length > 0
          const hasText = !!step.text

          if (!hasTool && !hasText) continue

          const toolCallsJson = hasTool
            ? JSON.stringify(
                step.toolCalls.map((tc, i) => ({
                  toolCallId: tc.toolCallId,
                  toolName: tc.toolName,
                  args: tc.input,
                  result: step.toolResults?.[i]?.output,
                  // Persist Gemini thoughtSignature so history replay doesn't lose it
                  providerMetadata: tc.providerMetadata,
                })),
              )
            : null

          await prisma.chatMessage.create({
            data: {
              sessionId: activeSessionId,
              role: "assistant",
              content: step.text ?? "",
              toolCallsJson,
            },
          })
        }

        // Update session title from the final text response
        if (text) {
          const msgCount = await prisma.chatMessage.count({ where: { sessionId: activeSessionId } })
          if (msgCount <= 4) {
            await prisma.chatSession.update({
              where: { id: activeSessionId },
              data: { title: text.slice(0, 60) },
            })
          }
        }
      },
    })

    // ── 5. Wrap in UIMessageStream so the frontend can read structured chunks ─
    const uiStream = createUIMessageStream<{ metadata: MessageMeta }>({
      execute: ({ writer }) => {
        // Inject sessionId in the first chunk so the frontend can capture it
        writer.write({ type: "start", messageMetadata: { sessionId: activeSessionId } })
        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({
      stream: uiStream,
      headers: {
        ...additionalHeaders,
        "X-Session-Id": activeSessionId,
      },
    })
  }

  /**
   * Load all messages for a session and convert to CoreMessage format.
   * Tool calls/results stored as JSON are reconstructed into proper CoreMessage shapes.
   */
  static async #loadHistory(sessionId: string): Promise<CoreMessage[]> {
    const rows = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    })

    const messages: CoreMessage[] = []

    for (const row of rows) {
      if (row.role === "user") {
        messages.push({ role: "user", content: row.content })
        continue
      }

      if (row.role !== "assistant") continue

      if (row.toolCallsJson) {
        // This step had tool calls — reconstruct as assistant(tool-call) + tool(tool-result) pair
        const toolCalls: Array<{
            toolCallId: string
            toolName: string
            args: unknown
            result: unknown
            providerMetadata?: unknown
          }> = JSON.parse(row.toolCallsJson)

          // Assistant message: optional text + tool-call parts
          messages.push({
            role: "assistant",
            content: [
              ...(row.content ? [{ type: "text" as const, text: row.content }] : []),
              ...toolCalls.map((tc) => ({
                type: "tool-call" as const,
                toolCallId: tc.toolCallId,
                toolName: tc.toolName,
                input: tc.args ?? {},
                // Restore Gemini thoughtSignature to avoid warning on replay
                ...(tc.providerMetadata ? { providerMetadata: tc.providerMetadata } : {}),
              })),
            ],
          })

        // Tool message: one result per tool call
        messages.push({
          role: "tool",
          content: toolCalls.map((tc) => ({
            type: "tool-result" as const,
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            output: { type: "json" as const, value: tc.result ?? null },
          })),
        })
      } else if (row.content) {
        // Plain text assistant message (final reply in a step)
        messages.push({ role: "assistant", content: row.content })
      }
    }

    return messages
  }
}
