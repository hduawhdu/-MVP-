import { format, isSameDay, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

import type { Memo } from "@/lib/types"

const STORAGE_KEY = "flash-memos"

export function extractTags(content: string): string[] {
  const matches = content.matchAll(/#([^\s#]+)/g)
  return [...new Set([...matches].map((m) => m[1]))]
}

export function loadMemos(): Memo[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getSampleMemos()
    const parsed = JSON.parse(raw) as Memo[]
    return Array.isArray(parsed) ? parsed : getSampleMemos()
  } catch {
    return getSampleMemos()
  }
}

export function saveMemos(memos: Memo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
}

export function createMemo(content: string): Memo {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    content: content.trim(),
    tags: extractTags(content),
    createdAt: now,
    updatedAt: now,
  }
}

export function getAllTags(memos: Memo[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const memo of memos) {
    for (const tag of memo.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"))
}

export function filterMemos(
  memos: Memo[],
  options: {
    search?: string
    tag?: string | null
    date?: Date | null
  }
): Memo[] {
  const query = options.search?.trim().toLowerCase() ?? ""

  return memos
    .filter((memo) => {
      if (options.tag && !memo.tags.includes(options.tag)) return false
      if (options.date && !isSameDay(parseISO(memo.createdAt), options.date)) {
        return false
      }
      if (!query) return true
      const inContent = memo.content.toLowerCase().includes(query)
      const inTags = memo.tags.some((t) => t.toLowerCase().includes(query))
      return inContent || inTags
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function getMemoDates(memos: Memo[]): Date[] {
  return memos.map((m) => parseISO(m.createdAt))
}

export function formatMemoTime(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd HH:mm", { locale: zhCN })
}

export function formatMemoDate(iso: string): string {
  return format(parseISO(iso), "yyyy年M月d日 EEEE", { locale: zhCN })
}

function getSampleMemos(): Memo[] {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  return [
    {
      id: "sample-1",
      content: "闪念备忘录 MVP 开工！记录每一个灵感瞬间 #灵感 #项目",
      tags: ["灵感", "项目"],
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    },
    {
      id: "sample-2",
      content: "参考 Memos 的时间线体验：打开即写，写完即走。#设计",
      tags: ["设计"],
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    },
    {
      id: "sample-3",
      content: "昨天记下的待办：整理标签体系，优化日历视图。#待办",
      tags: ["待办"],
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ]
}
