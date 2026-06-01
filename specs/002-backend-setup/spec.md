# Spec 002 — Backend Setup

> 状态：**已完成**
> 实现路径：`/backend`（Bun + Hono + Prisma 7 + SQLite）
> 前端接入路径：`/ui/src/components/mona/chat/`

---

## 阶段一：基于 Hono + SQLite + Prisma 的后端核心搭建 ✅

### 1. 环境、基础路由与跨域

- 采用 **Hono** 作为 Web 服务器，运行时为 **Bun**（端口 5679）。
- 配置 CORS 中间件，允许前端 `http://localhost:5678` 跨域访问，无需 Vite proxy。
- 入口文件：`backend/src/index.ts`

### 2. 数据库与持久化层（SQLite + Prisma 7）

- 使用 **Prisma 7** + **prisma-adapter-bun-sqlite**（零依赖，直接调用 `bun:sqlite`）。
- 通过 `prisma.config.ts` 管理数据源 URL，与 `schema.prisma` 解耦（Prisma 7 新规范）。
- 三张核心表（`backend/prisma/schema.prisma`）：
  - **ChatSession**：`id`、`title`、`createdAt`、`updatedAt`
  - **ChatMessage**：`id`、`sessionId`、`role`（user/assistant）、`content`、`toolCallsJson`（工具调用历史 JSON，含 `thoughtSignature`）、`createdAt`
  - **BackgroundJob**：`id`、`command`、`status`（running/completed/failed）、`cwd`、`pid`、`logs`、`createdAt`、`updatedAt`
- 数据库文件：`backend/prisma/dev.db`

### 3. AgentRunner — 与 HTTP 解耦的核心循环

- 核心类：`backend/src/agent/runner.ts`
- **架构原则**：`AgentRunner.run()` 返回标准 `Response`，与 HTTP 传输层完全解耦。HTTP 路由、未来的 WebSocket、后台定时触发均可直接调用，无需修改 Agent 逻辑。
- 使用 **`streamText`**（AI SDK v6）+ **Gemini 2.5 Flash**（`@ai-sdk/google`）。
- 多步循环控制：使用 **`stopWhen: isLoopFinished()`**（AI SDK v6 替代了旧版 `maxSteps`），允许 Agent 无限"思考 → 工具调用 → 再思考"直到模型主动停止。
- 持久化时机：在 `onFinish` 回调中，遍历所有 `steps`，每个 step 存为一条 ChatMessage（text + toolCallsJson 合并）。工具调用保存完整的 `providerMetadata`（含 Gemini `thoughtSignature`），避免历史重放时触发 SDK 警告。
- **Session ID 传递**：通过 `createUIMessageStream` 在流的首个 `start` chunk 注入 `messageMetadata: { sessionId }`，前端从 `onFinish` 的 `message.metadata` 中捕获。

### 4. Agent Tools（`backend/src/tools/index.ts`）

使用 Zod 定义参数，所有工具默认工作目录为 `AGENT_WORKSPACE` 环境变量。

| 工具 | 说明 |
|------|------|
| **read** | 带窗口防爆：文件超 500 行且未指定行号时自动截断，返回警告引导分段读取 |
| **write** | `mkdir -p` 语义，写入前自动递归创建父目录 |
| **edit** | 空白归一化匹配 + `lineHint` 消歧义；多处匹配且无 hint 时拒绝操作 |
| **bash** | 同步模式（带超时）/ 异步后台模式；后台模式立即写入 BackgroundJob 表并返回 `jobId` |

### 5. 进程管理器（`backend/src/process-manager/index.ts`）

- 内存映射表 `Map<jobId, Subprocess>`，用于执行强杀（`processManager.kill(jobId)`）。
- 启动时通过 `initialize()` 将 SQLite 中残留 `running` 状态的 job 批量标记为 `failed`（僵尸清理）。
- 后台进程的 stdout/stderr 异步追加写入数据库 `logs` 字段。

---

## 阶段二：流式输出协议 ✅

### 1. UIMessage Stream 协议

- 使用 AI SDK v6 的 **`createUIMessageStream` + `createUIMessageStreamResponse`**，返回结构化的 SSE 数据流（非旧版 Data Stream）。
- 流格式：每个 chunk 为带 `type` 的 JSON 对象（`text-delta`、`tool-input-available`、`tool-output-available`、`finish` 等）。
- 前端使用 `DefaultChatTransport` 直接消费此格式，无需额外解析。

### 2. HTTP 接口

| 路由 | 说明 |
|------|------|
| `POST /api/chat` | 接收 `{ messages, sessionId }`，触发 AgentRunner，流式返回 |
| `GET /api/chat/sessions` | 返回所有会话列表（按 updatedAt 倒序） |
| `GET /api/chat/sessions/:id` | 返回会话详情及全部消息（含 `toolCallsJson`） |
| `GET /api/chat/jobs/:id` | 返回后台 job 状态与日志 |
| `GET /health` | 健康检查 |

> 注意：`POST /api/chat` 仅需前端传最后一条用户消息，完整历史由后端从 SQLite 加载并重建为 `CoreMessage[]`。

---

## 阶段三：前端 `/ui` 接入 ✅

### 1. useChat 接入（`ChatPanel.tsx`）

- 使用 `@ai-sdk/react` 的 **`useChat`** + **`DefaultChatTransport`**，配置 `api` 指向 `http://localhost:5679/api/chat`。
- **Transport 稳定性**：transport 只创建一次（`useState` 而非 `useMemo`），避免 `useChat` 内部 message 状态被重置。
- **Session ID 管理**：通过 `sessionIdRef`（Ref 而非 State）在 `prepareSendMessagesRequest` 中注入 sessionId，不触发 transport 重建。
- **中止响应**：`useChat` 的 `stop()` 传入 `PromptInputSubmit`，streaming 时自动展示停止按钮。

### 2. 消息渲染

- **实时流式消息**：从 `UIMessage.parts` 中提取 `text`、`reasoning`、`dynamic-tool`/`tool-*` parts，分别渲染文字、思考块、工具调用块。
- **历史消息回显**：`buildPartsFromHistory()` 从 `toolCallsJson` 重建 `dynamic-tool` parts，确保历史工具调用正确展示参数与结果。
- **会话切换**：切换会话时从 `GET /api/chat/sessions/:id` 加载历史，`setMessages` 注入已有记录；新建会话时清空。

### 3. 端口配置

| 服务 | 端口 |
|------|------|
| 前端（Vite dev server） | 5678 |
| 后端（Hono/Bun） | 5679 |

---

## 关键技术决策记录

| 问题 | 决策 |
|------|------|
| Prisma 7 配置方式变更 | 使用 `prisma.config.ts` + `prisma-adapter-bun-sqlite`，不再在 schema 中写 `url` |
| AI SDK v6 `maxSteps` 废弃 | 改用 `stopWhen: isLoopFinished()` |
| AI SDK v6 工具字段命名变更 | `toolCalls[].input`（非 `args`），`toolResults[].output`（非 `result`） |
| `ToolResultOutput` 格式 | 必须为 `{ type: 'json', value: ... }` 或 `{ type: 'text', value: ... }`，不能直接传对象 |
| Gemini thoughtSignature | 持久化时保存 `providerMetadata`，历史重建时原样还原，避免 SDK warning |
| 前端 transport 稳定性 | transport 用 `useState` 创建（非 `useMemo`），`useChat.id` 固定，防止 message 状态重置 |
| 后端历史加载 | 后端从 SQLite 加载完整历史，前端只传最后一条用户消息，避免 UIMessage → CoreMessage 格式转换问题 |
