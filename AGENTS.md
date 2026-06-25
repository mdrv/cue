# AGENTS.md

Guidance for AI agents (Claude, Cursor, Copilot, opencode, etc.) working on Cue.

## Authoritative references

- **`docs/` is the authoritative plan.** Read the relevant section before implementing anything. Start at `docs/README.md` for the reading order.
- **When docs and code disagree, docs win** unless the maintainer has explicitly approved a deviation. Propose doc updates; don't silently contradict them.

## Project invariants (do not violate)

1. **Pure TypeScript on Bun.** No Node.js, no webpack, no vite, no frontend framework. See `docs/02-stack-decision.md`.
2. **Vanilla frontend, no build step.** The prompter is a single HTML string with inline CSS/JS. Served by `Bun.file`. See `docs/20-prompter-ui.md`.
3. **Config is TypeScript, not YAML/TOML.** `defineConfig()` helper in `cue.ts`. See `docs/04-configuration.md`.
4. **Transcript files are `.ts` files.** They export `transcript` — a bare array or `{meta, cues}` object. See `docs/10-transcript-format.md`.
5. **Speaker routing is declarative.** Config maps names to columns; transcript tags cues; frontend renders. Three clean layers.
6. **`transcript/` and `errors/` are pure modules.** No I/O except `parseTranscriptFile` (which uses dynamic import). No async in schema/estimate.
7. **CLI goes through the public `src/index.ts` API.** Never import internal modules from `cli/`.
8. **LogTape core is `@logtape/logtape`** — NOT `@logtape/tapelog` or any other package.
9. **No code comments** unless the user explicitly requests them.

## Stack

| Concern       | Choice                                          |
| ------------- | ----------------------------------------------- |
| Runtime       | Bun (latest)                                    |
| Language      | TypeScript strict, `allowImportingTsExtensions` |
| CLI framework | `@crustjs/core` + `@crustjs/plugins`            |
| HTTP server   | `Bun.serve` (built-in)                          |
| File watcher  | `Bun.watch` (built-in)                          |
| Logging       | `@logtape/logtape` (NOT `@logtape/tapelog`)     |
| Formatter     | `dprint` (config in `dprint.jsonc`)             |
| Test runner   | `bun test`                                      |
| Validation    | `zod`                                           |

## Code style (enforced by `dprint.jsonc`)

- **Tab** indentation
- **Single** quotes
- **No** semicolons (`semiColons: "asi"`)
- `camelCase.ts` filenames, one primary export per file
- `PascalCase` types (no `I` prefix)
- `camelCase` functions, verb-first (`parseTranscriptFile`, not `transcriptParse`)
- `SCREAMING_SNAKE_CASE` for constants/enum-like values
- `kebab-case` for CLI subcommands (`cue check`)
- **NO code comments** unless the user explicitly requests them

## Commands

```sh
bun test                       # run tests
bun src/cli/index.ts <cmd>     # run CLI from source
dprint fmt                     # format all files
dprint check                   # verify formatting without writing
bun install                    # install deps
```

## Workflow

1. **Read the relevant doc** before implementing.
2. **Respect layering** — see `docs/03-project-layout.md`.
3. **Prototype fast, test thoroughly.** Working end-to-end slice first, tests at the end of each milestone.
4. **Run `dprint fmt`** before considering any code change complete.
5. **Never edit `docs/`** without explicit maintainer approval. Propose changes in chat.
6. **Never commit** unless explicitly asked.

## Common pitfalls

- Reaching for `@logtape/tapelog` — the core package is **`@logtape/logtape`**.
- Adding a framework (React, Vue, Svelte) to the frontend — it must stay vanilla.
- Adding a build step (webpack, vite) for the frontend — not allowed.
- Writing YAML or TOML config — config is TypeScript only.
- Treating speaker routing as implicit — it must be declarative in config.
- Adding semicolons or double quotes — formatter enforces ASI and single quotes.
- Adding code comments — only when explicitly requested.

## Status

Currently targeting **v0.0.1** (prototype slice). See `docs/99-roadmap.md` for the delivery plan.
