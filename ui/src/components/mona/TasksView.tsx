import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Priority = "urgent" | "high" | "medium" | "low"
type TaskStatus = "backlog" | "in-progress" | "in-review" | "done"

interface Task {
  id: string
  title: string
  priority: Priority
  status: TaskStatus
  assignee: string
  tag: string
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "bg-slate-200" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-400" },
  { id: "in-review", label: "In Review", color: "bg-amber-400" },
  { id: "done", label: "Done", color: "bg-emerald-400" },
]

const tasks: Task[] = [
  {
    id: "MONA-103",
    title: "设计 Agent 间消息协议 v2",
    priority: "high",
    status: "backlog",
    assignee: "P",
    tag: "Architecture",
  },
  {
    id: "MONA-102",
    title: "集成 Slack 通知推送",
    priority: "medium",
    status: "backlog",
    assignee: "C",
    tag: "Integration",
  },
  {
    id: "MONA-101",
    title: "实现 Agent 协同调度引擎",
    priority: "urgent",
    status: "in-progress",
    assignee: "P",
    tag: "Core",
  },
  {
    id: "MONA-95",
    title: "接入 Claude 3.7 Sonnet API",
    priority: "medium",
    status: "in-progress",
    assignee: "C",
    tag: "AI",
  },
  {
    id: "MONA-87",
    title: "修复流式输出中断问题",
    priority: "urgent",
    status: "in-progress",
    assignee: "C",
    tag: "Bug",
  },
  {
    id: "MONA-98",
    title: "优化 RAG 向量检索召回率",
    priority: "high",
    status: "in-review",
    assignee: "R",
    tag: "AI",
  },
  {
    id: "MONA-91",
    title: "编写单元测试 — Scheduler",
    priority: "medium",
    status: "in-review",
    assignee: "R",
    tag: "Testing",
  },
  {
    id: "MONA-85",
    title: "搭建 CI/CD Pipeline",
    priority: "high",
    status: "done",
    assignee: "P",
    tag: "DevOps",
  },
  {
    id: "MONA-80",
    title: "完成需求分析文档",
    priority: "low",
    status: "done",
    assignee: "P",
    tag: "Docs",
  },
]

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: "text-red-500",
  high: "text-orange-400",
  medium: "text-blue-400",
  low: "text-slate-400",
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "●",
  high: "●",
  medium: "●",
  low: "●",
}

const ASSIGNEE_COLORS: Record<string, string> = {
  P: "bg-violet-500",
  C: "bg-blue-500",
  R: "bg-emerald-500",
}

const TAG_STYLES: Record<string, string> = {
  Architecture: "bg-purple-50 text-purple-600",
  Integration: "bg-cyan-50 text-cyan-600",
  Core: "bg-indigo-50 text-indigo-600",
  AI: "bg-blue-50 text-blue-600",
  Bug: "bg-red-50 text-red-600",
  Testing: "bg-amber-50 text-amber-600",
  DevOps: "bg-orange-50 text-orange-600",
  Docs: "bg-slate-100 text-slate-500",
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 flex-1">
          {task.title}
        </p>
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${ASSIGNEE_COLORS[task.assignee] ?? "bg-slate-400"}`}
        >
          {task.assignee}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] font-bold",
              PRIORITY_COLORS[task.priority],
            )}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              TAG_STYLES[task.tag] ?? "bg-slate-100 text-slate-500",
            )}
          >
            {task.tag}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TasksView() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
        <p className="text-xs text-slate-400 mt-0.5">看板视图 — 当前迭代</p>
      </div>

      <div className="grid grid-cols-4 gap-4 h-full">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 pb-1">
                <span className={`h-2 w-2 rounded-full ${col.color}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {col.label}
                </span>
                <Badge
                  variant="secondary"
                  className="ml-auto h-4 min-w-4 px-1 text-[10px] rounded-full"
                >
                  {colTasks.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 min-h-32">
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
