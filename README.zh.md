# Mona · Harness Workspace

<p align="center">
  <em>AI 原生 workspace co-pilot —— 持续观察你的工作活动、主动浮现关键事项、并行执行想法，一切尽在统一的 Prototype / Code / PRD 画布上。</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-alpha-orange" alt="Status: Alpha">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome">
</p>

---

## 什么是 Mona？

Mona 是一个 **AI workspace co-pilot**，旨在重塑产品团队的工作方式。连接你的上下文源（文件、Zoom、Confluence、Google Drive），Mona 的多 Agent 系统会持续分析一切，自动生成可操作的建议、问题和确认。你只需要批准那些认可的内容，专业的子 Agent 便会并行执行任务，在统一的三标签画布上实时交付成果。

不再在工具间来回切换，不再手动整理待办，只有一个智能层来 **驾驭你的工作空间**，让你始终向前推进。

---

## 工作原理

```
上下文源                  AI 编排                          输出画布
┌──────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│   Zoom       │      │                     │      │                  │
│ Confluence   │─────▶│   主 Agent           │      │  Prototype       │
│ Google Drive │      │   (分析、建议、      │      │                  │
│ 文件上传     │      │    提问)            │─────▶│  Code            │
└──────────────┘      │                     │      │                  │
                      │         │           │      │  PRD             │
                      │         ▼           │      │                  │
                      │   子 Agent           │      └──────────────────┘
                      │   (并行执行)          │               │
                      └─────────────────────┘               ▼
                                                 ┌──────────────────┐
┌──────────────┐                                │  一键导出          │
│  智能 Inbox  │                                │  Jira / Linear    │
│  ─────────── │                                └──────────────────┘
│  待确认      │
│  问题        │
│  建议        │
└──────────────┘

         所有状态持久化在  .mona/  目录中（可纳入版本控制）
```

1. **连接** — 接入你的工具、上传文件，Mona 将碎片化的上下文聚合为一个统一视图。
2. **审查** — 主 AI Agent 分析上下文，实时填充智能 Inbox（待确认、问题、建议）。
3. **确认** — 批准你认可的内容。一次点击即可派出多个子 Agent 并行执行。
4. **构建** — 在画布上实时查看 Prototype、Code、PRD 的生成过程，将 Story Card 一键导出至 Jira 或 Linear。

---

## 技术方案

| 层级 | 技术栈 |
|---|---|
| **核心框架** | [Next.js](https://nextjs.org) + [Vercel AI SDK](https://sdk.vercel.ai) |
| **语言** | TypeScript |
| **样式** | Tailwind CSS |
| **AI 编排** | 多 Agent 系统：主 Agent 分析上下文并生成建议；用户确认后，专业子 Agent 通过共享文件系统状态并行执行任务 |
| **上下文集成** | 连接 Zoom、Confluence、Google Drive，支持直接文件上传 |
| **状态管理** | 智能 Inbox（待确认 / 问题 / 建议），实时流式更新 |
| **输出画布** | 三标签视图 —— Prototype / Code / PRD —— 支持一键导出至 Jira 或 Linear |
| **持久化** | 所有数据（消息、文档、历史记录、上下文快照）存储在项目内的 `.mona/` 隐藏目录中 —— 透明、工具无关、可纳入版本控制 |

---

## 快速开始

### 环境要求

- **Node.js** >= 20
- **pnpm**（推荐）或 npm

### 安装

```bash
git clone https://github.com/your-org/mona-agent.git
cd mona-agent/app
pnpm install
```

### 环境变量

在 `app/` 目录下创建 `.env.local` 文件：

```bash
# AI 提供商 (Google AI SDK)
GEMINI_API_KEY=your_gemini_api_key

# 集成（可选）
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
CONFLUENCE_API_TOKEN=...
GOOGLE_DRIVE_CLIENT_ID=...
```

### 开发

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，开始驾驭你的工作空间。

---

## 项目结构

```
mona-agent/
├── app/                    # Next.js 应用
│   ├── src/
│   │   ├── app/            # App Router 页面与 API 路由
│   │   ├── components/     # React 组件
│   │   └── lib/            # 工具函数、AI Agent、连接器
│   ├── package.json
│   └── next.config.ts
├── workspace/              # 共享 workspace schema 与配置
├── projects/               # 示例项目模板
├── plan.md                 # 架构与规划文档
└── PRODUCT.md              # 产品规格说明
```

所有运行时状态保存在项目根目录的 `.mona/` 中 —— 消息、上下文快照和 Agent 输出均为透明、可被 git 追踪。

---

## 为什么是 `.mona/`？

Mona 将 **所有数据** 存储在项目根目录的 `.mona/` 隐藏目录中。这意味着：

- **透明** — 以纯文件形式查看每条消息、每个决策和每件生成的产物。
- **可版本控制** — 将 Agent 对话和上下文与代码一起提交。
- **工具无关** — 没有供应商锁定。你的数据归你所有，格式简单、可移植。

---

## 参与贡献

我们欢迎各种形式的贡献 —— Bug 报告、新特性、文档完善、集成扩展。详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 许可证

MIT © Mona Team
