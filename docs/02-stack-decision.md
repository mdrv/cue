```yaml
mid: cue-stack-decision
label: "02 — Stack Decision"
description: Why Bun, CrustJS, vanilla frontend, LogTape, Zod
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  stack: 300
  decisions: 200
tags: [foundation, stack, decisions]
tags_excluded: []
```

## Why Bun

- **Fast startup.** Cue should feel instant — `cue <file>` to browser in under 100ms. Bun's cold start is an order of magnitude faster than Node.
- **Built-in HTTP server.** `Bun.serve` is zero-dependency and fast enough for a single-user local server. No Express, no Hono needed.
- **Built-in file watcher.** `Bun.watch` gives us hot-reload without chokidar or any watcher library.
- **Built-in test runner.** `bun test` is fast, has built-in assertions, and needs no config.
- **Native TS support.** `allowImportingTsExtensions` lets us import `.ts` files directly. The transcript files _are_ TypeScript — this is non-negotiable.

## Why CrustJS

- **Lightweight CLI framework** for Bun. Provides flag parsing, subcommands, help text, and plugin hooks (version, help) in ~100 LOC of wiring.
- **Used by sibling projects** (surrealdx, zellijmcp, nx). Consistency across the `@mdrv` ecosystem.

## Why vanilla frontend (no framework)

- **Zero build step.** The prompter is a single HTML string with inline CSS/JS. No webpack, no vite, no svelte-kit. This eliminates an entire class of build failures and version mismatches.
- **Small surface.** The prompter does one thing: display text cues with timing and keyboard controls. It does not need state management, routing, or component composition.
- **Trade-off accepted:** changing the frontend requires a server restart. This is acceptable because the frontend is stable and changes rarely.

## Why LogTape

- **Zero-dependency structured logging** with hierarchical categories. Root category `['cue']`, children like `['cue', 'server']` and `['cue', 'config']`.
- **Pretty terminal output** via `@logtape/pretty`. No ANSI escape juggling.
- **Used by all sibling projects.** Consistent logging across the ecosystem.

## Why Zod

- **Runtime validation** for both transcript schemas and config schemas. Zod v4 with discriminated unions handles the transcript format cleanly (bare array vs `{meta, cues}` object).
- **Type inference** from schemas means our TypeScript types derive from the same source of truth as our validation.
