---
# 项目级上下文层（四道防线 第一道）。与全局规则 / 项目.md 总纲冲突时以本文件为准。
# 深度架构与资产地图见仓库外的 wiki（见下方"上下文层"），本文件只放指针 + 仓库级速查 + 禁止项。
---

# 个人博客 — 项目约定

Astro 6 + AstroPaper v6.1.0 静态博客，部署到 GitHub Pages。样式用 Tailwind v4（`@tailwindcss/vite`），代码高亮 shiki，站内搜索 pagefind，内容用 MDX/Markdoc（`.md` / `.mdx` / `.mdoc`），本地编辑用 VS Code。

## 上下文层（先搜后写）

- **wiki 在仓库外**：`/Users/mac/Documents/OpenKnowledge/个人博客/`（OpenKnowledge 项目，`content.dir: wiki`）。它由 OK MCP 管理，headless 无桌面 app；操作走 `open-knowledge-pack-codebase-wiki` 技能，不要原生 `Write`/`Edit` 改 wiki 文件。
- 写任何 util/组件/Hook/模块**前**，先读 `wiki/modules/` + `wiki/concepts/` + 用 codegraph 检索，确认"已有什么 / 禁止什么"，复用优先、禁止内联。

## 常用命令（pnpm）

- 开发：`pnpm dev`
- 构建：`pnpm build`（= `astro check && astro build && pagefind --site dist`）
- 校验：`pnpm lint`（eslint）、`pnpm format:check`（prettier；`pnpm format` 可自动修复）
- 同步 content schema：`pnpm sync`

## 目录约定

- 博客文章：`src/content/posts/*.{md,mdx,mdoc}`（`.mdoc` 为 Markdoc 格式）；静态页：`src/content/pages/`（均为 content collection，路由自动生成）
- 组件：`src/components/*.astro`；布局：`src/layouts/`（`Layout.astro` / `PostLayout.astro`）；页面路由：`src/pages/*.astro`
- 工具函数：`src/utils/*.ts`；主题样式：`src/styles/`
- 站点级配置（标题 / 导航 / 社交 / 主题）：`astro-paper.config.ts` + `astro.config.ts`

## 本项目禁止项

- **只用 pnpm**，禁止 npm/yarn。新增依赖走 `pnpm add`；CI 用 `pnpm install --frozen-lockfile`，锁文件必须同步提交。
- **组件是 `.astro`，不是 React/Vue**——禁止引入 React 或任意 UI 框架。
- **改内容走 content collection**（`src/content/posts`、`src/content/pages`），禁止手写 `src/pages/posts` 路由文件（路由由 collection 自动生成）。
- **站点级配置集中在 `astro-paper.config.ts`**，禁止把标题/导航/social/主题散落到组件里。
- **样式只用 Tailwind v4 + `src/styles/`**，禁止引入第二个 CSS 框架或在 `.astro` 里写大段原生全局 `<style>`。
- **部署只靠 push `main` → GitHub Actions**（`deploy.yml` 构建并发布 Pages）；禁止本地 build 后手推 `dist/`（`dist/` 不进 git，由 Pages action 接管）。
