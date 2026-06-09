import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, "..", "闪念备忘录-小白入门指南.docx")

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } })
}

function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 } })
}

function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } })
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, size: 24, ...opts })],
  })
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80, line: 340 },
  })
}

function code(text) {
  return new Paragraph({
    spacing: { after: 100, line: 300 },
    children: [new TextRun({ text, font: "Consolas", size: 22 })],
  })
}

function table(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22 })] })],
          shading: { fill: "E8E8E8" },
        })
    ),
  })
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 22 })] })],
            })
        ),
      })
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [headerRow, ...dataRows],
  })
}

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "闪念备忘录 · 小白入门指南", bold: true, size: 44 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new TextRun({ text: "项目路径：f:\\beiwanglu", size: 22, color: "666666" }),
          ],
        }),

        h1("一、这份文档是干什么的？"),
        p("这是一份给零基础新手看的说明。你不需要先学会编程，只要按顺序读下去，就能大致明白："),
        bullet("这个项目用了哪些「框架」和「工具」"),
        bullet("文件是怎么分工的"),
        bullet("用户点按钮之后，程序内部发生了什么"),
        bullet("以后想改功能，应该去哪个文件找"),

        h1("二、用了什么框架？（一句话版）"),
        p("这是一个「网页应用」，用浏览器打开就能用。核心技术可以记成下面这张表："),

        table(
          ["名字", "它是什么", "在这个项目里干什么"],
          [
            ["Next.js", "React 网页框架", "负责整个网站的页面路由、打包和运行"],
            ["React", "做界面的 JavaScript 库", "把页面拆成可复用的「组件」，像乐高积木"],
            ["TypeScript", "带类型的 JavaScript", "写代码时就能发现错误，更像「有说明书的 JS」"],
            ["Tailwind CSS", "样式工具", "用 class 名字直接写颜色、间距、布局"],
            ["shadcn/ui", "现成 UI 组件库", "按钮、输入框、日历、卡片等，不用从零画"],
            ["localStorage", "浏览器自带存储", "把备忘录保存在你电脑浏览器里，不用服务器"],
            ["date-fns", "日期处理库", "格式化时间、判断是不是同一天"],
            ["sonner", "提示条组件", "发布成功、删除成功时弹出小提示"],
          ]
        ),

        new Paragraph({ spacing: { after: 200 } }),

        h2("和参考项目 Memos 的区别"),
        p("Memos 是 Go 语言写的完整自托管产品，需要 Docker、数据库，适合正式上线。"),
        p("我们这个项目是「轻量演示版」：只保留「打开就写、标签、日历、搜索」的核心体验，数据存在浏览器本地，适合学习和快速演示。"),

        h1("三、怎么理解「程序设计」？（用生活比喻）"),
        p("可以把整个程序想成一家小餐馆："),

        h3("1. 门面与装修 — app/ 文件夹"),
        bullet("layout.tsx：整栋楼的「外壳」，所有页面共用的 HTML 结构、标题、全局提示"),
        bullet("page.tsx：首页入口，相当于「请进」，里面只放了一个 MemoApp 组件"),
        bullet("globals.css：全站颜色和字体等「装修风格」"),

        h3("2. 大堂与操作台 — components/memo-app.tsx"),
        p("这是整个应用最核心的文件，大约 370 行。它负责："),
        bullet("显示输入框、搜索框、标签列表、时间线、日历"),
        bullet("记住用户正在输入什么、选了哪个标签、选了哪一天"),
        bullet("用户点「发布」「删除」「筛选」时，调用下面的「后厨逻辑」"),

        h3("3. 后厨与菜谱 — lib/ 文件夹"),
        bullet("types.ts：定义「一条备忘录长什么样」（id、内容、标签、时间）"),
        bullet("memo-store.ts：真正的业务逻辑——读存数据、解析 #标签、搜索、按日期筛选"),

        h3("4. 餐具和盘子 — components/ui/ 文件夹"),
        p("shadcn/ui 提供的标准组件：Button、Card、Input、Calendar 等。我们只负责「摆盘组合」，不负责从零造轮子。"),

        h1("四、文件结构一览"),
        code("beiwanglu/"),
        code("├── app/"),
        code("│   ├── layout.tsx      ← 全站外壳"),
        code("│   ├── page.tsx        ← 首页，引入 MemoApp"),
        code("│   └── globals.css     ← 全局样式"),
        code("├── components/"),
        code("│   ├── memo-app.tsx    ← ★ 主界面 + 交互逻辑"),
        code("│   └── ui/             ← 按钮、卡片等 UI 零件"),
        code("├── lib/"),
        code("│   ├── types.ts        ← 数据类型定义"),
        code("│   └── memo-store.ts   ← ★ 数据读写与筛选"),
        code("├── package.json        ← 项目依赖清单"),
        code("└── README.md           ← 简要说明"),

        h1("五、数据是怎么流动的？（最重要）"),
        p("按用户使用顺序理解："),

        h3("步骤 1：打开网页"),
        bullet("浏览器访问 localhost:3000"),
        bullet("Next.js 加载 app/page.tsx → 渲染 MemoApp 组件"),
        bullet("MemoApp 启动时从 localStorage 读取历史备忘录（memo-store.ts 的 loadMemos）"),

        h3("步骤 2：写一条新备忘"),
        bullet("用户在 Textarea 里打字 → React 的 useState 保存到 draft 变量"),
        bullet("按 Ctrl+Enter 或点「发布」→ 调用 createMemo() 生成一条新记录"),
        bullet("新记录插入 memos 数组最前面 → useEffect 自动 saveMemos 写入 localStorage"),

        h3("步骤 3：标签自动出现"),
        bullet("createMemo 会用正则匹配正文里的 #标签，例如「今天很开心 #生活」"),
        bullet("提取出标签数组 tags: [\"生活\"]"),
        bullet("侧边栏 getAllTags() 统计每个标签出现次数"),

        h3("步骤 4：搜索 / 筛标签 / 选日期"),
        bullet("搜索框改 search → filterMemos() 在内容和标签里找关键词"),
        bullet("点侧边栏标签 → 设置 activeTag → 只显示含该标签的备忘"),
        bullet("日历 Tab 选某天 → 设置 selectedDate → 只显示那天的备忘"),
        bullet("filteredMemos 是「算出来」的结果，界面只负责显示它"),

        h3("步骤 5：删除"),
        bullet("点删除按钮 → 从 memos 数组里去掉那条 → 自动保存到 localStorage"),

        h1("六、React 里几个新手必懂的概念"),
        table(
          ["概念", "通俗解释", "在本项目中的例子"],
          [
            ["组件 Component", "一块可复用的界面", "MemoApp、MemoCard、Button"],
            ["state 状态", "会变化的数据", "memos、draft、search、activeTag"],
            ["useState", "声明一块会变的数据", "const [memos, setMemos] = useState([])"],
            ["useEffect", "在特定时机执行副作用", "页面加载时读数据；数据变了就保存"],
            ["useMemo", "缓存计算结果，避免重复算", "filteredMemos、tags"],
            ["props 属性", "父组件传给子组件的参数", "MemoCard 接收 memo、onDelete"],
            ["\"use client\"", "标记这段代码在浏览器运行", "memo-app.tsx 第一行"],
          ]
        ),

        new Paragraph({ spacing: { after: 200 } }),

        h1("七、一条备忘录的数据长什么样？"),
        p("在 lib/types.ts 里定义，实际存进浏览器的是 JSON："),
        code("{"),
        code('  "id": "随机唯一编号",'),
        code('  "content": "今天想到一个好主意 #灵感",'),
        code('  "tags": ["灵感"],'),
        code('  "createdAt": "2026-06-09T10:30:00.000Z",'),
        code('  "updatedAt": "2026-06-09T10:30:00.000Z"'),
        code("}"),
        p("多条这样的记录组成一个数组，整个数组存在 localStorage 的键 flash-memos 下。"),

        h1("八、想改功能，该改哪里？"),
        table(
          ["你想改…", "去这个文件"],
          [
            ["页面标题、描述", "app/layout.tsx"],
            ["整体布局、加新按钮、改交互", "components/memo-app.tsx"],
            ["标签解析规则、搜索逻辑、示例数据", "lib/memo-store.ts"],
            ["备忘录字段（比如加「置顶」）", "lib/types.ts + memo-store.ts + memo-app.tsx"],
            ["按钮/卡片外观", "components/ui/ 对应组件"],
            ["全站配色", "app/globals.css"],
          ]
        ),

        new Paragraph({ spacing: { after: 200 } }),

        h1("九、怎么在本机运行？"),
        bullet("1. 安装 Node.js（项目用的是 v24）"),
        bullet("2. 打开终端，进入项目目录：cd f:\\beiwanglu"),
        bullet("3. 安装依赖：npm install"),
        bullet("4. 启动开发服务器：npm run dev"),
        bullet("5. 浏览器打开 http://localhost:3000"),
        p("开发模式下，改代码保存后页面会自动刷新。"),

        h1("十、推荐的学习顺序（给小白）"),
        bullet("第 1 步：读 lib/types.ts（只有几行，看懂「一条记录」的结构）"),
        bullet("第 2 步：读 app/page.tsx 和 app/layout.tsx（入口很短）"),
        bullet("第 3 步：读 lib/memo-store.ts（理解数据怎么存、怎么筛）"),
        bullet("第 4 步：读 components/memo-app.tsx（对照浏览器界面，一段段看）"),
        bullet("第 5 步：试着改一个小地方，比如把「发布」改成「记下」，保存看效果"),

        h1("十一、常见名词中英对照"),
        table(
          ["中文", "英文", "记忆提示"],
          [
            ["框架", "Framework", "帮你搭好房子骨架"],
            ["库", "Library", "提供现成工具函数"],
            ["组件", "Component", "界面的一块积木"],
            ["状态", "State", "会随用户操作变化的数据"],
            ["路由", "Route", "不同网址对应不同页面"],
            ["本地存储", "localStorage", "浏览器里的小仓库"],
            ["依赖", "Dependency", "package.json 里列出的第三方包"],
          ]
        ),

        new Paragraph({ spacing: { after: 200 } }),

        h1("十二、总结"),
        p("这个项目 = Next.js（网站框架）+ React（界面）+ shadcn/ui（好看组件）+ localStorage（本地存数据）。"),
        p("设计思路是「分层」：界面在 components，业务逻辑在 lib，入口在 app。界面负责「显示和响应点击」，lib 负责「怎么处理数据」。"),
        p("作为小白，不必一次看懂所有代码。先跟着「用户发布一条备忘」这条线走一遍，再慢慢扩展。"),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [
            new TextRun({ text: "— 文档完 —", size: 22, color: "888888", italics: true }),
          ],
        }),
      ],
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outputPath, buffer)
console.log("已生成：" + outputPath)
