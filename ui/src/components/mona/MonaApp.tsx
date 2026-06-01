import { useAppStore } from "@/store/app-store"
import { BottomBar } from "./BottomBar"
import { DashboardView } from "./DashboardView"
import { LeftSidebar } from "./LeftSidebar"
import { PlaceholderView } from "./PlaceholderView"
import { RightPanel } from "./RightPanel"
import { TasksView } from "./TasksView"
import { TopBar } from "./TopBar"

function WorkspaceContent() {
  const activeView = useAppStore((s) => s.activeView)

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "tasks" && <TasksView />}
      {(activeView === "assets" ||
        activeView === "features" ||
        activeView === "agents") && <PlaceholderView view={activeView} />}
    </div>
  )
}

export function MonaApp() {
  const { leftSidebarOpen, rightPanelOpen } = useAppStore()

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <TopBar />

      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 48, marginBottom: 28 }}>
        {leftSidebarOpen && <LeftSidebar />}

        <main className="flex flex-1 overflow-hidden bg-white">
          <WorkspaceContent />
        </main>

        {rightPanelOpen && <RightPanel />}
      </div>

      <BottomBar />
    </div>
  )
}
