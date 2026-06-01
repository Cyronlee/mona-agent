# mona-agent

## 仓库结构（两独立包，非 monorepo）

| 包 | 目录 | 技术栈 |
|---|---|---|
| 后端 | `backend/` | Bun + Hono + Prisma (SQLite) + Google Gemini (ai SDK v6) |
| 前端 | `ui/` | React 19 + Vite 8 + Tailwind CSS v4 + Shadcn UI (radix-nova) |

每个包有独立的 `package.json`、`bun.lock`、`node_modules`。

## 关键命令

### 后端 (`backend/`)
- `bun --watch src/index.ts` — 开发运行（Bun 直接执行 TS，无需编译）
- `bunx prisma migrate dev` — 数据库迁移
- `bunx prisma generate` — 生成 Prisma Client
- `bunx prisma studio` — 数据浏览器

### 前端 (`ui/`)
- `bun run dev` — Vite 开发服务器（端口 5678）
- `bun run build` — 构建：`tsc -b && vite build`
- `bun run lint` — ESLint 检查
- `bun run typecheck` — TypeScript 类型检查（`tsc --noEmit`）
- `bun run format` — Prettier 格式化

## 代码约定

- **编码风格**（Prettier 强制）：无分号、双引号、2 空格缩进、尾逗号 (es5)、80 列宽
- **ESLint 宽松**：`no-explicit-any` / `no-unused-vars` / `ban-ts-comment` 均关闭
- **路径别名**：`@/*` → `ui/src/*`
- **组件目录划分**：`@/components/ui/`（Shadcn 组件）、`@/components/ai-elements/`（AI 组件）、`@/components/mona/`（应用布局）
- **工具函数**：`cn()` from `@/lib/utils.ts`（`clsx` + `tailwind-merge`）
- **Tailwind CSS v4**：无 `tailwind.config.js`，使用 `@import "tailwindcss"` CSS 方式
- **暗色模式**：按 `d` 键切换，存储在 `localStorage.theme`
- **纯桌面端**，禁止移动端响应式
- **图标库**：`@iconify/react`，图标集按需引入（如 `logos`、`lucide` 等）
  - 用法：`import { Icon } from "@iconify/react"` → `<Icon icon="logos:github" />`
  - 图标浏览：https://icon-sets.iconify.design/logos/

## 后端架构要点

- 入口：`backend/src/index.ts`，Hono 应用监听端口 5679
- API 路由集中在 `backend/src/routes/chat.ts`
- AI Agent 核心：`backend/src/agent/runner.ts`，`streamText` + 工具调用循环
- 数据库：Prisma 7 + SQLite，适配器 `prisma-adapter-bun-sqlite`
- 后端无需构建步骤（Bun 直接运行 TS）

## 自动化检查（每次修改后执行）

```bash
# 前端
cd ui && bun run build    # 构建验证
cd ui && bun run lint      # lint 检查

# 后端：Bun 直接运行 TS，无构建步骤
# 如需验证后端类型，可运行 bunx tsc --noEmit（backend/ 下）
```
