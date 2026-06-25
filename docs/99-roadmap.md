```yaml
mid: cue-roadmap
label: "99 — Roadmap"
description: Phased delivery plan for Cue
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  roadmap: 300
  planning: 200
tags: [quality, roadmap, planning]
tags_excluded: []
```

## v0.0.1 — Prototype slice (current)

Transcript loading, validation, duration estimation, prompter UI with look-ahead focus, duet mode, hybrid timing, hot-reload via SSE, CLI with play/check/init.

## v0.1.0 — Usable daily driver

- **Rich text rendering** — basic markdown support (bold, italic, links) in cue text.
- **Font size persistence** — remember font size across hot-reload via localStorage.
- **Progress bar** — visual position indicator at the bottom of the screen.
- **Config hot-reload** — detect config file changes, not just transcript changes.
- **`cue list` command** — validate and summarize without starting server (richer than `check`).
- **Improved error messages** — show line number and context on parse errors.

## v0.2.0 — Presentation features

- **Markdown rendering** — full CommonMark support in cues.
- **Image support** — `{ image: 'url' }` cue type for visual prompts.
- **Script mode** — split cues into "prompter view" and "notes" sections (presenter notes).
- **Countdown timer** — optional countdown overlay for timed cues.
- **Export** — `cue export --format html` for offline sharing.

## v1.0.0 — Production ready

- **Plugin system** — custom CSS themes, keyboard bindings, cue renderers.
- **Config validation** — warn on unknown speaker names, unused columns.
- **Comprehensive test suite** — browser tests via Playwright, E2E CLI tests.
- **Documentation site** — dedicated docs deployment.
- **Multiple language support** — RTL text rendering, CJK line breaking.
