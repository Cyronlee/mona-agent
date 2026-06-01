import { get, post, patch, del } from "@/lib/api-client"

export interface Document {
  id: string
  folder: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export function fetchDocuments(folder?: string) {
  const params = folder ? { folder } : undefined
  return get<Document[]>("/documents", params)
}

export function fetchDocument(id: string) {
  return get<Document>(`/documents/${id}`)
}

export function fetchFolders() {
  return get<string[]>("/documents/folders")
}

export function createDocument(data: {
  folder: string
  title: string
  content?: string
}) {
  return post<Document>("/documents", data)
}

export function updateDocument(
  id: string,
  data: { folder?: string; title?: string; content?: string }
) {
  return patch<Document>(`/documents/${id}`, data)
}

export function deleteDocument(id: string) {
  return del<{ success: boolean }>(`/documents/${id}`)
}
