# 闪念备忘录 MVP

轻量版个人闪念备忘录，借鉴 [Memos](https://github.com/usememos/memos) 的「打开即写」体验。

## 功能

- **快速输入** — 顶部输入框，`Ctrl+Enter` 一键发布
- **标签** — 正文内 `#标签` 自动解析，侧边栏按标签筛选
- **日历视图** — 有记录的日期显示圆点，点击日期查看当天备忘
- **全文搜索** — 搜索正文与标签

数据保存在浏览器 `localStorage`，无需后端。

## 技术栈

- Next.js 16 + React 19
- shadcn/ui + Tailwind CSS v4
- date-fns

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 为何未直接复现 Memos

[Memos](https://github.com/usememos/memos) 是 Go 后端 + 完整自托管方案（Docker / SQLite），适合生产部署，但 2–4 小时 MVP 更适合抽取其核心交互，用 Next.js 做前端单页 demo。

## 项目结构

```
app/
  layout.tsx          # 根布局
  page.tsx            # 入口页
components/
  memo-app.tsx        # 主应用（输入、列表、标签、日历、搜索）
  ui/                 # shadcn 组件
lib/
  types.ts            # 类型定义
  memo-store.ts       # 存储、标签解析、筛选逻辑
```
