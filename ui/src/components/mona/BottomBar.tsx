import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const agents = [
  {
    id: "planner",
    name: "Planner",
    role: "任务规划 Agent",
    status: "online" as const,
    initials: "P",
    color: "bg-violet-500",
  },
  {
    id: "coder",
    name: "Coder",
    role: "代码生成 Agent",
    status: "busy" as const,
    initials: "C",
    color: "bg-blue-500",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    role: "Code Review Agent",
    status: "idle" as const,
    initials: "R",
    color: "bg-emerald-500",
  },
]

const STATUS_DOT: Record<string, string> = {
  online: "bg-green-400",
  busy: "bg-yellow-400",
  idle: "bg-slate-400",
}

const STATUS_LABEL: Record<string, string> = {
  online: "在线",
  busy: "工作中",
  idle: "空闲",
}

export function BottomBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-7 items-center justify-between border-t border-slate-200 bg-slate-50 px-3">
      <span className="text-[10px] text-slate-400 select-none">
        Last sync: 2 mins ago
      </span>

      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1.5">
          {agents.map((agent) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <div className="relative cursor-default">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${agent.color} text-[8px] font-bold text-white`}
                  >
                    {agent.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-slate-50 ${STATUS_DOT[agent.status]}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{agent.name}</p>
                <p className="text-muted-foreground">{agent.role}</p>
                <p className="text-muted-foreground">
                  状态：{STATUS_LABEL[agent.status]}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </footer>
  )
}
