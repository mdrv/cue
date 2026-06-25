```yaml
mid: cue-overview
label: "00 — Overview"
description: What Cue is, design principles, stakeholders, non-goals
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  overview: 300
  vision: 200
  principles: 200
tags: [foundation, scope, vision]
tags_excluded: []
```

## What Cue is

Cue (package `@mdrv/cue`, binary `cue`) is a **dual-column transcript prompter** for read-aloud sessions, voice-overs, and side-by-side script reading. You feed it a TypeScript file exporting a transcript array, and it spins up a local HTTP server with an interactive teleprompter frontend.

Concretely, Cue does five things:

1. **Loads transcript files** — any `.ts` file that exports a `transcript` array of `{ text, duration?, speaker? }` objects.
2. **Validates and normalizes** — Zod schema ensures correct shape, defaults `speaker` to `main`, optionally estimates missing durations from word count.
3. **Serves a prompter frontend** — single-page HTML with inline CSS/JS, no build step. Look-ahead focus shows the current cue prominently and dims surrounding cues.
4. **Supports duet mode** — two-column layout routing speakers to left/right columns, for partner reading or translations.
5. **Hot-reloads on edit** — watches the transcript file for changes and pushes updates via Server-Sent Events, no page refresh needed.

## What Cue is deliberately not

- **Not a presentation framework.** Cue is a _reader_, not a slide deck. It displays sequential text cues, not slides with images, charts, or transitions.
- **Not a video recorder.** It does not capture audio or video. Use OBS, QuickTime, or similar for recording.
- **Not a text editor.** It loads `.ts` files read-only. Edit in your editor; Cue picks up changes automatically.
- **Not a multi-user collaboration tool.** One person, one browser tab. No sync, no shared cursors.
- **Not a build tool.** No bundler, no framework, no npm scripts for the frontend. Everything is vanilla JS served inline.

## Design principles

### 1. Zero-config to start

`cue <file>` works immediately with no setup. Config is optional and discovered automatically. The fastest path from `.ts` file to reading is the default path.

### 2. Config is code, in TypeScript

`~/.config/cue/cue.ts` uses a `defineConfig({...})` helper. No YAML, no TOML. TypeScript gives you autocomplete, type safety, and the ability to compute values.

### 3. Vanilla frontend, no build

The prompter is a single HTML string with inline `<style>` and `<script>`. Served by `Bun.file` read at request time. No webpack, no vite, no framework overhead. Changes to the frontend require a server restart (acceptable trade-off for zero complexity).

### 4. Timing is hybrid

Each cue can have an explicit `duration` (ms) for auto-advance, or omit it for manual keypress-only mode. Both can coexist in the same transcript — some cues auto-advance, others wait for a keypress.

### 5. Fail loud

Invalid transcript files, missing exports, schema violations — all hard errors with diagnostic messages. Cue refuses to start on a bad file rather than showing a blank screen.

### 6. Speaker routing is declarative

The config maps speaker names to columns. The transcript tags cues with speakers. The frontend routes them. Three clean layers, no implicit behavior.

## Stakeholders

| Role              | What they want from Cue                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| **Reader**        | Smooth reading experience with look-ahead, timing control, keyboard navigation |
| **Script author** | Write a `.ts` file, test it instantly with `cue <file>`                        |
| **Configurator**  | Customize theme, speakers, columns, defaults via `cue.ts`                      |

## Non-goals for v1

- Rich text / markdown rendering in cues (plain text only).
- Audio/video playback or recording.
- Multi-user or networked sessions.
- Export to PDF or other formats.
- Mobile-responsive layout (desktop browser only).
- Plugin system or extension API.
