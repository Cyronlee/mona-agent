# Mona · Harness Workspace

<p align="center">
  <em>An AI-native workspace co-pilot that watches your activity, surfaces what matters, and executes ideas in parallel — across prototypes, code, and PRDs.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-alpha-orange" alt="Status: Alpha">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome">
</p>

---

## What is Mona?

Mona is an **AI workspace co-pilot** that transforms how product teams work. Connect your context sources — files, Zoom, Confluence, Google Drive — and Mona's multi-agent system continuously analyzes everything to generate actionable suggestions, questions, and confirmations. Approve what you need, and specialized sub-agents execute tasks in parallel, delivering outputs in real time across a unified three-tab canvas.

No more context-switching between tools. No more manual triage. Just an intelligent layer that **harnesses your workspace** and keeps you moving forward.

---

## How It Works

```
Context Sources          AI Orchestration                Output Canvas
┌──────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│   Zoom       │      │                     │      │                  │
│ Confluence   │─────▶│   Main Agent        │      │  Prototype       │
│ Google Drive │      │   (analyze,         │      │                  │
│ File Uploads │      │    suggest, ask)    │─────▶│  Code            │
└──────────────┘      │                     │      │                  │
                      │         │           │      │  PRD             │
                      │         ▼           │      │                  │
                      │   Sub-Agents        │      └──────────────────┘
                      │   (parallel exec)   │               │
                      └─────────────────────┘               ▼
                                                 ┌──────────────────┐
┌──────────────┐                                │  Export          │
│  Smart Inbox │                                │  Jira / Linear   │
│  ─────────── │                                └──────────────────┘
│  To Confirm  │
│  Questions   │
│  Suggestions │
└──────────────┘

         All state persisted in  .mona/  (version-controlled)
```

1. **Connect** — Link your tools and upload files. Mona aggregates fragmented context into one unified view.
2. **Review** — The main AI agent analyzes context and populates your Smart Inbox with suggestions, questions, and confirmations in real time.
3. **Confirm** — Approve what resonates. A single click spawns parallel sub-agents to execute.
4. **Build** — Watch prototypes, code, and PRDs materialize on the canvas. Export story cards directly to Jira or Linear.

---

## Technical Approach

| Layer | Stack |
|---|---|
| **Core Framework** | [Next.js](https://nextjs.org) + [Vercel AI SDK](https://sdk.vercel.ai) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **AI Orchestration** | Multi-agent system: main agent analyzes context and generates suggestions; user-approved tasks are executed in parallel by specialized sub-agents sharing file-system state |
| **Context Integrations** | Connectors for Zoom, Confluence, Google Drive, plus direct file uploads |
| **State Management** | Smart Inbox (To Confirm / Questions / Suggestions) with real-time streaming updates |
| **Output Canvas** | Three-tab view — Prototype / Code / PRD — with one-click export to Jira or Linear |
| **Persistence** | All data (messages, docs, history, context snapshots) stored in the project's hidden `.mona/` directory — transparent, tool-agnostic, and version-controlled |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended) or npm

### Installation

```bash
git clone https://github.com/your-org/mona-agent.git
cd mona-agent/app
pnpm install
```

### Environment

Create a `.env.local` file in `app/`:

```bash
# AI Provider (Google AI SDK)
GEMINI_API_KEY=your_gemini_api_key

# Integrations (optional)
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
CONFLUENCE_API_TOKEN=...
GOOGLE_DRIVE_CLIENT_ID=...
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start harnessing your workspace.

---

## Project Structure

```
mona-agent/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/            # App router pages & API routes
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities, AI agents, connectors
│   ├── package.json
│   └── next.config.ts
├── workspace/              # Shared workspace schemas & configs
├── projects/               # Example project templates
├── plan.md                 # Architecture & planning docs
└── PRODUCT.md              # Product specification
```

All runtime state lives in `.mona/` at the root of your working project — messages, context snapshots, and agent outputs are transparent and git-trackable.

---

## Why `.mona/`?

Mona stores **everything** in a hidden `.mona/` directory at your project root. This means:

- **Transparent** — Inspect every message, decision, and generated artifact as plain files.
- **Version-controlled** — Commit your agent conversations and context alongside code.
- **Tool-agnostic** — No vendor lock-in. Your data is yours, in a simple, portable format.

---

## Contributing

We welcome contributions of all kinds — bugs, features, docs, integrations. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT © Mona Team
