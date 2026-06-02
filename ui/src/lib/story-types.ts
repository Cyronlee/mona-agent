export type StoryStatus =
  | "BACKLOG"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "BLOCKED"
  | "CANCELLED"
export type Priority = "urgent" | "high" | "medium" | "low"

export interface StoryStatusLog {
  id: string
  cardId: string
  fromStatus: StoryStatus | null
  toStatus: StoryStatus
  createdAt: string
}

export interface StoryCard {
  id: string
  title: string
  content: string
  status: StoryStatus
  priority: Priority
  documentId: string | null
  tags: string // JSON string array
  createdAt: string
  updatedAt: string
  statusLogs?: StoryStatusLog[]
  document?: { id: string; title: string; folder: string } | null
}
