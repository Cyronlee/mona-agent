import { useRef, useState, useCallback } from "react"
import ChatbotDemo from "@/components/example/chatbot"

const MIN_WIDTH = 280
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 360

export function RightPanel() {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(DEFAULT_WIDTH)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startX.current = e.clientX
    startWidth.current = width

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = startX.current - ev.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
      setWidth(newWidth)
    }

    const onMouseUp = () => {
      dragging.current = false
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [width])

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col border-l border-slate-200 bg-white overflow-hidden"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-slate-300/60 transition-colors group"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-y-0 left-0 w-px bg-slate-200 group-hover:bg-slate-400 transition-colors" />
      </div>

      <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-100 px-4">
        <span className="text-xs font-semibold text-slate-700">AI Chat</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-400">Mona Active</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatbotDemo />
      </div>
    </aside>
  )
}
