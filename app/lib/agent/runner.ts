import { createGoogleGenerativeAI } from "@ai-sdk/google"
import {
  streamText,
  isLoopFinished,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  type UIMessageStreamWriter,
  type UIMessage,
} from "ai"
import { agentTools } from "./tools"
import {
  createSession,
  getSession,
  updateSession,
  type ChatSession,
} from "../runtime/sessions"
import {
  appendMessage,
  listMessages,
  loadHistoryAsModelMessages,
  type PersistedMessage,
} from "../runtime/messages"

type UIMessageWithMeta = UIMessage<{ sessionId: string; projectSlug: string }>

const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"

function getModel() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured")
  }
  const google = createGoogleGenerativeAI({ apiKey })
  return google(MODEL_ID as never) as never
}

function firstUserText(messages: PersistedMessage[]): string {
  for (const m of messages) {
    if (m.role === "user" && m.content) {
      return m.content
    }
  }
  return ""
}

function lastStepText(messages: PersistedMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m && m.role === "assistant" && m.content) {
      return m.content
    }
  }
  return ""
}

function extractUserText(input: unknown): string {
  if (typeof input === "string") return input
  if (Array.isArray(input)) {
    return input
      .map((p) => extractUserText(p))
      .filter((s) => s.length > 0)
      .join("\n")
  }
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>
    if (typeof obj.text === "string") return obj.text
    if (obj.parts && Array.isArray(obj.parts)) {
      return obj.parts
        .map((p) => extractUserText(p))
        .filter((s) => s.length > 0)
        .join("\n")
    }
  }
  return ""
}

export class AgentRunner {
  static async run(
    projectSlug: string,
    sessionId: string | null,
    userMessage: string,
  ): Promise<Response> {
    let session: ChatSession | null = null
    if (sessionId) {
      session = await getSession(projectSlug, sessionId)
    }
    if (!session) {
      const title = userMessage.trim().length > 0
        ? userMessage.trim()
        : "New conversation"
      session = await createSession(projectSlug, title)
    }
    const activeSessionId = session.id

    await appendMessage(projectSlug, activeSessionId, {
      role: "user",
      content: userMessage,
      toolCallsJson: null,
    })
    await updateSession(projectSlug, activeSessionId, {})

    const persisted = await listMessages(projectSlug, activeSessionId)
    const history: ModelMessage[] = loadHistoryAsModelMessages(persisted)

    const result = streamText({
      model: getModel(),
      messages: history,
      tools: agentTools,
      stopWhen: isLoopFinished(),
      onFinish: async ({ steps }) => {
        const newRows: Array<Omit<PersistedMessage, "id" | "createdAt">> = []
        for (const step of steps) {
          const hasTool =
            step.toolCalls && step.toolCalls.length > 0
          const hasText = !!step.text
          if (!hasTool && !hasText) continue

          const toolCallsJson = hasTool
            ? JSON.stringify(
                step.toolCalls.map((tc, i) => ({
                  toolCallId: tc.toolCallId,
                  toolName: tc.toolName,
                  args: tc.input,
                  result: step.toolResults?.[i]?.output,
                  providerMetadata: tc.providerMetadata,
                })),
              )
            : null

          newRows.push({
            role: "assistant",
            content: step.text ?? "",
            toolCallsJson,
          })
        }

        for (const row of newRows) {
          await appendMessage(projectSlug, activeSessionId, row)
        }

        if (newRows.length > 0) {
          const allAfter = await listMessages(
            projectSlug,
            activeSessionId,
          )
          const candidate =
            lastStepText(allAfter) || firstUserText(allAfter)
          if (candidate && allAfter.length <= 4) {
            await updateSession(projectSlug, activeSessionId, {
              title: candidate.slice(0, 60),
            })
          } else {
            await updateSession(projectSlug, activeSessionId, {})
          }
        }
      },
    })

    const uiStream = createUIMessageStream<UIMessageWithMeta>({
      execute: ({ writer }: { writer: UIMessageStreamWriter<UIMessageWithMeta> }) => {
        writer.write({
          type: "start",
          messageMetadata: { sessionId: activeSessionId, projectSlug },
        })
        writer.merge(
          result.toUIMessageStream<UIMessageWithMeta>({
            messageMetadata: () => ({ sessionId: activeSessionId, projectSlug }),
          }),
        )
      },
    })

    return createUIMessageStreamResponse({
      stream: uiStream,
      headers: {
        "X-Session-Id": activeSessionId,
      },
    })
  }
}

export { extractUserText }
