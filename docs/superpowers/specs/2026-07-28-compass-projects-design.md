# 博客导航罗盘 + 项目分区 — 设计文档

## 概述

在博客左侧添加一个固定的动态导航罗盘，支持四个方向（北=文章、南=项目，东西预留）。点击罗盘方向切换分区，URL 同步变更，内容区通过 View Transitions 过渡。同时新增「项目」内容区，用于展示和关联用户部署在云端的项目。

## 路由架构

```
/               → 文章首页（现首页，不变）
/posts/*        → 文章详情（不变）
/tags/*         → 标签页（不变）
/archives       → 归档（不变）

/projects       → 项目列表页（新增）
/projects/*     → 项目详情页（新增）

/about          → 关于（不变）
/404            → 404（不变）
/search         → 搜索（不变）
```

### 分区映射

| 方位 | 分区 | 匹配路由 |
|------|------|----------|
| 北 ● | 文章 | `/`, `/posts/*`, `/tags/*`, `/archives` |
| 南 ● | 项目 | `/projects`, `/projects/*` |
| 东 ○ | 预留 | — |
| 西 ○ | 预留 | — |
| —   | 其他 | `/about`, `/search`, `/404` 等 → 罗盘无高亮 |

## 导航罗盘

### 位置与样式

- 固定在页面左侧，距视口左边缘 24px，垂直居中
- 圆形布局，直径约 100px，背景透明
- 使用当前主题色系的 accent 色作为激活态高亮
- 浅色/深色模式自动适配

### 视觉形态

```
        [文章]  ← 标签
         ●
         |
    ○ ——— + ——— ○
         |
         ●
        [项目]  ← 标签
```

- 四个方向点（各距圆心 24px）
- 方向点用圆形 dot：激活态填充色 + 光晕脉冲动画，非激活态半透明描边
- 预留位置（东西）用空心圆，悬停提示"即将开放"
- 指针/箭头元素：可选的小三角或刻度线指示激活方向
- 悬停显示文字标签（文章/项目）

### 交互

| 操作 | 效果 |
|------|------|
| 点击北 | 导航至 `/`（文章首页） |
| 点击南 | 导航至 `/projects`（项目列表） |
| 点击东西 | 不可用，触发 subtle 反馈（如小 tooltip "即将开放"） |
| 键盘 Tab 聚焦 | 焦点顺序：北 → 南 → 东 → 西 |
| 当前在高亮区页面 | 对应方向点脉冲动画持续 |
| 当前在无分区页面 | 所有方向点均非激活 |

### 动画

- 切换分区时：View Transitions 驱动页面过渡，罗盘本身固定不动
- 点击新方向时：目标方向点有轻微的缩放脉冲反馈（200ms）
- 预留方向点击：一个微小的弹跳动画提示不可用

### 移动端适配

- 屏幕宽度 < 768px 时：罗盘缩小至 64px 直径，移至页面左下角
- 标签文字隐藏，仅保留方向点
- 点击区域增大（44px 最小点击目标）

## 项目内容区

### Content Collection

新增 `src/content/projects/`，schema：

```typescript
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),           // 项目名称
    status: z.enum(["active", "archived"]),  // 状态
    description: z.string(),    // 一句话简介
    tags: z.array(z.string()).default([]),   // 技术栈标签
    url: z.string().optional(), // 部署/访问地址
    github: z.string().optional(), // 源码地址
    featured: z.boolean().default(false),  // 是否精选
    pubDate: z.date(),          // 创建/开始日期
  }),
});
```

### 项目列表页 `/projects`

- 卡片网格布局，每行最多 2 列
- 每张卡片：项目名、状态标签（active/archived）、简介、技术栈标签
- 精选项目宽 2 列置顶
- 按 `pubDate` 降序排列
- 与文章列表视觉风格统一，使用现有 Card/Tag 组件

### 项目详情页 `/projects/[...slug]`

- 复用 `PostLayout.astro` 的布局风格（顶栏、内容区宽度、页脚）
- 正文用 markdown 书写项目介绍、架构、技术细节等
- 顶部额外展示：状态标签、技术栈标签、外部链接按钮（部署地址 / GitHub）

## 视图过渡

使用 Astro 内置的 View Transitions（已启用 `ClientRouter`）：

- 文章 ↔ 项目切换：默认 crossfade 过渡
- 罗盘方向点：纯 CSS animation，不受 View Transitions 影响
- 无需自定义过渡名，各个页面已有 `viewTransitionName`

## 文件清单

### 新增
| 文件 | 用途 |
|------|------|
| `src/components/Compass.astro` | 导航罗盘组件 |
| `src/pages/projects/index.astro` | 项目列表页 |
| `src/pages/projects/[...slug].astro` | 项目详情页 |
| `src/content/projects/dig-knowledge-driller.md` | 思维链项目数据 |
| `src/content/config.ts` → 追加 `projects` collection | |

### 修改
| 文件 | 改动 |
|------|------|
| `src/layouts/Layout.astro` | 引入 Compass 组件 |
| `astro-paper.config.ts` | 可选：站点级配置增加项目相关字段 |

## 非目标

- 本设计不涉及云服务器部署/接入，博客只做展示和链接入口
- 不改变现有文章区的样式和功能
- 不修改已存在的页面布局（除整体加上罗盘外）
