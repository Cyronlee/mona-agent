import { get, post, patch, del } from "@/lib/api-client"
import type { StoryCard, StoryStatus, Priority } from "@/lib/story-types"

export function fetchStories(status?: StoryStatus) {
  const params = status ? { status } : undefined
  return get<StoryCard[]>("/stories", params)
}

export function fetchStory(id: string) {
  return get<StoryCard>(`/stories/${id}`)
}

export function createStory(data: {
  title: string
  content?: string
  priority?: Priority
  documentId?: string
  tags?: string[]
}) {
  return post<StoryCard>("/stories", data)
}

export function updateStory(
  id: string,
  data: { title?: string; content?: string; priority?: Priority; tags?: string[] },
) {
  return patch<StoryCard>(`/stories/${id}`, data)
}

export function transitionStory(id: string, status: StoryStatus) {
  return patch<StoryCard>(`/stories/${id}/status`, { status })
}

export function deleteStory(id: string) {
  return del<{ success: boolean }>(`/stories/${id}`)
}
