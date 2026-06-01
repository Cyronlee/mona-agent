import { useCallback, useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ConversationSelect } from "./ConversationSelect"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Conversation as ConversationItem, ToolCall } from "./types"
import type { UIMessage, ToolUIPart, DynamicToolUIPart } from "ai"
import { fetchSessions } from "@/api-clients/chat"
import type { SessionSummary } from "@/api-clients/chat"

const API_BASE = "http://localhost:5679/api"

interface MessageMeta {
  sessionId: string
}

interface StoredToolCall {
  toolCallId: string
  toolName: string
  args: unknown
  result: unknown
}

function useSessionList() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSessions()
      setSessions(data)
    } catch {
      // backend not running
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { sessions, refresh }
}

function extractTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("")
}

function extractToolCalls(msg: UIMessage): ToolCall[] {
  return msg.parts
    .filter(
      (p): p is ToolUIPart | DynamicToolUIPart =>
        p.type === "dynamic-tool" || (typeof p.type === "string" && p.type.startsWith("tool-")),
    )
    .map((p) => {
      const toolName =
        p.type === "dynamic-tool"
          ? (p as DynamicToolUIPart).toolName
          : p.type.slice("tool-".length)
      const inv = p as { state: string; input?: unknown; output?: unknown; errorText?: string }
      return {
        name: toolName,
        description: toolName,
        status: inv.state as ToolCall["status"],
        parameters: inv.input ? (inv.input as Record<string, unknown>) : {},
        result:
          inv.state === "output-available" && inv.output != null
            ? JSON.stringify(inv.output, null, 2)
            : undefined,
        error: inv.state === "output-error" ? inv.errorText : undefined,
      }
    })
}

function extractReasoning(msg: UIMessage) {
  const rp = msg.parts.find((p) => p.type === "reasoning")
  if (!rp || !("text" in rp)) return undefined
  return { content: String(rp.text ?? ""), duration: 0 }
}

/**
 * Build UIMessage parts from a persisted DB message.
 * For assistant messages with tool calls, we reconstruct dynamic-tool parts
 * so ToolCallBlock can render them correctly in history view.
 */
function buildPartsFromHistory(
  role: "user" | "assistant",
  content: string,
  toolCallsJson: string | null | undefined,
): UIMessage["parts"] {
  if (role === "user") {
    return [{ type: "text", text: content }]
  }

  const parts: UIMessage["parts"] = []

  if (toolCallsJson) {
    const toolCalls: StoredToolCall[] = JSON.parse(toolCallsJson)
    for (const tc of toolCalls) {
      parts.push({
        type: "dynamic-tool",
        toolName: tc.toolName,
        toolCallId: tc.toolCallId,
        state: "output-available",
        input: tc.args,
        output: tc.result,
      } as DynamicToolUIPart & { input: unknown; output: unknown })
    }
  }

  if (content) {
    parts.push({ type: "text", text: content })
  }

  return parts
}

export function ChatPanel() {
  const { sessions, refresh: refreshSessions } = useSessionList()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  sessionIdRef.current = activeSessionId

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `${API_BASE}/chat`,
        prepareSendMessagesRequest: ({ messages, api }) => {
          const lastUser = [...messages].reverse().find((m) => m.role === "user")
          return {
            api,
            body: {
              messages: lastUser
                ? [{ role: "user", content: extractTextContent(lastUser) }]
                : [],
              sessionId: sessionIdRef.current,
            },
          }
        },
      }),
  )

  const { messages, status, sendMessage, stop, setMessages } = useChat({
    id: "mona-chat",
    transport,
    onFinish: ({ message }) => {
      const meta = message.metadata as MessageMeta | undefined
      if (meta?.sessionId && !sessionIdRef.current) {
        setActiveSessionId(meta.sessionId)
      }
      refreshSessions()
    },
  })

  const handleSubmit = useCallback(
    (msg: PromptInputMessage) => {
      const text = msg.text?.trim()
      if (!text) return
      sendMessage({ text })
    },
    [sendMessage],
  )

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null)
    setMessages([])
  }, [setMessages])

  const handleSessionChange = useCallback(
    async (id: string) => {
      setActiveSessionId(id)
      setMessages([])
      try {
        const res = await fetch(`${API_BASE}/chat/sessions/${id}`)
        if (!res.ok) return
        const data: {
          messages: Array<{
            id: string
            role: string
            content: string
            toolCallsJson?: string | null
          }>
        } = await res.json()

        const loaded: UIMessage[] = data.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: buildPartsFromHistory(
              m.role as "user" | "assistant",
              m.content,
              m.toolCallsJson,
            ),
          }))
        setMessages(loaded)
      } catch {
        // ignore
      }
    },
    [setMessages],
  )

  const conversations: ConversationItem[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    agentName: "Mona",
    lastActive: new Date(s.updatedAt).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-100 px-3">
        <ConversationSelect
          conversations={conversations}
          value={activeSessionId ?? ""}
          onChange={handleSessionChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-slate-600"
          title="新建会话"
          onClick={handleNewSession}
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="flex flex-col gap-4 p-3">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={{
                key: msg.id,
                from: msg.role === "user" ? "user" : "assistant",
                content: extractTextContent(msg),
                reasoning: extractReasoning(msg),
                tools: extractToolCalls(msg),
              }}
            />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-slate-100">
        <ChatInput status={status} onSubmit={handleSubmit} onStop={stop} />
      </div>
    </div>
  )
}
