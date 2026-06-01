import { useCallback, useState } from "react"
import { nanoid } from "nanoid"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import type { ChatStatus } from "ai"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ConversationSelect } from "./ConversationSelect"
import { conversations, initialMessages, mockResponses } from "./mock-data"
import type { ChatMessage as ChatMessageType } from "./types"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export function ChatPanel() {
  const [activeConvId, setActiveConvId] = useState(conversations[0].id)
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages)
  const [status, setStatus] = useState<ChatStatus>("ready")

  const streamResponse = useCallback(async (msgId: string, content: string) => {
    const words = content.split(" ")
    let current = ""
    for (const [i, word] of words.entries()) {
      current += (i > 0 ? " " : "") + word
      setMessages((prev) =>
        prev.map((m) =>
          m.key === msgId ? { ...m, content: current } : m,
        ),
      )
      await delay(Math.random() * 80 + 30)
    }
    setStatus("ready")
  }, [])

  const handleSubmit = useCallback(
    (msg: PromptInputMessage) => {
      const text = msg.text?.trim()
      if (!text) return

      setStatus("submitted")

      const userMsg: ChatMessageType = {
        key: nanoid(),
        from: "user",
        content: text,
      }
      setMessages((prev) => [...prev, userMsg])

      setTimeout(() => {
        const asstKey = nanoid()
        const randomResponse =
          mockResponses[Math.floor(Math.random() * mockResponses.length)]

        const asstMsg: ChatMessageType = {
          key: asstKey,
          from: "assistant",
          content: "",
        }
        setMessages((prev) => [...prev, asstMsg])
        setStatus("streaming")
        streamResponse(asstKey, randomResponse)
      }, 400)
    },
    [streamResponse],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-100 px-3">
        <ConversationSelect
          conversations={conversations}
          value={activeConvId}
          onChange={setActiveConvId}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-slate-600"
          title="新建会话"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="flex flex-col gap-4 p-3">
          {messages.map((msg) => (
            <ChatMessage key={msg.key} message={msg} />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-slate-100">
        <ChatInput status={status} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
