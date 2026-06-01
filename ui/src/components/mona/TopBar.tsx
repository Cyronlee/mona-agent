import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useAppStore, type ViewType } from "@/store/app-store"
import { BellIcon, CircleHelpIcon, PanelLeftIcon, PanelRightIcon, SearchIcon } from "lucide-react"

const VIEW_LABELS: Record<ViewType, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  assets: "Assets",
  features: "Features",
  agents: "Agents",
}

export function TopBar() {
  const { activeView, toggleLeftSidebar, toggleRightPanel } = useAppStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center border-b border-slate-200 bg-background px-3 gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        onClick={toggleLeftSidebar}
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-xs text-slate-500">
              Mona Workspace
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs font-medium text-slate-800">
              {VIEW_LABELS[activeView]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 items-center justify-center px-8">
        <div className="flex h-7 w-full max-w-sm items-center gap-2 rounded-md bg-slate-100/80 px-3 text-xs text-slate-400 border border-slate-200/60">
          <SearchIcon className="size-3 shrink-0" />
          <span>搜索文档、任务 (⌘K)</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <BellIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <CircleHelpIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          onClick={toggleRightPanel}
        >
          <PanelRightIcon className="size-4" />
        </Button>
      </div>
    </header>
  )
}
