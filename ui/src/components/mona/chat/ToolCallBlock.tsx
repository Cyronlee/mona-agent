import { useState } from "react"
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToolCall } from "./types"
import type { ToolUIPart } from "ai"

const STATUS_ICON: Record<ToolUIPart["state"], React.ReactNode> = {
  "approval-requested": <ClockIcon className="size-3 text-yellow-500" />,
  "approval-responded": <CheckCircleIcon className="size-3 text-blue-500" />,
  "input-available": (
    <ClockIcon className="size-3 animate-pulse text-slate-400" />
  ),
  "input-streaming": <CircleIcon className="size-3 text-slate-400" />,
  "output-available": <CheckCircleIcon className="size-3 text-emerald-500" />,
  "output-denied": <XCircleIcon className="size-3 text-orange-500" />,
  "output-error": <XCircleIcon className="size-3 text-red-500" />,
}

const STATUS_LABEL: Record<ToolUIPart["state"], string> = {
  "approval-requested": "等待审批",
  "approval-responded": "已响应",
  "input-available": "运行中",
  "input-streaming": "准备中",
  "output-available": "完成",
  "output-denied": "已拒绝",
  "output-error": "错误",
}

interface ToolCallBlockProps {
  tool: ToolCall
}

export function ToolCallBlock({ tool }: ToolCallBlockProps) {
  const [open, setOpen] = useState(false)
  const hasOutput = tool.result || tool.error

  return (
    <div className="my-1.5 rounded-md border border-slate-200 bg-slate-50/80 text-xs overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-100/80 transition-colors text-left"
      >
        <WrenchIcon className="size-3 shrink-0 text-slate-400" />
        <span className="flex-1 truncate font-medium text-slate-700">
          {tool.name}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
          {STATUS_ICON[tool.status]}
          {STATUS_LABEL[tool.status]}
        </span>
        {hasOutput && (
          <ChevronDownIcon
            className={cn(
              "size-3 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {open && hasOutput && (
        <div className="border-t border-slate-200 px-3 py-2 space-y-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
              Parameters
            </p>
            <pre className="rounded bg-slate-100 px-2 py-1.5 text-[10px] text-slate-600 overflow-x-auto leading-relaxed">
              {JSON.stringify(tool.parameters, null, 2)}
            </pre>
          </div>
          {tool.result && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                Result
              </p>
              <pre className="rounded bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-800 overflow-x-auto leading-relaxed">
                {tool.result}
              </pre>
            </div>
          )}
          {tool.error && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                Error
              </p>
              <pre className="rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-700 overflow-x-auto leading-relaxed">
                {tool.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
