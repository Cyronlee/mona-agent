import { useRef, useState, useCallback, useEffect } from "react"
import { ChatPanel } from "./chat/ChatPanel"

const MIN_WIDTH = 280
const MAX_WIDTH = 640
const DEFAULT_WIDTH = 360
const STORAGE_KEY = "mona-right-panel-width"

function getSavedWidth(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDTH
}

export function RightPanel() {
  const [width, setWidth] = useState(getSavedWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(width)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(width))
    } catch {
      // ignore
    }
  }, [width])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startWidth.current = width

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return
        const delta = startX.current - ev.clientX
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidth.current + delta),
        )
        setWidth(newWidth)
      }

      const onMouseUp = () => {
        dragging.current = false
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }

      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [width],
  )

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col border-l border-slate-200 bg-white overflow-hidden"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-y-0 left-px w-px bg-slate-200 group-hover:bg-violet-400 transition-colors duration-150" />
      </div>

      <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-100 px-3 pl-4">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-slate-700">AI Chat</span>
        </div>
        <span className="text-[10px] text-slate-400">Mona Active</span>
      </div>

      <ChatPanel />
    </aside>
  )
}
