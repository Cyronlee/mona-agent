import { nanoid } from "nanoid"
import type { ChatMessage, Conversation } from "./types"

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    title: "架构设计讨论",
    agentName: "Planner",
    lastActive: "2m ago",
  },
  {
    id: "conv-2",
    title: "代码生成任务",
    agentName: "Coder",
    lastActive: "15m ago",
  },
  {
    id: "conv-3",
    title: "Code Review",
    agentName: "Reviewer",
    lastActive: "1h ago",
  },
]

export const initialMessages: ChatMessage[] = [
  {
    key: nanoid(),
    from: "user",
    content: "帮我规划一下 Agent 协同调度引擎的架构方案",
  },
  {
    key: nanoid(),
    from: "assistant",
    tools: [
      {
        name: "search_knowledge",
        description: "检索内部知识库",
        status: "output-available",
        parameters: {
          query: "agent orchestration patterns",
          scope: "architecture",
        },
        result: JSON.stringify(
          {
            hits: [
              { title: "Actor Model Pattern", relevance: 0.92 },
              { title: "Event-Driven Architecture", relevance: 0.88 },
              { title: "Reactive Streams", relevance: 0.81 },
            ],
          },
          null,
          2
        ),
        error: undefined,
      },
      {
        name: "analyze_codebase",
        description: "分析当前代码库结构",
        status: "output-available",
        parameters: {
          path: "src/agents/",
          depth: 3,
        },
        result: JSON.stringify(
          {
            files: 24,
            modules: ["scheduler", "router", "executor", "monitor"],
          },
          null,
          2
        ),
        error: undefined,
      },
    ],
    reasoning: {
      content:
        "用户需要一个多 Agent 协同调度方案。根据知识库检索结果，Actor Model 最适合此场景，因为它天然支持消息传递、隔离性强、易于扩展。结合代码库现有的 scheduler / router / executor 模块，可以在此基础上构建。",
      duration: 8,
    },
    content: `## Agent 协同调度引擎架构方案

基于知识库检索和代码库分析，推荐采用 **Actor Model + Event-Driven** 混合架构：

### 核心模块

\`\`\`
┌─────────────────────────────────┐
│         Orchestrator            │
│  ┌──────────┐  ┌─────────────┐  │
│  │ Planner  │  │   Router    │  │
│  └──────────┘  └─────────────┘  │
│  ┌──────────┐  ┌─────────────┐  │
│  │ Executor │  │  Monitor    │  │
│  └──────────┘  └─────────────┘  │
└─────────────────────────────────┘
\`\`\`

### 关键设计决策

1. **消息总线**：使用异步消息队列解耦 Agent 间通信
2. **状态机**：每个 Task 维护独立状态（pending → running → done）
3. **超时熔断**：每个 Agent 调用配置独立超时与重试策略

是否需要我进一步细化某个模块的实现方案？`,
  },
  {
    key: nanoid(),
    from: "user",
    content: "Executor 模块如何处理并发限制？",
  },
  {
    key: nanoid(),
    from: "assistant",
    tools: [
      {
        name: "run_code",
        description: "执行代码片段验证思路",
        status: "output-available",
        parameters: {
          language: "typescript",
          snippet: "class Semaphore { ... }",
        },
        result: "✓ Compiled successfully, no type errors",
        error: undefined,
      },
    ],
    content: `### Executor 并发控制方案

推荐使用 **信号量（Semaphore）** 模式：

\`\`\`typescript
class Executor {
  private semaphore: Semaphore

  constructor(maxConcurrency = 5) {
    this.semaphore = new Semaphore(maxConcurrency)
  }

  async run(task: Task): Promise<Result> {
    await this.semaphore.acquire()
    try {
      return await task.execute()
    } finally {
      this.semaphore.release()
    }
  }
}
\`\`\`

代码验证已通过 ✓。此方案可动态调整 \`maxConcurrency\` 实现弹性伸缩。`,
  },
]

export const mockResponses = [
  "好的，我来分析一下这个问题。根据当前架构和最佳实践，建议采用以下方案……",
  "这是一个很好的问题！让我结合代码库的实际情况给出具体建议。",
  "根据你的需求，我已检索相关文档和代码，以下是详细的实现方案。",
  "从系统设计角度来看，这里需要权衡几个关键因素：性能、可维护性和扩展性。",
]
