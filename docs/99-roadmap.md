```yaml
mid: cue-roadmap
label: "99 — Roadmap"
description: Phased delivery plan for Cue
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  roadmap: 300
  planning: 200
tags: [quality, roadmap, planning]
tags_excluded: []
```

## v0.0.1 — Prototype slice (done)

Transcript loading, validation, duration estimation, prompter UI with look-ahead focus, duet mode, hybrid timing, hot-reload via SSE, CLI with play/check/init.

## v0.0.2 — Daily driver polish (done)

- **Rich text rendering** — inline markdown (bold, italic, code, links) in cue text. Disable via `config.markdown = false`.
- **Scroll anchor** — `anchor: 'top'` (default) or `'bottom'`. Bottom mirrors the layout so focus pins to the bottom and content scrolls down as you advance.
- **Font size + theme persistence** — font size and dark/light choice survive hot-reload via `localStorage` (keyed per transcript title).
- **Progress bar** — thin progress bar at the bottom of the prompter shows position in the transcript.
- **Config hot-reload** — editing the resolved config file now broadcasts a `reload` event alongside transcript edits.
- **`cue list` command** — richer than `check`: numbered cue list with previews, speakers, durations, and totals.
- **Improved error messages** — Zod issues are mapped to `cue #N "<preview>" — <field>: <message>` with context fields printed by the CLI.

## v0.0.3 — Section-aware (done)

- **Sections** — `section: 'Act I'` per cue. Sticky section header, per-column dividers at boundaries, per-section mini progress.
- **Section navigation** — `[` / `]` keys jump to the previous / next section boundary.
- **`cue list` grouping** — plain output groups cues by section with subtotals; `--json` adds a `sections` array.
- **Presenter notes** — `{ notes: 'whisper this' }`. Off-stage panel toggled by `N`, persisted per transcript.
- **Cue ids and deep-linking** — `{ id: 'welcome' }` stable handle. URL `?id=welcome` jumps to the matching cue on load. Uniqueness enforced.
- **Pronunciation hints** — `{ say: 'ROONZ' }`. Small dim italic text above the cue.
- **Speaker color border** — every cue carries a left-edge color from `SpeakerConfig.color` (visible on all cues, not just focus).
- **Focus style modes** — `focusStyle: 'opacity' | 'underline' | 'box'` config adds extra emphasis on the focus cue.

## v0.1.0 — Feature-complete and tested (next)

Goal: every public surface is exercised by humans and automatic tests, and the prototype no longer feels like a prototype.

- **Human-tested workflows** — record-and-replay passes over play/check/list/init.
- **Browser tests** — Playwright suite covering duet, timing, hot-reload, markdown rendering, sections, notes, and keyboard controls.
- **Full CommonMark** — extend the inline renderer to block-level markdown (headings, lists, blockquotes).
- **Script mode** — built on v0.0.3 notes: render notes as the primary view alongside or instead of cue text.
- **Image cue type** — `{ image: 'url' }` for visual prompts.
- **Countdown timer** — optional overlay for timed cues.
- **Export** — `cue export --format html` for offline sharing.

## v1.0.0 — Production ready

- **Plugin system** — custom CSS themes, keyboard bindings, cue renderers.
- **Config validation** — warn on unknown speaker names, unused columns.
- **Documentation site** — dedicated docs deployment.
- **Multiple language support** — RTL text rendering, CJK line breaking.
- **Mobile-responsive layout** — adaptive columns for narrow viewports.
