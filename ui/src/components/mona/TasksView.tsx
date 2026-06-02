import { useCallback, useEffect, useMemo, useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanOverlay,
  type KanbanMoveEvent,
} from "@/components/reui/kanban"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StoryCard as StoryCardType, StoryStatus } from "@/lib/story-types"
import { fetchStories, transitionStory } from "@/api-clients/stories"
import { StoryCard } from "./StoryCard"

const COLUMN_DEFS: { id: StoryStatus; label: string; color: string }[] = [
  { id: "BACKLOG", label: "Backlog", color: "bg-slate-300" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-400" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-amber-400" },
  { id: "DONE", label: "Done", color: "bg-emerald-400" },
  { id: "BLOCKED", label: "Blocked", color: "bg-red-400" },
  { id: "CANCELLED", label: "Cancelled", color: "bg-slate-400" },
]

const ALLOWED: Record<string, string[]> = {
  BACKLOG: ["IN_PROGRESS", "BLOCKED", "CANCELLED"],
  IN_PROGRESS: ["BACKLOG", "IN_REVIEW", "BLOCKED", "CANCELLED"],
  IN_REVIEW: ["IN_PROGRESS", "DONE", "BLOCKED", "CANCELLED"],
  DONE: [],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  CANCELLED: [],
}

function storiesToColumns(
  stories: StoryCardType[],
): Record<string, StoryCardType[]> {
  const cols: Record<string, StoryCardType[]> = {}
  for (const col of COLUMN_DEFS) cols[col.id] = []
  for (const s of stories) {
    if (cols[s.status]) cols[s.status].push(s)
  }
  return cols
}

export function TasksView() {
  const [columns, setColumns] = useState<Record<string, StoryCardType[]>>(
    storiesToColumns([]),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [transitionError, setTransitionError] = useState<string | null>(null)

  const loadStories = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchStories()
      setColumns(storiesToColumns(data))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  const allStories = useMemo(() => Object.values(columns).flat(), [columns])

  const handleMove = useCallback(
    ({ activeContainer, activeIndex, overContainer, overIndex }: KanbanMoveEvent) => {
      if (activeContainer === overContainer) {
        setColumns((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            [...prev[activeContainer]],
            activeIndex,
            overIndex,
          ),
        }))
        return
      }

      const story = columns[activeContainer]?.[activeIndex]
      if (!story) return

      const allowed = ALLOWED[story.status] ?? []
      if (!allowed.includes(overContainer)) {
        setTransitionError(
          `Cannot move from ${story.status} to ${overContainer}`,
        )
        setTimeout(() => setTransitionError(null), 3000)
        return
      }

      const newStatus = overContainer as StoryStatus
      const updatedStory = { ...story, status: newStatus }
      setColumns((prev) => {
        const newActive = [...prev[activeContainer]]
        const newOver = [...prev[overContainer]]
        newActive.splice(activeIndex, 1)
        newOver.splice(overIndex, 0, updatedStory)
        return { ...prev, [activeContainer]: newActive, [overContainer]: newOver }
      })

      transitionStory(story.id, newStatus).catch((err) => {
        setTransitionError(
          err instanceof Error ? err.message : "Transition failed",
        )
        setTimeout(() => setTransitionError(null), 3000)
        loadStories()
      })
    },
    [columns, loadStories],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">Kanban board</p>
        </div>
        <button
          onClick={loadStories}
          className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {transitionError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {transitionError}
        </div>
      )}

      {isLoading && allStories.length === 0 ? (
        <div className="text-xs text-slate-400 py-8 text-center">
          Loading...
        </div>
      ) : (
        <Kanban
          value={columns}
          onValueChange={setColumns}
          getItemValue={(story) => story.id}
          onMove={handleMove}
        >
          <KanbanBoard className="flex! grid-cols-none! auto-rows-auto! gap-4 overflow-x-auto pb-4">
            {COLUMN_DEFS.map((col) => (
              <KanbanColumn
                key={col.id}
                value={col.id}
                className="min-w-52 w-52 shrink-0"
              >
                <div className="flex items-center gap-2 pb-2">
                  <span
                    className={cn("h-2 w-2 rounded-full shrink-0", col.color)}
                  />
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {col.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-auto h-4 min-w-4 px-1 text-[10px] rounded-full shrink-0"
                  >
                    {columns[col.id]?.length ?? 0}
                  </Badge>
                </div>
                <KanbanColumnContent
                  value={col.id}
                  className="min-h-32 rounded-lg p-1.5 bg-slate-50"
                >
                  {(columns[col.id] ?? []).map((story) => (
                    <KanbanItem key={story.id} value={story.id}>
                      <StoryCard story={story} onUpdate={loadStories} />
                    </KanbanItem>
                  ))}
                </KanbanColumnContent>
              </KanbanColumn>
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const story = allStories.find((s) => s.id === value)
              if (!story) return null
              return <StoryCard story={story} onUpdate={loadStories} />
            }}
          </KanbanOverlay>
        </Kanban>
      )}
    </div>
  )
}

