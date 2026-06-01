import { BoxIcon, GitBranchIcon, BotIcon } from "lucide-react"
import type { ViewType } from "@/store/app-store"

const VIEW_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; desc: string }
> = {
  documents: {
    icon: <BoxIcon className="size-10 text-slate-300" />,
    label: "Documents",
    desc: "文档库功能即将上线，敬请期待",
  },
  features: {
    icon: <GitBranchIcon className="size-10 text-slate-300" />,
    label: "Features",
    desc: "功能流管理模块正在构建中",
  },
  agents: {
    icon: <BotIcon className="size-10 text-slate-300" />,
    label: "Agents",
    desc: "Agent 智囊团配置界面即将就绪",
  },
}

export function PlaceholderView({ view }: { view: ViewType }) {
  const config = VIEW_CONFIG[view]
  if (!config) return null

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      {config.icon}
      <p className="text-base font-semibold text-slate-700">{config.label}</p>
      <p className="text-sm text-slate-400">{config.desc}</p>
    </div>
  )
}
