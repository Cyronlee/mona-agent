import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppStore, type ViewType } from "@/store/app-store"
import {
  BotIcon,
  BoxIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  SettingsIcon,
  ZapIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS: {
  id: ViewType
  label: string
  icon: React.ReactNode
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboardIcon className="size-4" />,
  },
  {
    id: "documents",
    label: "Documents",
    icon: <BoxIcon className="size-4" />,
  },
  {
    id: "features",
    label: "Features",
    icon: <GitBranchIcon className="size-4" />,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: <ListTodoIcon className="size-4" />,
  },
  {
    id: "agents",
    label: "Agents",
    icon: <BotIcon className="size-4" />,
  },
]

export function LeftSidebar() {
  const { activeView, setActiveView } = useAppStore()

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="flex h-12 items-center gap-2.5 border-b border-slate-200 px-3.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-white">
          <ZapIcon className="size-3.5" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-800">
          Mona
        </span>
        <span className="ml-auto rounded px-1 py-0.5 text-[10px] font-medium bg-violet-100 text-violet-700">
          AI
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        <TooltipProvider delayDuration={300}>
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    activeView === item.id
                      ? "bg-slate-200/70 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      activeView === item.id
                        ? "text-slate-700"
                        : "text-slate-400",
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2.5">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-violet-100 text-[10px] font-semibold text-violet-700">
            SL
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-slate-800">
            Siyuan Li
          </p>
          <p className="truncate text-[10px] text-slate-400">Admin</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-slate-400 hover:text-slate-600"
        >
          <SettingsIcon className="size-3.5" />
        </Button>
      </div>
    </aside>
  )
}
