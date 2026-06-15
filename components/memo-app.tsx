"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIcon,
  CalendarDaysIcon,
  FlameIcon,
  HashIcon,
  LayoutListIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
  TrophyIcon,
  XIcon,
  ZapIcon,
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
        <span key={index} className="font-bold text-[#d7ff45]">
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
    const timer = window.setTimeout(() => {
      setMemos(loadMemos())
      setMounted(true)
    }, 0)

    return () => window.clearTimeout(timer)
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
      toast.error("先写点什么再开练")
      return
    }
    const memo = createMemo(trimmed)
    setMemos((prev) => [memo, ...prev])
    setDraft("")
    toast.success("本组闪念已记录")
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
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] text-[#d7ff45]">
        <div className="flex items-center gap-3 font-black tracking-[0.2em] uppercase">
          <ActivityIcon className="size-5 animate-pulse" />
          热身中
        </div>
      </div>
    )
  }

  return (
    <div className="sport-shell min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-24 size-80 rounded-full bg-[#147df5]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-[#ff3d81]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-[#d7ff45]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <header className="sport-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_35%,rgba(215,255,69,0.12)_35%,rgba(215,255,69,0.12)_48%,transparent_48%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff45] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-[#07111f] uppercase">
                  <ZapIcon className="size-3.5 fill-current" />
                  Mind Training
                </span>
                <span className="text-xs font-bold tracking-[0.18em] text-white/45 uppercase">
                  记录每一次灵感爆发
                </span>
              </div>
              <h1 className="text-4xl leading-none font-black tracking-[-0.06em] text-white sm:text-6xl">
                闪念
                <span className="bg-gradient-to-r from-[#d7ff45] via-[#ffb000] to-[#ff3d81] bg-clip-text text-transparent">
                  训练场
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 font-medium text-white/55 sm:text-base">
                思考也需要日复一日的训练。快速记下灵感、计划和复盘，
                让每一个念头都成为你持续进步的重量。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatChip icon={<FlameIcon />} value={memos.length} label="总记录" color="bg-[#ff5a36]" />
              <StatChip icon={<HashIcon />} value={tags.length} label="标签组" color="bg-[#147df5]" />
              <StatChip icon={<TrophyIcon />} value={filteredMemos.length} label="本轮命中" color="bg-[#ff3d81]" />
            </div>
          </div>
        </header>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-[#d7ff45]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索你的训练记录..."
            className="h-12 rounded-2xl border-white/10 bg-white/[0.07] pl-11 text-white shadow-xl shadow-black/10 placeholder:text-white/30 focus-visible:border-[#d7ff45]/60 focus-visible:ring-[#d7ff45]/20"
          />
        </div>

        <Card className="sport-panel rounded-[1.75rem] border-0 bg-[#102238]/95 py-0 ring-0">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-black tracking-[0.18em] text-[#d7ff45] uppercase">
              <span className="size-2 rounded-full bg-[#d7ff45] shadow-[0_0_14px_#d7ff45]" />
              今日加练
            </div>
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault()
                  handlePublish()
                }
              }}
              placeholder="此刻在想什么？写下来，用 #标签 归队..."
              rows={3}
              className="min-h-28 resize-none rounded-2xl border-white/10 bg-[#07111f]/70 p-4 text-base leading-7 text-white placeholder:text-white/25 focus-visible:border-[#d7ff45]/60 focus-visible:ring-[#d7ff45]/20"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="hidden text-xs font-medium text-white/35 sm:block">
                试试 #训练 #灵感 #复盘 · Ctrl + Enter 快速记录
              </p>
              <Button
                onClick={handlePublish}
                className="ml-auto h-11 rounded-xl bg-[#d7ff45] px-5 font-black text-[#07111f] shadow-[0_8px_30px_rgba(215,255,69,0.2)] hover:bg-[#e4ff78]"
              >
                <SendIcon data-icon="inline-start" />
                记一组
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <span className="text-xs font-black tracking-wider text-white/45 uppercase">当前筛选</span>
            {activeTag && <Badge className="border-0 bg-[#147df5] text-white">#{activeTag}</Badge>}
            {selectedDate && (
              <Badge className="border-0 bg-[#ffb000] text-[#07111f]">
                {formatMemoDate(selectedDate.toISOString())}
              </Badge>
            )}
            {search && <Badge className="border-0 bg-[#ff3d81] text-white">“{search}”</Badge>}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <XIcon data-icon="inline-start" />
              清除
            </Button>
          </div>
        )}

        <div className="grid flex-1 gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="flex flex-col gap-4">
            <Card className="sport-panel rounded-[1.5rem] border-0 py-0 ring-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-white uppercase">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-[#147df5]">
                    <HashIcon className="size-4" />
                  </span>
                  训练分组
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 pb-4">
                <Button
                  variant={activeTag === null ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 justify-start rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => setActiveTag(null)}
                >
                  全部
                  <span className="ml-auto rounded-lg bg-white/10 px-2 py-0.5 text-xs text-white/45">{memos.length}</span>
                </Button>
                {tags.map(({ name, count }) => (
                  <Button
                    key={name}
                    variant={activeTag === name ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 justify-start rounded-xl text-white/70 hover:bg-[#147df5]/20 hover:text-white"
                    onClick={() => setActiveTag((previous) => (previous === name ? null : name))}
                  >
                    #{name}
                    <span className="ml-auto rounded-lg bg-white/10 px-2 py-0.5 text-xs text-white/45">{count}</span>
                  </Button>
                ))}
                {tags.length === 0 && (
                  <p className="px-2 py-4 text-xs leading-5 text-white/35">
                    写下第一条记录，标签会自动在这里集合。
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="hidden overflow-hidden rounded-[1.5rem] bg-[#ff5a36] p-5 text-[#07111f] lg:block">
              <p className="text-xs font-black tracking-[0.18em] uppercase">Daily Motto</p>
              <p className="mt-8 text-2xl leading-7 font-black tracking-tight">
                记录不是停下，
                <br />
                是为了跑得更远。
              </p>
              <ActivityIcon className="mt-5 size-8" />
            </div>
          </aside>

          <main>
            <Tabs defaultValue="timeline">
              <TabsList className="h-11 rounded-2xl border border-white/10 bg-white/[0.06] p-1">
                <TabsTrigger
                  value="timeline"
                  className="rounded-xl px-4 text-white/45 data-active:bg-[#d7ff45] data-active:text-[#07111f]"
                >
                  <LayoutListIcon data-icon="inline-start" />
                  时间线
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="rounded-xl px-4 text-white/45 data-active:bg-[#147df5] data-active:text-white"
                >
                  <CalendarDaysIcon data-icon="inline-start" />
                  日历
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <ScrollArea className="h-[calc(100vh-20rem)] pr-2 sm:pr-4">
                  <div className="flex flex-col gap-3">
                    {filteredMemos.length === 0 ? (
                      <EmptyState />
                    ) : (
                      filteredMemos.map((memo) => (
                        <MemoCard
                          key={memo.id}
                          memo={memo}
                          onDelete={handleDelete}
                          onTagClick={(tag) =>
                            setActiveTag((previous) => (previous === tag ? null : tag))
                          }
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                  <Card className="sport-panel rounded-[1.5rem] border-0 text-white ring-0">
                    <CardContent className="pt-6">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ hasMemo: memoDates }}
                        modifiersClassNames={{
                          hasMemo:
                            "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#d7ff45] after:shadow-[0_0_8px_#d7ff45]",
                        }}
                      />
                      <p className="mt-3 text-center text-xs text-white/40">
                        亮点表示当天有记录，点击日期筛选
                      </p>
                    </CardContent>
                  </Card>

                  <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-white/50">
                        {selectedDate
                          ? `${formatMemoDate(selectedDate.toISOString())} · ${filteredMemos.length} 条`
                          : "选择日期查看当天记录"}
                      </p>
                      {selectedDate &&
                        filteredMemos.map((memo) => (
                          <MemoCard
                            key={memo.id}
                            memo={memo}
                            onDelete={handleDelete}
                            onTagClick={(tag) =>
                              setActiveTag((previous) => (previous === tag ? null : tag))
                            }
                          />
                        ))}
                      {selectedDate && filteredMemos.length === 0 && <EmptyState compact />}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
}) {
  return (
    <div className={`${color} min-w-20 rounded-2xl p-3 text-[#07111f] sm:min-w-24 sm:p-4`}>
      <div className="flex items-center justify-between [&_svg]:size-4">
        <span className="text-2xl font-black tracking-tighter sm:text-3xl">{value}</span>
        {icon}
      </div>
      <p className="mt-1 text-[10px] font-black tracking-[0.12em] uppercase opacity-65">{label}</p>
    </div>
  )
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="sport-panel rounded-[1.5rem] border-0 ring-0">
      <CardContent className={`flex flex-col items-center text-center text-white/45 ${compact ? "py-9" : "py-16"}`}>
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#d7ff45] text-[#07111f]">
          <ZapIcon className="size-7" />
        </span>
        <p className="font-black text-white">场上还是空的</p>
        <p className="mt-1 text-sm">写下一条闪念，开始今天的思维训练。</p>
      </CardContent>
    </Card>
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
    <Card className="memo-card group relative rounded-[1.5rem] border-0 py-0 ring-0">
      <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#d7ff45] via-[#147df5] to-[#ff3d81]" />
      <CardContent className="flex flex-col gap-4 p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="flex items-start justify-between gap-3">
          <p className="flex-1 whitespace-pre-wrap text-[15px] leading-7 font-medium text-white/90">
            {renderContent(memo.content)}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(memo.id)}
            aria-label="删除"
            className="text-white/25 opacity-100 hover:bg-[#ff5a36]/15 hover:text-[#ff7559] sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2Icon />
          </Button>
        </div>
        <Separator className="bg-white/8" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black tracking-wider text-white/30 uppercase">
            {formatMemoTime(memo.createdAt)}
          </span>
          {memo.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer border-[#147df5]/25 bg-[#147df5]/10 text-[#7db9ff] transition-colors hover:border-[#147df5]/60 hover:bg-[#147df5]/20"
              render={<button type="button" onClick={() => onTagClick(tag)} />}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
