import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ClockIcon,
  CodeIcon,
  FlaskConicalIcon,
  TrendingUpIcon,
} from "lucide-react"

const metrics = [
  {
    label: "进行中的 Stories",
    value: "14",
    delta: "+2 本周",
    icon: <TrendingUpIcon className="size-4 text-violet-500" />,
    bg: "bg-violet-50",
  },
  {
    label: "已交付 POC",
    value: "6",
    delta: "本月",
    icon: <FlaskConicalIcon className="size-4 text-emerald-500" />,
    bg: "bg-emerald-50",
  },
  {
    label: "AI 生成代码行数",
    value: "23,481",
    delta: "本周",
    icon: <CodeIcon className="size-4 text-blue-500" />,
    bg: "bg-blue-50",
  },
  {
    label: "平均交付时间",
    value: "3.2d",
    delta: "-0.4d 较上周",
    icon: <ClockIcon className="size-4 text-amber-500" />,
    bg: "bg-amber-50",
  },
]

const tasks = [
  {
    id: "MONA-101",
    title: "实现 Agent 协同调度引擎",
    priority: "urgent",
    status: "in-progress",
    assignee: "Planner",
  },
  {
    id: "MONA-98",
    title: "优化 RAG 向量检索召回率",
    priority: "high",
    status: "in-review",
    assignee: "Coder",
  },
  {
    id: "MONA-95",
    title: "接入 Claude 3.7 Sonnet API",
    priority: "medium",
    status: "in-progress",
    assignee: "Coder",
  },
  {
    id: "MONA-92",
    title: "搭建 MCP 工具链测试框架",
    priority: "medium",
    status: "todo",
    assignee: "Reviewer",
  },
  {
    id: "MONA-89",
    title: "撰写 Agent 协议规范文档",
    priority: "low",
    status: "todo",
    assignee: "Planner",
  },
  {
    id: "MONA-87",
    title: "修复流式输出中断问题",
    priority: "urgent",
    status: "in-progress",
    assignee: "Coder",
  },
]

const PRIORITY_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  urgent: { label: "紧急", variant: "destructive" },
  high: { label: "高", variant: "default" },
  medium: { label: "中", variant: "secondary" },
  low: { label: "低", variant: "outline" },
}

const STATUS_STYLES: Record<string, string> = {
  "in-progress":
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700",
  "in-review":
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700",
  todo: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600",
  done: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-700",
}

const STATUS_LABELS: Record<string, string> = {
  "in-progress": "进行中",
  "in-review": "Review 中",
  todo: "待处理",
  done: "已完成",
}

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">工作台</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Mona AI 多 Agent 协作平台 — 今日概览
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card
            key={m.label}
            className="border-slate-200/80 shadow-none bg-white"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                {m.label}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${m.bg}`}>{m.icon}</div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {m.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">{m.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 shadow-none bg-white">
        <CardHeader className="px-4 py-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-800">
            待处理任务
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="h-8 px-4 text-[11px] font-medium text-slate-400 w-24">
                  ID
                </TableHead>
                <TableHead className="h-8 px-4 text-[11px] font-medium text-slate-400">
                  任务标题
                </TableHead>
                <TableHead className="h-8 px-4 text-[11px] font-medium text-slate-400 w-20">
                  优先级
                </TableHead>
                <TableHead className="h-8 px-4 text-[11px] font-medium text-slate-400 w-28">
                  状态
                </TableHead>
                <TableHead className="h-8 px-4 text-[11px] font-medium text-slate-400 w-24">
                  负责 Agent
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const pBadge = PRIORITY_BADGE[task.priority]
                return (
                  <TableRow
                    key={task.id}
                    className="border-slate-100 hover:bg-slate-50/80 cursor-pointer"
                  >
                    <TableCell className="px-4 py-2 font-mono text-[11px] text-slate-400">
                      {task.id}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-sm text-slate-800 font-medium">
                      {task.title}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <Badge
                        variant={pBadge.variant}
                        className="text-[10px] h-5 px-1.5"
                      >
                        {pBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <span className={STATUS_STYLES[task.status]}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-xs text-slate-500">
                      {task.assignee}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
