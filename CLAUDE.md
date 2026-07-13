# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The repo root contains a single project, `StockyApp/`. All commands below are run from that directory.

## Commands

```sh
cd StockyApp
npm install        # install dependencies
npm run dev        # start Vite dev server with hot-reload
npm run build      # production build
npm run preview    # preview the production build locally
npm run format     # format src/ with Prettier (--write --experimental-cli)
```

There is no lint or test script configured yet.

## Architecture

- Vue 3 (beta channel — `package.json` pins `vue: "beta"` and overrides all `@vue/*` packages to `beta`) built with Vite.
- Entry point: `src/main.js` mounts `src/App.vue` into `index.html`.
- `src/components/` holds the default create-vue scaffold components (`HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`, `icons/`) — this is starter boilerplate, not app-specific structure yet.
- No router, state management, or backend integration is present yet — the app is a fresh scaffold with no stock-related features implemented.
- Formatting is enforced via Prettier (`.prettierrc.json`); no ESLint config is present.
