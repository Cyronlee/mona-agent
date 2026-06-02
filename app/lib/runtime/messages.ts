import fs from "node:fs/promises"
import { nanoid } from "nanoid"
import type { ModelMessage } from "ai"
import { sessionJsonlPath } from "./paths"
import { withFileLock } from "./lock"

export type PersistedMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  toolCallsJson: string | null
  createdAt: string
}

export type PersistedToolCall = {
  toolCallId: string
  toolName: string
  args: unknown
  result: unknown
  providerMetadata?: unknown
}

async function ensureJsonlExists(filePath: string): Promise<void> {
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, "", "utf-8")
  }
}

export async function appendMessage(
  projectSlug: string,
  sessionId: string,
  msg: Omit<PersistedMessage, "id" | "createdAt">,
): Promise<PersistedMessage> {
  const filePath = sessionJsonlPath(projectSlug, sessionId)
  await ensureJsonlExists(filePath)
  const full: PersistedMessage = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...msg,
  }
  await withFileLock(filePath, async () => {
    await fs.appendFile(filePath, JSON.stringify(full) + "\n", "utf-8")
  })
  return full
}

export async function listMessages(
  projectSlug: string,
  sessionId: string,
): Promise<PersistedMessage[]> {
  const filePath = sessionJsonlPath(projectSlug, sessionId)
  let raw: string
  try {
    raw = await fs.readFile(filePath, "utf-8")
  } catch {
    return []
  }
  const lines = raw.split("\n").filter((l) => l.length > 0)
  const messages: PersistedMessage[] = []
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as PersistedMessage
      if (
        parsed &&
        typeof parsed.id === "string" &&
        (parsed.role === "user" || parsed.role === "assistant")
      ) {
        messages.push(parsed)
      }
    } catch {
      continue
    }
  }
  return messages
}

type ToolCallPartInternal = {
  type: "tool-call"
  toolCallId: string
  toolName: string
  input: unknown
  providerOptions?: unknown
}

type ToolResultPartInternal = {
  type: "tool-result"
  toolCallId: string
  toolName: string
  output: { type: "json"; value: unknown }
}

export function loadHistoryAsModelMessages(
  messages: PersistedMessage[],
): ModelMessage[] {
  const result: ModelMessage[] = []
  for (const row of messages) {
    if (row.role === "user") {
      result.push({ role: "user", content: row.content })
      continue
    }
    if (row.role !== "assistant") continue

    if (row.toolCallsJson) {
      let toolCalls: PersistedToolCall[]
      try {
        toolCalls = JSON.parse(row.toolCallsJson) as PersistedToolCall[]
      } catch {
        toolCalls = []
      }

      const parts: unknown[] = []
      if (row.content) {
        parts.push({ type: "text", text: row.content })
      }
      for (const tc of toolCalls) {
        const part: ToolCallPartInternal = {
          type: "tool-call",
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          input: tc.args ?? {},
        }
        if (tc.providerMetadata) {
          part.providerOptions = tc.providerMetadata
        }
        parts.push(part)
      }

      result.push({
        role: "assistant",
        content: parts as never,
      })

      if (toolCalls.length > 0) {
        const toolParts: ToolResultPartInternal[] = toolCalls.map((tc) => ({
          type: "tool-result",
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          output: {
            type: "json",
            value:
              tc.result !== undefined && tc.result !== null ? tc.result : null,
          },
        }))
        result.push({
          role: "tool",
          content: toolParts as never,
        })
      }
    } else if (row.content) {
      result.push({ role: "assistant", content: row.content })
    }
  }
  return result
}
