
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn develop        # Start Gatsby dev server
yarn build          # Production build
yarn serve          # Serve production build locally
yarn clean          # Clear Gatsby cache

# Code quality
yarn typecheck      # TypeScript type check (no emit)
yarn lint           # ESLint on src/ (.ts, .tsx)
yarn lint:fix       # Auto-fix ESLint issues

# Testing
yarn spec           # Run all Playwright tests (sequential, -x flag)
yarn spec --grep "pattern"   # Run a single Playwright test by name
yarn e2e            # Run CodeceptJS E2E tests
```

Node version: **18.x** (see `.tool-versions`).

## Architecture

This is a **Gatsby 5 static site** for PagoPa SpA's corporate website, sourcing all content from **Strapi CMS** via GraphQL.

### Key stack

- **Gatsby 5** + **React 18** + **TypeScript 4.9**
- **Strapi** (headless CMS) as the data source via `gatsby-source-strapi`
- **SASS/SCSS** + **Bootstrap 5** for styling
- **gatsby-plugin-react-i18next** for Italian (default) / English i18n
- **Playwright** (integration tests in `e2e/*.spec.ts`) + **CodeceptJS** (E2E in `e2e/*.e2e.js`)

### How pages are generated

`gatsby-node.ts` queries Strapi collections (pages, posts, events, press releases, job positions, projects, etc.) and calls `createPage()` for each. This is the entry point for understanding page routing.

Custom GraphQL resolvers in `gatsby-node.ts` handle:
- Permalink generation
- Date overrides for published content
- `SHARED_BLOCKS_UNION` type — a union of Strapi block components used across multiple content types

### Source layout

```
src/
├── components/     # Reusable UI blocks (Article, Image, Video, SharedBlocks, …)
├── partials/       # Layout-level components (Header, Footer, Layout, Cta, …)
├── pages/          # Gatsby page templates (mapped to Strapi content types)
├── hooks/          # Custom hooks (useCookiesDialog, useLocalizedQuery, …)
├── utils/          # Pure utilities (cookies.ts, previewText.ts)
├── sass/           # Global SCSS variables and base styles
├── locales/        # i18n JSON files (it/, en/)
└── types.ts        # Shared enums and TypeScript types (e.g. PAGOPA_MENU)
```

Each component typically lives in its own directory with `Component.tsx`, `Component.sass`, and `index.ts` (re-export). Everything is barrel-exported from `src/index.ts`.

### GraphQL types

`gatsby-types.d.ts` is **auto-generated** — do not edit it manually. Run `yarn build` or the Gatsby dev server to regenerate after schema changes (`graphqlTypegen: true` in `gatsby-config.ts`).

### Environment variables

Copy `.env.example` to `.env.development` / `.env.production`. Required vars:
- `STRAPI_API_URL`, `STRAPI_TOKEN`, `STRAPI_MEDIA_DIR` — Strapi connection
- `CDN_BASE_URL`, `CDN_MEDIA_DIR` — asset CDN
- Navigation menu IDs (4 menus × 2 languages)

### Custom local plugins

`plugins/gatsby-source-strapi-plugin-navigation_local/` — fetches Strapi navigation menus
`plugins/gatsby-plugin-remark_local/` — custom markdown processing

### i18n conventions

- Default language: Italian (paths like `/slug`)
- English: `/en/slug`
- Use `useTranslation()` from `gatsby-plugin-react-i18next` for translated strings
- Use `useLocalizedQuery()` (custom hook) when GraphQL queries need locale awareness

### Testing

Playwright config (`playwright.config.ts`): Chromium, Italian locale (`it-IT`), 30 s timeout. Tests cover navigation links and UI flows. Gremlins.js monkey testing is available in `e2e/utils/gremlin.ts`.
