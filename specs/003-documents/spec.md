# Spec 003 — Documents（文档库）

> 状态：**待确认**

---

## 概述

Documents 模块是一个 **Data Grid 文档管理界面**，用于浏览和管理归属于不同文件夹的文档（Documents）。每个文件夹代表一个业务域（如 Gmail、知识文档、参考代码、设计系统等），由用户自定义命名，无需预定义类型。同时提供 Agent 工具接口，使 Agent 可在对话中查找、查看、修改和删除文档。

---

## 阶段一：数据模型（Prisma）

### 1. Document 表

`backend/prisma/schema.prisma` 新增：

```prisma
model Document {
  id        String   @id @default(cuid())
  folder    String              // 文件夹名称，如 "Gmail"、"知识文档"、"参考代码"
  title     String              // 文档标题
  content   String              // 文档正文（Markdown）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([folder])
}
```

- **folder** — 文档所属文件夹，用于分组和筛选。
- **content** — 存储 Markdown 内容，供 Agent 引用或用户查阅。
- 无需单独建 Folder 表，文件夹由 Document 中的 folder 字段聚合推导。

### 2. API 接口

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/documents` | GET | 获取所有文档列表，支持 `?folder=xxx` 查询参数筛选 |
| `/api/documents` | POST | 创建文档 `{ folder, title, content }` |
| `/api/documents/:id` | GET | 获取单个文档详情 |
| `/api/documents/:id` | PATCH | 更新文档 |
| `/api/documents/:id` | DELETE | 删除文档 |
| `/api/documents/folders` | GET | 获取所有已使用的文件夹名称列表（聚合去重） |

---

## 阶段二：前端 Data Grid 视图

### 1. 视图布局

- 采用 **Data Grid（表格）** 布局，非 Kanban。
- 顶部工具栏：文件夹筛选下拉 / 标签页 + 新建文档按钮。
- 主体为可排序、可筛选的表格。

### 2. 表格列定义

| 列 | 字段 | 说明 |
|----|------|------|
| 文件夹 | `folder` | 显示所属文件夹名称，作为 Badge 标签 |
| 标题 | `title` | 可点击进入详情 |
| 内容摘要 | `content` | 截取前 80 字符作为预览 |
| 创建时间 | `createdAt` | 格式化显示 |
| 更新时间 | `updatedAt` | 格式化显示 |

### 3. 交互功能

- **文件夹筛选**：顶部提供筛选控件，可按 folder 过滤行。
- **新建文档**：点击按钮弹出 Dialog 表单，填写 folder、title、content。
- **编辑/删除**：行内操作或右键菜单，支持编辑和删除。
- **表格排序**：点击列头按时间等字段升序/降序。

### 4. 内容编辑器

- 使用 **[MDX Editor](https://mdxeditor.dev/editor/docs/getting-started)** 作为文档内容编辑器。
- 支持 Markdown 语法高亮与富文本编辑。
- 在新建/编辑文档时，以全屏或大尺寸 Dialog 形式打开编辑器。

### 5. 技术方案

- 表格组件：基于项目已有的 reui datagrid 实现。
- 状态管理：与现有架构保持一致。
- 路由：Documents 为 Dashboard 视图的一部分，通过左侧菜单项切换（与 Dashboard/Tasks 同级）。

---

## 阶段三：Agent 工具接口

Agent 需要具备对文档库的查找、查看、修改和删除能力，在 `backend/src/tools/index.ts` 新增以下工具：

### 1. `search_documents` — 查找文档

- **参数**：`folder?`（可选，按文件夹筛选）、`query?`（可选，按标题关键词搜索）
- **返回**：文档列表，每条仅返回 `id`、`folder`、`title`、`createdAt`、`updatedAt`，**不返回 content 内容**。
- **用途**：让 Agent 快速了解文档库中有哪些文档，再决定是否查看具体内容。

### 2. `get_document` — 查看文档

- **参数**：`id`（文档 ID）
- **返回**：完整文档数据，包含 `content` 字段。
- **用途**：Agent 读取文档全文内容作为对话上下文。

### 3. `update_document` — 修改文档

- **参数**：`id`、`title?`、`folder?`、`content?`（仅传需要修改的字段）
- **返回**：更新后的完整文档。
- **用途**：Agent 根据用户指令更新文档内容或元数据。

### 4. `delete_document` — 删除文档

- **参数**：`id`（文档 ID）
- **返回**：删除确认信息。
- **用途**：Agent 根据用户指令删除文档。

