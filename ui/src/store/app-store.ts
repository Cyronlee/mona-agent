import { create } from "zustand"

export type ViewType = "dashboard" | "tasks" | "documents" | "features" | "agents"

interface AppStore {
  activeView: ViewType
  leftSidebarOpen: boolean
  rightPanelOpen: boolean
  setActiveView: (view: ViewType) => void
  toggleLeftSidebar: () => void
  toggleRightPanel: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeView: "dashboard",
  leftSidebarOpen: true,
  rightPanelOpen: true,
  setActiveView: (view) => set({ activeView: view }),
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
}))
