```yaml
mid: cue-testing-strategy
label: "90 — Testing Strategy"
description: Unit tests, fixtures, test runner, coverage approach
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  testing: 300
  tests: 200
tags: [quality, testing, strategy]
tags_excluded: []
```

## Test runner

`bun test` — built-in Bun test runner. No additional config or dependencies.

## Test files

```
tests/
├── schema.test.ts       Cue + Transcript Zod schema validation
├── estimate.test.ts     Duration estimation logic
├── load.test.ts          File loading + dynamic import
└── fixtures/
    ├── valid.ts          Valid transcript export
    └── no-export.ts      File with no transcript export
```

## What is tested

- **Schema validation** — valid cues, empty text rejection, negative duration rejection, bare array format, `{meta, cues}` format, empty cue list rejection, speaker default normalization.
- **Duration estimation** — word-count scaling, empty text handling, selective filling (only missing durations).
- **File loading** — valid file load + parse, missing file error, missing export error.

## What is NOT tested (manual verification)

- **Server routes** — tested manually via browser (see live test workflow).
- **Frontend rendering** — tested manually via Firefox MCP.
- **Hot-reload** — tested manually by editing the transcript file while the server runs.
- **CLI output** — tested manually via `cue --help`, `cue check`, `cue init`.

## Running tests

```sh
bun test              # run all tests
bun test tests/schema.test.ts  # run a specific file
```

## Fixtures

Test fixtures are minimal `.ts` files in `tests/fixtures/`. They export `transcript` values used by the load tests. The `no-export.ts` fixture intentionally has no `transcript` export to test the error path.
