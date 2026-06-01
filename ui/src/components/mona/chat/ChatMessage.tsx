import { memo, useState } from "react"
import { BrainIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { ToolCallBlock } from "./ToolCallBlock"
import type { ChatMessage as ChatMessageType } from "./types"

interface ReasoningBlockProps {
  content: string
  duration: number
}

function ReasoningBlock({ content, duration }: ReasoningBlockProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-1.5">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
        <BrainIcon className="size-3" />
        <span>思考了 {duration} 秒</span>
        <ChevronDownIcon
          className={cn(
            "size-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 leading-relaxed italic">
        {content}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.from === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-800 leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {message.tools && message.tools.length > 0 && (
        <div className="space-y-0.5">
          {message.tools.map((tool, i) => (
            <ToolCallBlock key={`${tool.name}-${i}`} tool={tool} />
          ))}
        </div>
      )}

      {message.reasoning && (
        <ReasoningBlock
          content={message.reasoning.content}
          duration={message.reasoning.duration}
        />
      )}

      <MessageContent className="text-xs leading-relaxed [&_p]:my-1.5 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:my-1.5 [&_code]:text-[11px]">
        <MessageResponse>{message.content}</MessageResponse>
      </MessageContent>
    </div>
  )
})
