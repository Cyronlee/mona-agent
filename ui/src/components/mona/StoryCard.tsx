import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import type { StoryCard as StoryCardType } from "@/lib/story-types"
import { StoryDetailDialog } from "./StoryDetailDialog"

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-red-500",
  high: "text-orange-400",
  medium: "text-blue-400",
  low: "text-slate-400",
}

interface StoryCardProps {
  story: StoryCardType
  onUpdate: () => void
}

export function StoryCard({ story, onUpdate }: StoryCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)

  let tags: string[] = []
  try {
    const parsed = JSON.parse(story.tags ?? "[]")
    tags = Array.isArray(parsed) ? parsed : []
  } catch {
    tags = []
  }

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={cn(
          "rounded-lg border border-slate-200 bg-white p-3 shadow-sm cursor-pointer",
          "hover:border-slate-300 hover:shadow-md transition-all",
        )}
      >
        <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 mb-2">
          {story.title}
        </p>
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="font-mono text-[10px] text-slate-400">
            #{story.id.slice(0, 8)}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn("text-[11px]", PRIORITY_COLOR[story.priority])}
              title={story.priority}
            >
              ●
            </span>
            {story.documentId && (
              <Icon icon="lucide:file-text" className="w-3 h-3 text-slate-400" />
            )}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-1.5">
          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
        </p>
      </div>

      <StoryDetailDialog
        storyId={story.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={onUpdate}
      />
    </>
  )
}
