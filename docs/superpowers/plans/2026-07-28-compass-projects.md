# 导航罗盘 + 项目分区 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在博客左侧添加导航罗盘，新增项目分区，视觉风格与现有文章区保持一致。

**Architecture:** 固定定位的罗盘组件全局可见，通过 URL 检测当前分区并高亮对应方向。项目区使用 Astro content collection 管理数据，路由 `/projects` 和 `/projects/[...slug]` 由 Astro 自动生成。

**Tech Stack:** Astro 6 + AstroPaper v6.1.0 + Tailwind v4 + View Transitions

## Global Constraints

- 只用 `.astro` 组件，不引入 React/Vue
- 视觉风格：使用现有 Tailwind 变量（`text-foreground`, `bg-background`, `text-accent`, `border-border`, `text-muted-foreground`, `bg-muted` 等），不定义新的颜色/字体变量
- 内容区保持 `max-w-2xl`（672px）不变，罗盘用 `fixed` 定位不影响内容流
- 罗盘图标用纯 SVG/CSS 实现，不引入外部图标库
- 移动端适配：罗盘缩小至 64px，移到底部左侧，标签隐藏

---

### Task 1: Content Collection — 新增 projects 集合

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/projects/dig-knowledge-driller.md`

**Interfaces:**
- Consumes: 现有 `defineCollection` / `glob` loader 模式
- Produces: `getCollection("projects")` 可供后续页面使用

- [ ] **Step 1: 在 content.config.ts 追加 projects collection**

```typescript
// 在 src/content.config.ts 末尾，collections export 中添加 projects

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    status: z.enum(["active", "archived"]),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    url: z.string().optional(),
    github: z.string().optional(),
    featured: z.boolean().default(false),
    pubDate: z.date(),
  }),
});

export const collections = { posts, pages, projects };
```

- [ ] **Step 2: 创建第一个项目数据文件**

创建 `src/content/projects/dig-knowledge-driller.md`：

```markdown
---
name: 思维链项目 / Dig Knowledge Driller
status: active
description: 基于 AI 的知识钻探与思维链分析工具，部署在云端持续运行。
tags:
  - AI
  - LLM
  - 思维链
url: https://example.com/dig
featured: true
pubDate: 2026-07-01
---

## 项目简介

从海量信息中钻探出有价值的知识，通过思维链（Chain of Thought）分析深度连接。

## 技术架构

- LLM 驱动的内容理解与关联
- 云端持续运行
- …

## 功能特点

- 知识钻探：自动从输入中提取关键概念
- 思维链可视化：展示推理过程
- …
```

> 注：url 和详细内容暂为占位，后续用户自行填写真实部署地址和内容。

- [ ] **Step 3: 验证 content sync**

运行 `pnpm sync`，确认无类型错误。

- [ ] **Step 4: 提交**

```bash
git add src/content.config.ts src/content/projects/dig-knowledge-driller.md
git commit -m "feat: add projects content collection"
```

---

### Task 2: 导航罗盘组件 Compass.astro

**Files:**
- Create: `src/components/Compass.astro`

**Interfaces:**
- Consumes: 无 props，通过 `Astro.url.pathname` 自检测分区
- Produces: 点击链接导航到 `/` 或 `/projects`；对外暴露 `data-active-zone` 属性

**设计细节：**
- 固定定位：`fixed left-6 top-1/2 -translate-y-1/2 z-40`
- 圆形 SVG 罗盘，四方向点布局
- 北（文章）南（项目）为激活区，东西置灰不可点击
- 指针根据当前 URL 旋转
- 移动端（<768px）：`fixed bottom-6 left-4`，缩小至 64px，隐藏文字标签

- [ ] **Step 1: 创建 Compass.astro**

```astro
---
// src/components/Compass.astro
// 导航罗盘——固定在左侧，四方向点指示当前分区

const currentPath = Astro.url.pathname;

// 判断当前所在分区
const isArticle =
  currentPath === "/" ||
  currentPath.startsWith("/posts") ||
  currentPath.startsWith("/tags") ||
  currentPath.startsWith("/archives");

const isProject = currentPath.startsWith("/projects");

// 指针旋转角度：北=0deg, 南=180deg, 东=90deg, 西=-90deg
let needleAngle = 0;
let activeZone: "north" | "south" | null = null;

if (isArticle) {
  needleAngle = 0;
  activeZone = "north";
} else if (isProject) {
  needleAngle = 180;
  activeZone = "south";
}
---

<div class="compass-container group">
  <!-- 罗盘 SVG 环 -->
  <svg
    class="compass-ring"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    aria-label="导航罗盘"
  >
    <!-- 外环 -->
    <circle
      cx="50" cy="50" r="45"
      fill="none"
      stroke="currentColor"
      class="text-border"
      stroke-width="0.5"
      opacity="0.4"
    />

    <!-- 中心点 -->
    <circle cx="50" cy="50" r="3" class="fill-muted-foreground/30" />

    <!-- 北方向点（文章） -->
    <g role="link" tabindex="0" class="compass-dir" data-dir="north">
      <a href="/">
        <circle
          cx="50" cy="9" r="5"
          class:list={[
            "transition-all duration-300",
            isArticle
              ? "fill-accent stroke-accent"
              : "fill-none stroke-muted-foreground/40",
          ]}
        />
        {isArticle && (
          <circle
            cx="50" cy="9" r="8"
            fill="none"
            class="stroke-accent/30 animate-ping"
            style="animation-duration: 2s;"
          />
        )}
      </a>
    </g>

    <!-- 南方向点（项目） -->
    <g role="link" tabindex="0" class="compass-dir" data-dir="south">
      <a href="/projects">
        <circle
          cx="50" cy="91" r="5"
          class:list={[
            "transition-all duration-300",
            isProject
              ? "fill-accent stroke-accent"
              : "fill-none stroke-muted-foreground/40",
          ]}
        />
        {isProject && (
          <circle
            cx="50" cy="91" r="8"
            fill="none"
            class="stroke-accent/30 animate-ping"
            style="animation-duration: 2s;"
          />
        )}
      </a>
    </g>

    <!-- 东方向点（预留） -->
    <g class="compass-dir cursor-default opacity-30" data-dir="east" title="即将开放">
      <circle cx="91" cy="50" r="4" fill="none" class="stroke-muted-foreground/30" stroke-dasharray="2 2" />
    </g>

    <!-- 西方向点（预留） -->
    <g class="compass-dir cursor-default opacity-30" data-dir="west" title="即将开放">
      <circle cx="9" cy="50" r="4" fill="none" class="stroke-muted-foreground/30" stroke-dasharray="2 2" />
    </g>

    <!-- 指针 -->
    {activeZone && (
      <g
        class="transition-transform duration-500 ease-out"
        style={`transform-origin: 50px 50px; transform: rotate(${needleAngle}deg);`}
      >
        <line
          x1="50" y1="50" x2="50" y2="14"
          stroke="currentColor"
          class="text-accent"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>
    )}
  </svg>

  <!-- 文字标签（悬停显示） -->
  <div class="compass-labels">
    <span
      class:list={[
        "compass-label",
        isArticle ? "text-accent font-medium" : "text-muted-foreground",
      ]}
    >
      文章
    </span>
    <span
      class:list={[
        "compass-label",
        isProject ? "text-accent font-medium" : "text-muted-foreground",
      ]}
    >
      项目
    </span>
  </div>
</div>

<style>
  .compass-container {
    position: fixed;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .compass-container .compass-ring,
  .compass-container .compass-dir,
  .compass-container .compass-dir a {
    pointer-events: auto;
  }

  .compass-labels {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .compass-container:hover .compass-labels {
    opacity: 1;
  }

  .compass-label {
    font-size: 11px;
    line-height: 1;
    letter-spacing: 0.02em;
    transition: color 0.2s ease;
  }

  .compass-dir a {
    display: block;
    cursor: pointer;
  }

  .compass-dir a:focus-visible {
    outline: 2px dashed var(--color-accent);
    outline-offset: 4px;
    border-radius: 9999px;
  }

  @media (max-width: 767px) {
    .compass-container {
      left: 16px;
      bottom: 24px;
      top: auto;
      transform: none;
    }

    .compass-ring {
      width: 64px;
      height: 64px;
    }

    .compass-labels {
      display: none;
    }
  }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Compass.astro
git commit -m "feat: add navigation compass component"
```

---

### Task 3: 罗盘集成到 Layout

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: 在 Layout.astro 中引入 Compass**

在 `<body>` 内的 `<slot />` 之前添加 Compass：

```astro
---
// 文件顶部 import 区新增
import Compass from "@/components/Compass.astro";
---

<body
  class="bg-background font-app text-foreground selection:bg-accent/75 selection:text-accent-foreground flex min-h-svh flex-col"
>
  <Compass />
  <slot />
  <script>
    import "@/scripts/theme";
  </script>
</body>
```

> Compass 是 fixed 定位，不依赖 `<slot />` 中的内容排列。放在 `<slot />` 之前或之后均可。

- [ ] **Step 2: 验证**

```bash
pnpm build
# 确认 0 errors
```

- [ ] **Step 3: 提交**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: integrate compass into global layout"
```

---

### Task 4: 项目列表页 /projects

**Files:**
- Create: `src/pages/projects/index.astro`

- [ ] **Step 1: 创建 /projects 列表页**

参考 `src/pages/index.astro` 的布局风格，保持视觉一致：

```astro
---
// src/pages/projects/index.astro
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import config from "@/config";

const projects = await getCollection("projects");
const sortedProjects = projects
  .map(({ data, id }) => ({ data, id }))
  .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

const featuredProjects = sortedProjects.filter((p) => p.data.featured);
const otherProjects = sortedProjects.filter((p) => !p.data.featured);
---

<Layout title={`项目 | ${config.site.title}`} description="个人项目展示">
  <Header />
  <main id="main-content" class="app-layout pb-4">
    <h1 class="text-2xl font-semibold sm:text-3xl">项目</h1>
    <p class="mt-2 mb-6 italic text-muted-foreground">
      这里记录了我做过的一些东西。
    </p>

    <!-- 精选项目 -->
    {featuredProjects.length > 0 && (
      <section class="mb-8">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <a
              href={`/projects/${project.id}`}
              class="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-sm sm:col-span-2"
            >
              <div class="flex items-start justify-between gap-2">
                <h2 class="text-xl font-semibold group-hover:text-accent">
                  {project.data.name}
                </h2>
                <span
                  class:list={[
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    project.data.status === "active"
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground",
                  ]}
                >
                  {project.data.status === "active" ? "进行中" : "已归档"}
                </span>
              </div>
              <p class="mt-2 text-sm text-muted-foreground line-clamp-2">
                {project.data.description}
              </p>
              {project.data.tags.length > 0 && (
                <div class="mt-3 flex flex-wrap gap-1.5">
                  {project.data.tags.map((tag) => (
                    <span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </section>
    )}

    <!-- 其他项目 -->
    {otherProjects.length > 0 && (
      <section>
        <h2 class="mb-4 text-lg font-medium text-muted-foreground">
          更多项目
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {otherProjects.map((project) => (
            <a
              href={`/projects/${project.id}`}
              class="group rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/50 hover:shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-medium group-hover:text-accent">
                  {project.data.name}
                </h3>
                <span
                  class:list={[
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    project.data.status === "active"
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground",
                  ]}
                >
                  {project.data.status === "active" ? "进行中" : "已归档"}
                </span>
              </div>
              <p class="mt-2 text-sm text-muted-foreground line-clamp-2">
                {project.data.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    )}

    {sortedProjects.length === 0 && (
      <p class="text-muted-foreground italic">还没有项目。</p>
    )}
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: 验证**

```bash
pnpm build
# 确认 /projects 页面生成
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/projects/index.astro
git commit -m "feat: add projects listing page"
```

---

### Task 5: 项目详情页 /projects/[...slug]

**Files:**
- Create: `src/pages/projects/[...slug]/index.astro`
- Create: `src/pages/projects/[...slug]/index.png.ts`（动态 OG 图）

- [ ] **Step 1: 创建项目详情页**

```astro
---
// src/pages/projects/[...slug]/index.astro
import { getCollection, render } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import config from "@/config";

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<Layout
  title={`${project.data.name} | ${config.site.title}`}
  description={project.data.description}
>
  <Header />
  <main id="main-content" class="app-layout pb-4">
    <!-- 顶部元信息 -->
    <div class="border-border border-b pb-6 mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span
          class:list={[
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            project.data.status === "active"
              ? "bg-accent/10 text-accent"
              : "bg-muted text-muted-foreground",
          ]}
        >
          {project.data.status === "active" ? "进行中" : "已归档"}
        </span>
        {project.data.tags.map((tag) => (
          <span class="text-xs text-muted-foreground">#{tag}</span>
        ))}
      </div>

      <h1 class="text-2xl font-bold sm:text-3xl">
        {project.data.name}
      </h1>

      <p class="mt-2 text-muted-foreground">
        {project.data.description}
      </p>

      <!-- 外部链接 -->
      <div class="mt-4 flex gap-3">
        {project.data.url && (
          <a
            href={project.data.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/5 hover:border-accent/30"
          >
            访问项目
          </a>
        )}
        {project.data.github && (
          <a
            href={project.data.github}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/5 hover:border-accent/30"
          >
            GitHub
          </a>
        )}
      </div>
    </div>

    <!-- 正文 -->
    <article class="prose prose-neutral dark:prose-invert max-w-none
      prose-headings:font-semibold prose-a:text-accent
      prose-pre:bg-(--shiki-light-bg) dark:prose-pre:bg-(--shiki-dark-bg)">
      <Content />
    </article>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: 创建项目详情动态 OG 图（可选优化）**

创建 `src/pages/projects/[...slug]/index.png.ts`，复用文章的 OG 图生成逻辑但做简化版本。如果用户不需要可以先跳过。

- [ ] **Step 3: 验证**

```bash
pnpm build
# 确认 /projects/dig-knowledge-driller 页面生成
```

- [ ] **Step 4: 提交**

```bash
git add src/pages/projects/[...slug]/index.astro
git commit -m "feat: add project detail page"
```

---

### Task 6: i18n 补充

**Files:**
- Modify: `src/i18n/lang/zh-CN.ts`

- [ ] **Step 1: 添加项目相关翻译**

```typescript
// 在 nav 中添加 projects
nav: {
  home: "首页",
  posts: "文章",
  projects: "项目",
  tags: "标签",
  about: "关于",
  archives: "归档",
  search: "搜索",
},
```

- [ ] **Step 2: 提交**

```bash
git add src/i18n/lang/zh-CN.ts
git commit -m "chore(i18n): add projects nav translation"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 完整构建**

```bash
pnpm build
# 期待 0 errors，所有路由生成
```

- [ ] **Step 2: 启动 dev server 手动检查**

```bash
pnpm dev
```

检查清单：
- [ ] 所有页面左侧显示罗盘
- [ ] 文章首页：北方向高亮，标签显示「文章」
- [ ] /projects：南方向高亮，标签显示「项目」
- [ ] /about：无方向高亮
- [ ] 点击北/南：URL 切换，View Transitions 生效
- [ ] 东西方向：不可点击，无导航错误
- [ ] 罗盘指针指向当前激活方向
- [ ] 移动端视口：罗盘缩小，位于左下角
- [ ] 悬停显示文字标签
