"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CalendarDaysIcon,
  HashIcon,
  LayoutListIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  createMemo,
  filterMemos,
  formatMemoDate,
  formatMemoTime,
  getAllTags,
  getMemoDates,
  loadMemos,
  saveMemos,
} from "@/lib/memo-store"
import type { Memo } from "@/lib/types"
function renderContent(content: string) {
  const parts = content.split(/(#[^\s#]+)/g)
  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span key={index} className="text-primary font-medium">
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function MemoApp() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMemos(loadMemos())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveMemos(memos)
  }, [memos, mounted])

  const tags = useMemo(() => getAllTags(memos), [memos])

  const filteredMemos = useMemo(
    () =>
      filterMemos(memos, {
        search,
        tag: activeTag,
        date: selectedDate ?? null,
      }),
    [memos, search, activeTag, selectedDate]
  )

  const memoDates = useMemo(() => getMemoDates(memos), [memos])

  const handlePublish = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed) {
      toast.error("写点什么再发布吧")
      return
    }
    const memo = createMemo(trimmed)
    setMemos((prev) => [memo, ...prev])
    setDraft("")
    toast.success("已记录闪念")
  }, [draft])

  const handleDelete = useCallback((id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id))
    toast.success("已删除")
  }, [])

  const clearFilters = () => {
    setActiveTag(null)
    setSelectedDate(undefined)
    setSearch("")
  }

  const hasFilters = Boolean(activeTag || selectedDate || search)

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        加载中…
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">闪念备忘录</h1>
          <p className="text-sm text-muted-foreground">
            打开即写 · 标签归档 · 日历回溯 · 全文搜索
          </p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="全文搜索…"
            className="pl-8"
          />
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handlePublish()
              }
            }}
            placeholder="此刻的想法… 用 #标签 分类，Ctrl+Enter 快速发布"
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              支持 Markdown 风格标签，例如 #灵感 #待办
            </p>
            <Button onClick={handlePublish}>
              <SendIcon data-icon="inline-start" />
              发布
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">当前筛选：</span>
          {activeTag && (
            <Badge variant="secondary">#{activeTag}</Badge>
          )}
          {selectedDate && (
            <Badge variant="secondary">{formatMemoDate(selectedDate.toISOString())}</Badge>
          )}
          {search && <Badge variant="secondary">「{search}」</Badge>}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XIcon data-icon="inline-start" />
            清除
          </Button>
        </div>
      )}

      <div className="grid flex-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <HashIcon className="size-4" />
                标签
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              <Button
                variant={activeTag === null ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => setActiveTag(null)}
              >
                全部
                <span className="ml-auto text-muted-foreground">{memos.length}</span>
              </Button>
              {tags.map(({ name, count }) => (
                <Button
                  key={name}
                  variant={activeTag === name ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start"
                  onClick={() =>
                    setActiveTag((prev) => (prev === name ? null : name))
                  }
                >
                  #{name}
                  <span className="ml-auto text-muted-foreground">{count}</span>
                </Button>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">暂无标签</p>
              )}
            </CardContent>
          </Card>
        </aside>

        <main>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">
                <LayoutListIcon data-icon="inline-start" />
                时间线
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDaysIcon data-icon="inline-start" />
                日历
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                <div className="flex flex-col gap-3">
                  {filteredMemos.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        没有匹配的备忘录，写一条新的吧
                      </CardContent>
                    </Card>
                  ) : (
                    filteredMemos.map((memo) => (
                      <MemoCard
                        key={memo.id}
                        memo={memo}
                        onDelete={handleDelete}
                        onTagClick={(tag) =>
                          setActiveTag((prev) => (prev === tag ? null : tag))
                        }
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                <Card>
                  <CardContent className="pt-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      modifiers={{
                        hasMemo: memoDates,
                      }}
                      modifiersClassNames={{
                        hasMemo:
                          "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                      }}
                    />
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      圆点表示当天有记录，点击日期筛选
                    </p>
                  </CardContent>
                </Card>

                <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                  <div className="flex flex-col gap-3">
                    {selectedDate ? (
                      <p className="text-sm text-muted-foreground">
                        {formatMemoDate(selectedDate.toISOString())} ·{" "}
                        {filteredMemos.length} 条
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        选择日期查看当天记录
                      </p>
                    )}
                    {selectedDate &&
                      filteredMemos.map((memo) => (
                        <MemoCard
                          key={memo.id}
                          memo={memo}
                          onDelete={handleDelete}
                          onTagClick={(tag) =>
                            setActiveTag((prev) =>
                              prev === tag ? null : tag
                            )
                          }
                        />
                      ))}
                    {selectedDate && filteredMemos.length === 0 && (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          这一天还没有记录
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function MemoCard({
  memo,
  onDelete,
  onTagClick,
}: {
  memo: Memo
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
            {renderContent(memo.content)}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(memo.id)}
            aria-label="删除"
          >
            <Trash2Icon />
          </Button>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatMemoTime(memo.createdAt)}
          </span>
          {memo.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer"
              render={
                <button
                  type="button"
                  onClick={() => onTagClick(tag)}
                />
              }
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
