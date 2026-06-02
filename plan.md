# agent coding 功能迁移方案

## 目标

将 `backend/` 中**仅 agent coding 相关**的功能迁移到 `app/`：

- AI agent 循环（`streamText` + 工具调用）
- 文件操作工具（`read` / `write` / `edit` / `bash`，含后台进程）
- 聊天会话与历史消息持久化
- 后台进程状态查询

**不在本次迁移范围**（按用户决定，砍掉）：

- `Document` 与 `StoryCard` 的 CRUD 接口
- 9 个文档/故事相关 tool（`search_documents`、`get_document`、`update_document`、`delete_document`、`create_story*`、`list_stories`、`get_story`、`update_story`、`transition_story`、`delete_story`）
- `backend/src/index.ts` 中 `DELETED ALL STORIES` 的破坏性启动逻辑（新代码不引入；旧代码不删，留作遗留）

**遗留代码**：`backend/` 与 `ui/` 整目录冻结，不修改。`dev.sh` 不再使用。

## 架构变化

| 维度 | 旧 (`backend/`) | 新 (`app/`) |
|---|---|---|
| 框架 | Hono on Bun | Next.js 16 Route Handlers |
| 端口 | 5679（独立进程） | 3000（同 Next.js 进程） |
| 存储 | Prisma + SQLite | 文件系统（JSON + JSONL） |
| 进程模型 | `Bun.spawn` | `node:child_process.spawn` |
| API 路径前缀 | `/api/chat`、`/api/documents` | `/api/projects/[projectSlug]/chat/...` |
| 跨域 | 需 CORS 中间层 | 同源，无需 CORS |
| 消费方 | `ui/` Vite 跨端口 fetch | `app/mona/` 内部组件 |

## 落盘布局

所有运行时数据按 `projectSlug` 分目录存放，藏在产品项目目录的隐藏子目录中：

```
projects/<projectSlug>/
├── project.json                       # 既有产品元数据（不动）
├── PRD.md                             # 既有（不动）
├── features/                          # 既有（不动）
│   └── <featureSlug>/
│       ├── feature.json
│       ├── index.md
│       ├── story/<storySlug>.md
│       └── suggestions/<slug>.md
└── .runtime/                          # 新增：项目作用域的运行时数据
    ├── sessions/
    │   ├── <sessionId>.json           # 会话元信息（id/title/projectSlug/createdAt/updatedAt）
    │   └── <sessionId>.jsonl          # 消息流（append-only，按 createdAt 排序）
    └── jobs/
        ├── <jobId>.json               # 任务元信息（command/cwd/pid/status/timestamps）
        └── <jobId>.log                # 任务日志（append-only）
```

设计要点：

- **按 projectSlug 分目录** —— `ChatSession` 与 `projectSlug` 隐式关联（通过目录名），URL 路径与存储路径一致
- **Session 列表 JSON + 消息流 JSONL** —— 元数据低频读写用 JSON；消息是流式追加，用 append-only JSONL 天然契合
- **Job 元数据 + 日志分离** —— 日志可能巨大，单独放 `.log` 文件便于 tail
- **`.runtime/` 加点前缀** —— 避免与产品内容目录混淆，也便于整目录清理

## 数据类型

### ChatSession（`.runtime/sessions/<id>.json`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `nanoid` 生成 |
| `title` | string | 首条用户消息或首个 step 的文本截取（≤60 字符） |
| `projectSlug` | string | 来自 URL 路径 |
| `createdAt` | string (ISO) | 首次创建 |
| `updatedAt` | string (ISO) | 任何消息追加后更新 |

### ChatMessage（`.runtime/sessions/<id>.jsonl` 一行一条）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `nanoid` |
| `role` | `"user" \| "assistant"` | 沿用 AI SDK 约定 |
| `content` | string | 文本部分 |
| `toolCallsJson` | string \| null | 该 step 的工具调用+结果序列化为 JSON 数组（含 `toolCallId`/`toolName`/`args`/`result`/`providerMetadata`） |
| `createdAt` | string (ISO) | 写入时刻 |

### BackgroundJob（`.runtime/jobs/<id>.json`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `nanoid` |
| `command` | string | bash 命令 |
| `cwd` | string | 工作目录 |
| `pid` | number \| null | 进程 PID |
| `status` | `"running" \| "completed" \| "failed"` | 当前状态 |
| `createdAt` | string (ISO) | 启动时刻 |
| `updatedAt` | string (ISO) | 任何状态变化时更新 |

日志通过 `appendFile` 追加到 `<id>.log`，不进入 JSON。

## 并发与一致性

- **JSONL 追加**：用 `proper-lockfile` 对每个文件加锁，串行化并发写
- **JSON 整体改写**：读 → 改 → 原子写（写临时文件 + `rename`），加锁
- **后台进程日志**：append-only，写前也加锁
- **agent loop 多步写入**：`onFinish` 中可能产生多条消息，需按 step 顺序串行追加；锁粒度 = 单 session 的 `.jsonl` 文件

## API 路由

| 方法 | 路径 | 行为 |
|---|---|---|
| `POST` | `/api/projects/[projectSlug]/chat` | 启动一次 agent 循环；流式返回 UIMessage Stream；请求体同 AI SDK v6 `useChat` 协议 |
| `GET` | `/api/projects/[projectSlug]/chat/sessions` | 列出该项目所有 session（按 `updatedAt` desc） |
| `GET` | `/api/projects/[projectSlug]/chat/sessions/[id]` | 返回单个 session 及其所有消息（按 `createdAt` asc） |
| `GET` | `/api/projects/[projectSlug]/chat/jobs/[id]` | 返回后台任务的 `status`/`pid`/时间戳；`logs` 字段从 `.log` 读取（可选，避免大字段） |

所有路由参数与现有 `app/app/api/projects/[projectSlug]/...` 风格一致。

## 关键模块

```
app/lib/
├── runtime/
│   ├── paths.ts                # 解析 .runtime/ 下文件路径
│   ├── lock.ts                 # proper-lockfile 包装
│   ├── sessions.ts             # 会话 CRUD
│   ├── messages.ts             # 消息 append / list
│   ├── jobs.ts                 # 任务 CRUD + 状态变更
│   └── process-manager.ts      # Node child_process 进程管理
└── agent/
    ├── runner.ts               # streamText 主循环，包装为 UIMessage Stream
    └── tools.ts                # 4 个 file/bash tool
```

## Agent Runner 行为

继承 `backend/src/agent/runner.ts` 的语义，按以下调整：

1. **session 解析**：`sessionId` 来自请求体；不存在或不属于该 `projectSlug` 时创建新 session
2. **持久化用户消息**：append 到 `<sessionId>.jsonl`
3. **加载历史**：从 `.jsonl` 读全量消息，重建 `CoreMessage`（含 tool-call / tool-result 对）
4. **运行**：`streamText({ model, messages, tools, stopWhen: isLoopFinished() })`
5. **`onFinish`**：每个 step 序列化为一条 assistant 消息并追加；如最终文本非空且消息数 ≤ 4 则更新 session.title
6. **响应流**：用 `createUIMessageStream` 注入 `messageMetadata: { sessionId, projectSlug }` 后返回 `Response`

## 工具集（缩减后）

| Tool | 行为 |
|---|---|
| `read` | 读文件；超 500 行时仅返回首窗口并附 `warning`；支持 `lineStart`/`lineEnd` 范围读取 |
| `write` | 写文件；自动 `mkdir -p`；返回字节数 |
| `edit` | search-and-replace；空白不敏感匹配；`lineHint` 消歧义 |
| `bash` | 执行命令；`background=true` 时注册到 process-manager 立即返回 `jobId`；否则同步执行（默认 30s 超时） |

**工作区根**：`AGENT_WORKSPACE` 环境变量（缺省 `process.cwd()`）。

## 后台进程管理

替代 `backend/src/process-manager/index.ts`：

- **数据结构**：`Map<jobId, ChildProcess>` 内存表 + `.runtime/jobs/<id>.json` 持久化 + `.runtime/jobs/<id>.log` 追加日志
- **`initialize()`**（Next.js `instrumentation.ts` 钩子）：扫描所有 `.runtime/jobs/*.json`，把 `status=running` 的标 `failed`（清理僵尸任务）
- **stdout/stderr 采集**：`Readable` 流 → `TextDecoder` 逐块 → `appendFile` 到 `.log`
- **退出处理**：`exit code 0 → completed`，非零或异常 → `failed`
- **替换 `Bun.spawn`** → `child_process.spawn(cmd, { shell: true, cwd, stdio: ['ignore', 'pipe', 'pipe'] })`

## 依赖变更

### `app/` 装入

- `ai@6`（与 `backend/` 一致）
- `@ai-sdk/google`
- `proper-lockfile`

### `app/` 已有（直接用）

- `zod`、`nanoid`、`gray-matter`、`next`、`react`

### 不引入

- `prisma`、`@prisma/client`、`prisma-adapter-bun-sqlite`
- `hono`、`@hono/node-server`
- `bun-types`（不写 Bun 专用 API）

## 环境变量

写到 `app/.env.local`（Next.js 约定，gitignore）：

- `GOOGLE_GENERATIVE_AI_API_KEY`（必需）
- `AGENT_WORKSPACE`（可选，agent file/bash 操作的根目录）
- `GEMINI_MODEL`（可选，默认 `gemini-2.5-flash`）

## 自动化检查

每次改动后：

```bash
cd app && bun run build      # tsc + next build
cd app && bun run lint       # ESLint
```

## 执行顺序

1. 装 `app/` 依赖
2. 写 `app/lib/runtime/` 全套（paths → lock → sessions → messages → jobs → process-manager）
3. 写 `app/lib/agent/tools.ts`（4 个 tool）
4. 写 `app/lib/agent/runner.ts`
5. 写 4 个 Route Handler
6. 配置 `app/.env.local`
7. `bun run build` + `bun run lint` 通过
8. 手工 smoke：起 `next dev`，POST 一次 `/api/projects/acme-feedback/chat`，确认流式返回 + session 落盘

## 不在本次范围

- 移动 `ui/` 或 `backend/` 文件
- 更新顶层 `AGENTS.md`（如需可后续补，本轮不强行改动）
- Story / Document 任何功能
- 把 chat 接入 `app/mona/components/`（前端 UI 集成是另一项工作）
- 鉴权 / 多用户隔离（保持当前单用户开发态）
