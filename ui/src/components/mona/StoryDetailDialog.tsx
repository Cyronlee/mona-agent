import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetchStory, updateStory, deleteStory } from "@/api-clients/stories"
import type { StoryCard, Priority, StoryStatus } from "@/lib/story-types"

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "bg-slate-200 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  BLOCKED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
}

const STATUS_LABELS: Record<StoryStatus, string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  BLOCKED: "Blocked",
  CANCELLED: "Cancelled",
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "yyyy-MM-dd HH:mm")
  } catch {
    return dateStr
  }
}

interface StoryDetailDialogProps {
  storyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function StoryDetailDialog({
  storyId,
  open,
  onOpenChange,
  onUpdate,
}: StoryDetailDialogProps) {
  const [story, setStory] = useState<StoryCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formPriority, setFormPriority] = useState<Priority>("medium")
  const [formTags, setFormTags] = useState("")
  const mdxRef = useRef<MDXEditorMethods | null>(null)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    fetchStory(storyId)
      .then((data) => {
        setStory(data)
        setFormTitle(data.title)
        setFormPriority(data.priority as Priority)
        let tags: string[] = []
        try {
          tags = JSON.parse(data.tags)
        } catch {
          tags = []
        }
        setFormTags(tags.join(", "))
      })
      .finally(() => setIsLoading(false))
  }, [open, storyId])

  const handleSave = async () => {
    if (!story) return
    setIsSaving(true)
    const markdown = mdxRef.current?.getMarkdown() ?? story.content
    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    try {
      await updateStory(story.id, {
        title: formTitle.trim(),
        content: markdown,
        priority: formPriority,
        tags,
      })
      onOpenChange(false)
      onUpdate()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!story) return
    await deleteStory(story.id)
    setDeleteConfirm(false)
    onOpenChange(false)
    onUpdate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-sm font-semibold">
            {isLoading ? "Loading..." : "Story Detail"}
          </DialogTitle>
        </DialogHeader>

        {story && !isLoading && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Main content */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
              <div className="px-6 py-3 border-b shrink-0">
                <Label htmlFor="story-title" className="text-xs mb-1 block">
                  Title
                </Label>
                <Input
                  id="story-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-7 text-sm"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <MDXEditor
                  ref={mdxRef}
                  markdown={story.content}
                  className="h-full"
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    tablePlugin(),
                    codeBlockPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <BlockTypeSelect />
                          <BoldItalicUnderlineToggles />
                          <ListsToggle />
                          <CreateLink />
                          <CodeToggle />
                          <InsertThematicBreak />
                          <UndoRedo />
                        </>
                      ),
                    }),
                  ]}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-56 shrink-0 border-l flex flex-col overflow-y-auto p-4 gap-4 text-xs">
              <div>
                <p className="text-slate-500 mb-1">Status</p>
                <Badge
                  className={`text-[10px] h-5 ${STATUS_COLORS[story.status]}`}
                  variant="secondary"
                >
                  {STATUS_LABELS[story.status]}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1 block">
                  Priority
                </Label>
                <Select
                  value={formPriority}
                  onValueChange={(v) => setFormPriority(v as Priority)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🔵 Medium</SelectItem>
                    <SelectItem value="low">⚪ Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1 block">
                  Tags (comma-separated)
                </Label>
                <Input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Frontend, AI, Bug"
                  className="h-7 text-xs"
                />
              </div>

              {story.document && (
                <div>
                  <p className="text-slate-500 mb-1">Source Document</p>
                  <p className="text-slate-700 font-medium truncate">
                    {story.document.title}
                  </p>
                  <p className="text-slate-400 truncate">
                    {story.document.folder}
                  </p>
                </div>
              )}

              <div>
                <p className="text-slate-500 mb-1">Created</p>
                <p className="text-slate-600">{formatDate(story.createdAt)}</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">Updated</p>
                <p className="text-slate-600">{formatDate(story.updatedAt)}</p>
              </div>

              {story.statusLogs && story.statusLogs.length > 0 && (
                <div>
                  <p className="text-slate-500 mb-1.5">Status History</p>
                  <div className="flex flex-col gap-1.5">
                    {story.statusLogs.map((log) => (
                      <div key={log.id} className="text-[10px]">
                        <span className="text-slate-500">
                          {log.fromStatus
                            ? `${STATUS_LABELS[log.fromStatus]} → `
                            : "Created → "}
                        </span>
                        <span className="font-medium text-slate-700">
                          {STATUS_LABELS[log.toStatus]}
                        </span>
                        <p className="text-slate-400">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 flex flex-col gap-2">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                {!deleteConfirm ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-red-500">Confirm delete?</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-[10px]"
                        onClick={handleDelete}
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-[10px]"
                        onClick={() => setDeleteConfirm(false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
