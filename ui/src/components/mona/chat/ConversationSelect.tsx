import { useState } from "react"
import { CheckIcon, ChevronDownIcon, MessageSquareIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { Conversation } from "./types"

const AGENT_COLORS: Record<string, string> = {
  Planner: "bg-violet-500",
  Coder: "bg-blue-500",
  Reviewer: "bg-emerald-500",
}

interface ConversationSelectProps {
  conversations: Conversation[]
  value: string
  onChange: (id: string) => void
}

export function ConversationSelect({
  conversations,
  value,
  onChange,
}: ConversationSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = conversations.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs",
            "text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-slate-300",
            open && "bg-slate-50 border-slate-300",
          )}
        >
          <MessageSquareIcon className="size-3 shrink-0 text-slate-400" />
          <span className="max-w-28 truncate font-medium">
            {selected?.title ?? "选择会话"}
          </span>
          {selected && (
            <span
              className={cn(
                "shrink-0 rounded px-1 text-[9px] font-bold text-white",
                AGENT_COLORS[selected.agentName] ?? "bg-slate-400",
              )}
            >
              {selected.agentName[0]}
            </span>
          )}
          <ChevronDownIcon className="size-3 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="搜索会话..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-xs text-slate-400">
              未找到会话
            </CommandEmpty>
            <CommandGroup>
              {conversations.map((conv) => (
                <CommandItem
                  key={conv.id}
                  value={conv.id}
                  onSelect={() => {
                    onChange(conv.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-xs cursor-pointer"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white",
                      AGENT_COLORS[conv.agentName] ?? "bg-slate-400",
                    )}
                  >
                    {conv.agentName[0]}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="truncate font-medium text-slate-800">
                      {conv.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {conv.agentName} · {conv.lastActive}
                    </span>
                  </div>
                  {value === conv.id && (
                    <CheckIcon className="size-3 shrink-0 text-slate-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
