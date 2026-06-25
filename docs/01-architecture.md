```yaml
mid: cue-architecture
label: "01 — Architecture"
description: Layered components, data flow, module boundaries
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T19:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  architecture: 300
  modules: 200
tags: [foundation, architecture, data-flow]
tags_excluded: []
```

## Layers

Cue is four layers, each consuming the one below:

```
CLI (crustjs)           cue <file>  cue check  cue list  cue init
    ↓
Server (Bun.serve)      / → HTML   /api/transcript → JSON   /events → SSE
    ↓
Transcript (pure)      load → validate → estimate → Transcript
    ↓
Config (loader)        resolve → merge flags → CueConfig
```

## Data flow

1. **CLI entry** (`src/cli/index.ts`) parses flags and routes to the appropriate command.
2. **`cue <file>`** (root command): loads config, calls `parseTranscriptFile`, estimates durations if `--estimate`, then calls `serveTranscript`.
3. **`serveTranscript`** starts `Bun.serve` with three routes and an optional `Bun.watch` for hot-reload.
4. **Browser** loads `/`, gets the full HTML page with inline CSS+JS and `window.__CUE__` bootstrap JSON.
5. **Frontend JS** (`app.js`) renders cues from the bootstrap data, handles keyboard/timing, and listens on SSE `/events` for live reload.

## Module boundaries

| Module            | Depends on                             | Async?                               | Tests                                    |
| ----------------- | -------------------------------------- | ------------------------------------ | ---------------------------------------- |
| `src/errors/`     | nothing                                | no                                   | inline                                   |
| `src/log/`        | @logtape/logtape                       | yes (init)                           | inline                                   |
| `src/config/`     | zod, @logtape                          | yes (loadConfig uses dynamic import) | tests/schema                             |
| `src/transcript/` | zod, @logtape                          | no (load uses dynamic import)        | tests/schema, tests/load, tests/estimate |
| `src/server/`     | Bun.serve, Bun.watch, transcript types | yes                                  | manual (browser)                         |
| `src/frontend/`   | nothing (runtime: browser DOM)         | no (renderPage is sync)              | manual (browser)                         |
| `src/cli/`        | all above, @crustjs/core               | yes                                  | manual (CLI smoke)                       |

## Public API

Everything public re-exports through `src/index.ts`. The CLI (`src/cli/`) goes through the public API — never imports internal modules directly.
