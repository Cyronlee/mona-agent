import type { ToolUIPart } from "ai"

export interface ToolCall {
  name: string
  description: string
  status: ToolUIPart["state"]
  parameters: Record<string, unknown>
  result: string | undefined
  error: string | undefined
}

export interface ChatMessage {
  key: string
  from: "user" | "assistant"
  content: string
  reasoning?: {
    content: string
    duration: number
  }
  tools?: ToolCall[]
}

export interface Conversation {
  id: string
  title: string
  agentName: string
  lastActive: string
}
