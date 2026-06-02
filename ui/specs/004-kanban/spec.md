# Spec 004 — Kanban（看板）

> 状态：**草稿**

---

## 概述

Kanban 看板模块是 Mona 的核心工作流管理界面。用户可通过 AI 助手（Agent）将 **Documents（文档库）** 中的文档转化为 **Story Card（故事卡）**，并拖拽卡片完成状态流转，实现从文档到可执行任务的端到端管理。

### 核心流程

1. 用户在 Documents 模块中维护若干文档（需求文档、设计稿、参考代码等）
2. 用户在 Chat Panel 中与 Agent 对话，要求 Agent 根据某些 Documents 生成 Story Card
3. Agent 调用工具 `create_story_from_document`，将 Story Card 放入看板**第一列（Backlog）**
4. 用户在看板中拖拽卡片流转状态，点击卡片可查看/编辑其完整内容（标题、正文、字段等）

---

## 阶段一：数据模型（Prisma）

### 1. StoryStatus 枚举 & StoryCard 表

```prisma
enum StoryStatus {
  BACKLOG
  IN_PROGRESS
  IN_REVIEW
  DONE
  BLOCKED
  CANCELLED
}

model StoryCard {
  id         String      @id @default(cuid())
  title      String
  content    String      @default("")
  status     StoryStatus @default(BACKLOG)
  priority   String      @default("medium") // "urgent" | "high" | "medium" | "low"
  documentId String?
  document   Document?   @relation(fields: [documentId], references: [id], onDelete: SetNull)
  tags       String      @default("[]") // JSON array of tag strings, e.g. ["Frontend", "AI"]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  statusLogs StoryStatusLog[]

  @@index([status])
  @@index([documentId])
}
```

### 2. StoryStatusLog 表（状态变更审计日志）

```prisma
model StoryStatusLog {
  id         String       @id @default(cuid())
  cardId     String
  card       StoryCard    @relation(fields: [cardId], references: [id], onDelete: Cascade)
  fromStatus StoryStatus? // null 表示初始创建
  toStatus   StoryStatus
  createdAt  DateTime     @default(now())

  @@index([cardId])
}
```

### 3. 状态流转规则

| 从 \ 到 | BACKLOG | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED | CANCELLED |
|---|---|---|---|---|---|---|
| BACKLOG | - | ✅ | ❌ | ❌ | ✅ | ✅ |
| IN_PROGRESS | ✅ (revert) | - | ✅ | ❌ | ✅ | ✅ |
| IN_REVIEW | ❌ | ✅ (rework) | - | ✅ | ✅ | ✅ |
| DONE | ❌ | ❌ | ❌ | - | ❌ | ❌ |
| BLOCKED | ❌ | ✅ (unblock) | ❌ | ❌ | - | ✅ |
| CANCELLED | ❌ | ❌ | ❌ | ❌ | ❌ | - |

**语义说明：**
- **BACKLOG** → **IN_PROGRESS**：开始处理
- **IN_PROGRESS** → **BACKLOG**：移回待办（暂不处理）
- **IN_PROGRESS** → **IN_REVIEW**：提审
- **IN_REVIEW** → **IN_PROGRESS**：打回重做
- **IN_REVIEW** → **DONE**：完成（终态）
- **任意（除 DONE/CANCELLED）→ BLOCKED**：被阻塞
- **BLOCKED** → **IN_PROGRESS**：解除阻塞，恢复进行
- **任意（除 DONE）→ CANCELLED**：取消（终态）
- **DONE / CANCELLED**：不可迁出

---

## 阶段二：后端 API

### 路由

| 方法 | 路由 | 说明 |
|---|---|---|
| GET | `/api/stories` | 获取所有 Story Card，支持 `?status=BACKLOG` 过滤 |
| POST | `/api/stories` | 创建 Story Card。Body: `{ title, content?, priority?, documentId?, tags? }` |
| GET | `/api/stories/:id` | 获取单个 Story Card（含 statusLogs） |
| PATCH | `/api/stories/:id` | 更新 Story Card 字段（title, content, priority, tags）。不可直接改 status |
| PATCH | `/api/stories/:id/status` | 状态流转。Body: `{ status: "IN_PROGRESS" }`，服务端校验合法性并记录 log |
| DELETE | `/api/stories/:id` | 删除 Story Card |

### 状态流转校验逻辑（后端实现要点）

```
function transition(from: StoryStatus, to: StoryStatus): boolean {
  const ALLOWED: Record<StoryStatus, StoryStatus[]> = {
    BACKLOG:     ["IN_PROGRESS", "BLOCKED", "CANCELLED"],
    IN_PROGRESS: ["BACKLOG", "IN_REVIEW", "BLOCKED", "CANCELLED"],
    IN_REVIEW:   ["IN_PROGRESS", "DONE", "BLOCKED", "CANCELLED"],
    DONE:        [],
    BLOCKED:     ["IN_PROGRESS", "CANCELLED"],
    CANCELLED:   [],
  }
  return ALLOWED[from]?.includes(to) ?? false
}
```

---

## 阶段三：Agent 工具接口

在 `backend/src/tools/index.ts` 中新增以下工具，供 Agent 在对话中调用：

### 工具列表

| 工具名 | 说明 | 参数 |
|---|---|---|
| `create_story_from_document` | 根据指定 Document 创建 Story Card，放入 Backlog | `documentId` (必填), `title` (可选，默认用文档标题), `priority` (可选) |
| `create_story` | 直接创建 Story Card（不依赖文档） | `title`, `content?`, `priority?`, `tags?` |
| `list_stories` | 查看当前看板所有卡片 | `status?` 可选过滤 |
| `get_story` | 查看 Story Card 详情 | `storyId` |
| `update_story` | 更新卡片字段 | `storyId`, `title?`, `content?`, `priority?`, `tags?` |
| `transition_story` | 流转卡片状态 | `storyId`, `status` |

### 典型 Agent 对话示例

```
User: "根据 Gmail 文件夹里的那篇《邮件智能分类需求文档》帮我创建一个 Story Card"

Agent: (calls search_documents → get_document → create_story_from_document)
       "已创建 Story Card「邮件智能分类需求文档」，放入 Backlog 列"
```

---

## 阶段四：前端看板

### 组件架构

```
components/mona/
├── TasksView.tsx            # 看板容器（改为从 API 加载）
├── StoryCard.tsx            # 卡片组件（可拖拽）
├── StoryDetailDialog.tsx    # 卡片详情弹窗（编辑 title/content/priority/tags）
└── KanbanColumn.tsx         # 看板列容器（含 drop zone）
```

### 4.1 看板布局（KanbanView / TasksView）

- 6 列：Backlog / In Progress / In Review / Done / Blocked / Cancelled
- 每列上方显示列名 + 数量 Badge
- 从 API `GET /api/stories` 加载数据
- **拖拽功能**：使用 `@dnd-kit` 或原生 HTML5 Drag & Drop，拖拽触发 `PATCH /api/stories/:id/status`
- 拖拽时校验状态流转合法性，非法目标列提示错误、不执行移动
- 列宽可根据 Story Card 数量自动缩放，最少 4 列布局（超过 4 列可横向滚动）

### 4.2 Story Card 组件

- 标题（line-clamp-2）
- ID 编号（如 `#cuid短前缀`）
- 优先级标记（● 颜色点）
- 标签 Badge 行
- 创建时间（相对时间）
- 来源文档链接（如有 `documentId`）
- 悬停显示高亮边框、阴影

### 4.3 Story Detail Dialog

点击任意 Story Card 打开 Dialog：

- **标题**：可编辑 `<input>`
- **内容**：可编辑的 Markdown 编辑器（与 Documents 模块一致，复用 MDX Editor）
- **元信息区**：
  - 状态（Badge 显示，不可编辑）
  - 优先级（下拉切换）
  - 标签（Tag 输入/选择）
  - 创建时间、更新时间
  - 来源文档链接（如有）
  - 状态变更历史（时间线展示 statusLogs）
- **保存**：PATCH `/api/stories/:id` 持久化
- **删除**：底部删除按钮，二次确认

### 4.4 看板列排序（后续迭代）

- 每列内卡片支持拖拽排序（`order` 字段）
- 可选：根据优先级、创建时间自动排列

---

## 阶段五：实现顺序

| Step | 内容 | 依赖 |
|---|---|---|
| 1 | Prisma 数据模型: StoryCard + StoryStatusLog 表，生成 migration | - |
| 2 | 后端 CRUD API: `/api/stories` 路由，含状态流转校验 | Step 1 |
| 3 | Agent 工具: 新增 story 相关 tools | Step 2 |
| 4 | 前端重构 TasksView → KanbanView，从 API 加载数据 | Step 2 |
| 5 | StoryCard 组件 + StoryDetailDialog | Step 4 |
| 6 | 拖拽状态流转（@dnd-kit 集成） | Step 4 |
