```yaml
mid: cue-packaging
label: "91 — Packaging"
description: npm scope, binary distribution, semver policy
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  packaging: 300
  distribution: 200
tags: [quality, packaging, npm]
tags_excluded: []
```

## NPM package

- **Scope:** `@mdrv/cue`
- **Binary:** `cue` (mapped in `package.json` `"bin"`)
- **Entry:** `src/cli/index.ts` (shebang `#!/usr/bin/env bun`)
- **Library entry:** `src/index.ts` (mapped in `package.json` `"exports"`)

## Engine requirements

- **Bun:** `^1.3.0` (specified in `package.json` `engines`)

Cue requires Bun as the runtime. It will not work with Node.js due to:

- `Bun.serve` (HTTP server)
- `Bun.watch` (file watcher)
- `Bun.file` (sync file reading)
- `Bun.dynamicImport()` with `pathToFileURL`
- Shebang targeting `bun`

## Dependencies

| Package            | Purpose                |
| ------------------ | ---------------------- |
| `@crustjs/core`    | CLI framework          |
| `@crustjs/plugins` | Help + version plugins |
| `@logtape/logtape` | Structured logging     |
| `@logtape/pretty`  | Pretty terminal output |
| `zod`              | Schema validation      |

## Dev dependencies

| Package      | Purpose              |
| ------------ | -------------------- |
| `@types/bun` | Bun type definitions |
| `typescript` | Type checker         |

## Semver policy

Cue follows semantic versioning. Until 1.0.0, the minor version may contain breaking changes.

- **Patch:** bug fixes, no API changes
- **Minor:** new features, possible breaking changes
- **Major:** reserved for post-1.0 breaking changes

## Install

```sh
bun add @mdrv/cue          # library dependency
bunx @mdrv/cue <file>      # run without installing
```
