基于当前初始化的 Shadcn UI 项目及现有组件代码，生成一个类似 linear.app 的企业级 desktop 软件界面，用于 AI 多 Agent 协作平台 "Mona"。

- 【项目文件参考规范】：
  - 生成和组装界面时，必须优先参考并复用项目中现有的组件设计与实现逻辑：
    1. 整体布局和左侧边栏（Sidebar）：请参考并适配项目中的 `SideBar16.tsx`。
    2. 右侧边栏（AI Chat Panel）：面板的展开/收起与骨架请参考并适配项目中的 `SideBar14.tsx`。
    3. 聊天核心区域：右侧栏内部的聊天消息流与输入交互，基本复用 `chatbot.tsx` 的实现代码。

- 【全局布局架构】：
  - 采用全屏垂直三段式结构：顶部栏（Top Bar）完全固定在最顶端，底部栏（Bottom Bar）完全固定在最底端，中间区域横向包裹着左侧栏、中间主内容区、右侧栏这三栏结构。
  - 整体尺寸：App 宽高达浏览器窗口 100%（全屏占满），页面整体 overflow: hidden 禁用全局滚动，内部各区域使用 Shadcn <ScrollArea> 或 overflow-y-auto 实现独立局部滚动。
  - **核心约束：彻底移除所有针对 Mobile 移动端的响应式布局代码，完全专注于高信息密度的纯桌面端（Desktop-only）固定呈现。**
  - 色调以纯白（bg-background）和极浅灰（bg-slate-50/50）为主，搭配高质感深色文字（text-slate-900）。

- 【代码与组件拆分规范】：
  - 按照合理的粒度进行 React 组件拆分，每个组件应保持功能单一、代码整洁。将 TopBar、BottomBar、DashboardView、KanbanView 等抽离为独立的子组件。

- 【状态与视图切换】：
  - 基于轻量状态管理（如 Zustand）实现菜单点击切换逻辑：左侧菜单项需绑定状态，点击时可在中间主内容区动态切换展示对应的视图（完整实现 Dashboard 视图与 Tasks 看板视图的切换），且右侧聊天面板的状态在切换视图时需保持常驻、不被销毁。

- 【各区域详细设计】：

  1. 顶部栏（Top Bar）：
     - 完全横向置顶，固定高度 48px，下边框 border-b border-slate-200。
     - 左右两端各放一个小巧的 Sidebar Toggle 按钮（lucide-sidebar 图标，Hover 触发轻微变色）。
     - 左侧：面包屑组件 <Breadcrumb>（Mona Workspace / 当前激活菜单）。
     - 正中间：宽扁、无侵入感的静态搜索框，背景 bg-slate-100/80，占位符为 "搜索文档、任务 (⌘K)"。
     - 右侧：放置一组简洁的 Lucide 功能图标（Notification 铃铛、Help 问号）。

  2. 底部栏（Bottom Bar）：
     - 完全横向置底，固定高度 28px，bg-slate-50，上边框 border-t border-slate-200。
     - 左侧：小字显示 "Last sync: 2 mins ago"。
     - 右侧：并排展示三个 Agent 的微型头像（w-4 h-4），头像右下角带状态小圆点（绿/黄/灰），完全靠 Hover Tooltip 提示详情。

  3. 左侧栏（Sidebar）：
     - 结构与基础样式参考 `SideBar16.tsx`。
     - 中部导航菜单（紧凑高密度）：
       - Dashboard（点击切换至仪表盘，激活态带浅灰背景）
       - Assets（资产库）
       - Features（功能流）
       - Tasks（点击切换至看板视图）
       - Agents（Agent 智囊团）
     - 底部：用户 Profile 区域（小尺寸 Shadcn <Avatar> + 用户名 + Settings 图标）。

  4. 中间主内容区（Workspace）：
     - 整体内衬垫设为 p-5，容器支持独立的垂直方向局部滚动（overflow-y-auto）。
     - 【视图 A：Dashboard 工作台（默认激活）】：采用垂直堆叠布局（Flex-col，gap-6），包含：
       - 1. 顶部指标区（横排）：一行 4 列的网格（grid-cols-4），使用 Shadcn <Card> 展示 4 个精致的关键指标（进行中的 Stories、已交付 POC、本周 AI 生成代码行数、平均交付时间），包含小字 Label 和大字数值。
       - 2. 模块 A（待处理任务）：全宽展示。使用紧凑的 <Table>，条目包含任务标题、优先级 <Badge>、状态标签。
       - 3. 模块 B（Agent 状态面板）：全宽展示。横向并排展示 Orchestrator、Planner、Builder 三个 Agent，包含圆形头像、名称、工作负荷 Progress 条及状态 Badge。

  5. 右侧栏（AI Chat Panel）：
     - 侧边栏骨架参考 `SideBar14.tsx`，内部聊天逻辑与 UI 复用 `chatbot.tsx`。
     - 默认 360px 宽度可以左右拉伸宽度，支持展开与收起。