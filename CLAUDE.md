---


---
# 个人博客 — 项目约定

## 常用命令（pnpm）

- 开发：`pnpm dev`
- 构建：`pnpm build`（= `astro check && astro build && pagefind --site dist`）
- 校验：`pnpm lint`（eslint）、`pnpm format:check`（prettier；`pnpm format` 可自动修复）
- 同步 content schema：`pnpm sync`

## 本项目禁止项

- **只用 pnpm**，禁止 npm/yarn。新增依赖走 `pnpm add`；CI 用 `pnpm install --frozen-lockfile`，锁文件必须同步提交。
- **组件是 `.astro`，不是 React/Vue**——禁止引入 React 或任意 UI 框架。
- **改内容走 content collection**（`src/content/posts`、`src/content/pages`），禁止手写 `src/pages/posts` 路由文件（路由由 collection 自动生成）。
- **站点级配置集中在 `astro-paper.config.ts`**，禁止把标题/导航/social/主题散落到组件里。
- **样式只用 Tailwind v4 + `src/styles/`**，禁止引入第二个 CSS 框架或在 `.astro` 里写大段原生全局 `<style>`。
- **部署只靠 push `main` → GitHub Actions**（`deploy.yml` 构建并发布 Pages）；禁止本地 build 后手推 `dist/`（`dist/` 不进 git，由 Pages action 接管）。
