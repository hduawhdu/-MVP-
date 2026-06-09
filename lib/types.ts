export interface Memo {
  id: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type ViewMode = "timeline" | "calendar"
