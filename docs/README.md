```yaml
mid: cue-readme
label: Cue Documentation Index
description: Reading order, conventions, and entry point for Cue docs
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  index: 500
  docs: 300
  readme: 200
tags: [index, navigation, conventions]
tags_excluded: []
```

> **NPM:** `@mdrv/cue` · **Binary:** `cue` · **Maintainer:** MDRV · **Runtime:** Bun

Cue is a **dual-column transcript prompter** that turns a `.ts` file into an interactive, timed presentation frontend. Feed it a transcript file, and it spins up a local server with look-ahead focus, duet mode, and hybrid timing.

These docs are the authoritative project plan. Each file is implementation-ready.

## Reading order

### Foundation

- [00 — Overview](./00-overview.md) — what Cue is, design principles, non-goals
- [01 — Architecture](./01-architecture.md) — layered components and data flow
- [02 — Stack Decision](./02-stack-decision.md) — why Bun, CrustJS, vanilla frontend
- [03 — Project Layout](./03-project-layout.md) — source tree and module boundaries
- [04 — Configuration](./04-configuration.md) — `defineConfig`, `~/.config/cue/cue.ts`
- [05 — CLI Surface](./05-cli-surface.md) — `cue` commands, flags, exit codes

### Transcript Model

- [10 — Transcript Format](./10-transcript-format.md) — `.ts` transcript schema, cues, speakers, meta
- [11 — Timing & Estimation](./11-timing-estimation.md) — duration ms, WPM estimation, hybrid auto/manual

### Frontend

- [20 — Prompter UI](./20-prompter-ui.md) — look-ahead rendering, duet layout, keyboard controls
- [21 — Hot Reload](./21-hot-reload.md) — file watching, SSE, live editing workflow

### Server

- [30 — HTTP Server](./30-http-server.md) — Bun.serve routes, JSON API, SSE endpoint

### Quality

- [90 — Testing Strategy](./90-testing-strategy.md) — unit tests, fixtures, CI
- [91 — Packaging](./91-packaging.md) — npm scope, binary, semver
- [99 — Known Issues & Limitations](./99-issues.md) — open bugs, deferred features
- [99 — Roadmap](./99-roadmap.md) — phased delivery plan

### Guides

- [20 — CLI Usage Guide](./guides/20-cli-usage.md) — operating Cue via the `cue` command

### Releases

- [v0.0.1](./releases/v0.0.1.md) — prototype slice (transcript loading, prompter UI, hot-reload, CLI)

## Conventions

- **Transcript language:** TypeScript `.ts` files exporting a `transcript` array.
- **Config language:** TypeScript (`defineConfig`-style) at `~/.config/cue/cue.ts`.
- **Runtime:** Bun. **CLI framework:** CrustJS. **Logger:** LogTape. **Formatter:** dprint.
- **Frontend:** Vanilla JS/CSS (no build step). Served inline by Bun.
