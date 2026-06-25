```yaml
mid: cue-project-layout
label: "03 — Project Layout"
description: Source tree, module boundaries, public API surface
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  layout: 300
  structure: 200
tags: [foundation, layout, structure]
tags_excluded: []
```

## Source tree

```
cue/
├── src/
│   ├── cli/           CrustJS CLI entry and commands
│   │   ├── index.ts   shebang, main(), configured app
│   │   ├── shared.ts  Crust app + GlobalFlags
│   │   ├── play.ts    root command: cue <file>
│   │   ├── check.ts   cue check <file>
│   │   ├── list.ts    cue list <file>
│   │   └── init.ts    cue init
│   ├── config/        Config types, schema, loader
│   │   ├── types.ts   CueConfig, ThemeConfig, SpeakerConfig, DEFAULT_CONFIG
│   │   ├── schema.ts  Zod schema for CueConfig
│   │   ├── defineConfig.ts  defineConfig() helper
│   │   ├── loader.ts  resolveConfigPath, loadConfig
│   │   └── sample.ts  template string for cue init
│   ├── errors/        CueError + factory
│   │   └── index.ts
│   ├── frontend/      Prompter HTML + vanilla JS
│   │   ├── index.ts   renderPage (HTML string builder)
│   │   ├── app.js     browser-side prompter logic
│   │   └── markdown.ts  renderInlineMarkdown (server-side)
│   ├── log/           LogTape setup
│   │   └── logger.ts  initLogger
│   ├── server/        Bun.serve + SSE
│   │   ├── serve.ts   serveTranscript (main server)
│   │   ├── reload.ts  ReloadHub (SSE pub/sub)
│   │   └── util.ts    openBrowser, htmlResponse, jsonResponse
│   ├── transcript/    Transcript schema, load, estimate
│   │   ├── types.ts   Cue, Transcript, TranscriptMeta, defaults
│   │   ├── schema.ts  Zod schema for Cue and Transcript
│   │   ├── load.ts    parseTranscriptFile (dynamic import)
│   │   └── estimate.ts  estimateDuration, estimateDurations
│   └── index.ts       barrel re-exports (public API)
├── tests/
│   ├── schema.test.ts
│   ├── estimate.test.ts
│   ├── load.test.ts
│   ├── markdown.test.ts
│   └── fixtures/
│       ├── valid.ts
│       ├── no-export.ts
│       └── dup-ids.ts
├── examples/
│   └── demo.ts
├── docs/              This plan
├── package.json
├── tsconfig.json
└── dprint.jsonc
```

## Module boundaries

- `errors/` and `log/` are leaf modules — no internal dependencies.
- `config/` depends on `errors/` and `log/`.
- `transcript/` depends on `errors/` and `log/`.
- `server/` depends on `transcript/`, `config/`, `errors/`, and `log/`.
- `frontend/` has no Node.js dependencies — it runs in the browser.
- `cli/` depends on everything.
- `src/index.ts` re-exports the public surface from `errors/`, `transcript/`, `config/`, `log/`, `frontend/`, and `server/`.

## Public API surface

`src/index.ts` exports:

- `VERSION` — from package.json
- `CueError`, `cueError`, `CueErrorCode`, `CueErrorContext` — error handling
- `initLogger`, `getLogger` — logging setup
- `defineConfig` — config helper
- `loadConfig`, `resolveConfigPath` — config loading
- `CueConfig`, `DEFAULT_CONFIG`, `DEFAULT_THEME`, `LIGHT_THEME`, `ThemeConfig`, `SpeakerConfig`, `Column`, `Anchor`, `FocusStyle` — config types
- `Cue`, `Transcript`, `TranscriptMeta`, `Speaker` — transcript types
- `DEFAULT_SPEAKER`, `DEFAULT_WPM` — transcript defaults
- `cueSchema`, `transcriptSchema`, `ParsedCue`, `ParsedTranscript` — Zod schemas
- `parseTranscriptFile`, `loadTranscript` — transcript loading
- `estimateDuration`, `estimateDurations` — transcript operations
- `renderInlineMarkdown` — inline markdown renderer
- `serveTranscript`, `ServeHandle`, `ServeOptions` — server
