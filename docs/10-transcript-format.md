```yaml
mid: cue-transcript-format
label: "10 — Transcript Format"
description: .ts transcript schema, cue shape, speakers, meta object
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  transcript: 300
  format: 200
  schema: 200
tags: [transcript, format, schema]
tags_excluded: []
```

## File format

A transcript is a `.ts` file that exports a `transcript` value. Two shapes are accepted:

### Bare array (simple)

```ts
export const transcript = [
	{ text: 'Hello and welcome to the show!', duration: 3000 },
	{ text: 'Today we are looking at Bun.', speaker: 'side' },
]
```

### Object with meta (advanced)

```ts
export const transcript = {
	meta: { title: 'Episode 1', wpm: 180, duet: true },
	cues: [
		{ text: 'Welcome!', duration: 2000 },
		{ text: 'Thanks for having me.', speaker: 'side', duration: 3000 },
	],
}
```

## Cue shape

| Field      | Type     | Required | Description                                                                  |
| ---------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `text`     | `string` | yes      | The text to display. Must be non-empty. Supports inline markdown (see below) |
| `duration` | `number` | no       | Auto-advance delay in milliseconds. Omit for manual-only                     |
| `speaker`  | `string` | no       | Speaker tag. Defaults to `'main'`                                            |
| `section`  | `string` | no       | Section name. Triggers sticky header + boundary dividers (v0.0.3)            |
| `notes`    | `string` | no       | Presenter notes. Off-stage panel, toggle with `N` (v0.0.3)                   |
| `id`       | `string` | no       | Stable handle for deep-linking (`?id=welcome`). Must be unique (v0.0.3)      |
| `say`      | `string` | no       | Pronunciation hint. Small dim text above the cue (v0.0.3)                    |

## TranscriptMeta shape

| Field   | Type       | Description                         |
| ------- | ---------- | ----------------------------------- |
| `title` | `string?`  | Transcript title (displayed in UI)  |
| `wpm`   | `number?`  | Override default WPM for estimation |
| `duet`  | `boolean?` | Force duet mode for this transcript |

## Speaker names

Speaker names are free-form strings. Cue has two built-in defaults:

- `main` — routed to the left column, standard color
- `side` — routed to the right column, red-tinted color

Custom speakers can be added via config:

```ts
export default defineConfig({
	speakers: {
		main: { column: 'left' },
		side: { column: 'right', color: '#fca5a5' },
		host: { column: 'left', color: '#93c5fd' },
		guest: { column: 'right', color: '#fca5a5' },
	},
})
```

## Validation rules

- `text` must be a non-empty string (min 1 character after trim)
- `duration` must be a positive number if present (must be > 0)
- `section` and `id` must be non-empty if present
- `cues` array must have at least one element
- `id` values must be **unique** across the transcript (checked post-parse; duplicates produce `cue.id "x" appears at cues #N, #M`)
- Unknown properties are silently stripped (Zod `.passthrough().transform()`)

## Dynamic import

Cue loads transcript files via `Bun.dynamicImport()` with `pathToFileURL`. This means:

- The file runs in a sandboxed module context
- Imports work normally (you can import other modules in your transcript file)
- The file must export `transcript` as a named export
- Top-level side effects in the transcript file will execute

## Inline markdown (v0.0.2)

Cue `text` supports an inline markdown subset by default:

- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- `` `code` `` → `<code>`
- `[label](url)` → `<a href="url">label</a>`

HTML is escaped first; `javascript:` and `data:` URLs are blocked. The renderer is inline-only — block-level markdown (headings, lists, blockquotes) is deferred to v0.1.0.

Disable rendering globally via config:

```ts
export default defineConfig({ markdown: false })
```

When `markdown: false`, cue text is rendered verbatim (HTML-escaped, no inline transforms).

## Sections (v0.0.3)

Any cue may carry a `section: 'Act I'` string. Sections are flat (per-cue tags, not nested) — boundaries emerge when consecutive cues carry different values. When the transcript contains any cue with a `section`, the prompter shows:

- A **sticky section bar** at the top of the stage (or bottom for `anchor: 'bottom'`) showing the current section name, a `position / total` counter, and a mini progress bar.
- **Section dividers** rendered inline within each column at every boundary (a thin horizontal rule with the new section name in caps).
- **`[` / `]` keyboard shortcuts** to jump to the previous / next section boundary.

Cues without a `section` belong to a `(no section)` group; the divider still renders at the transition.

```ts
export const transcript = [
	{ text: 'Cold open.', section: 'Intro' },
	{ text: 'Welcome back.', section: 'Main' },
	{ text: 'See you next time.', section: 'Outro' },
]
```

## Presenter notes (v0.0.3)

Cues may carry a `notes: 'whisper this'` string. Notes are not shown on stage — they appear in an off-stage panel (top-right) toggled by `N`. The panel shows the current cue's notes plus a one-line preview of the next cue that has notes. Notes visibility is persisted per transcript title (`cue:<title>:notes`).

## Cue ids and deep-linking (v0.0.3)

Cues may carry an `id: 'welcome'` string for stable references. Ids must be unique (duplicates fail validation). The prompter reads `?id=welcome` from the URL on load and jumps to the first cue with that id — useful for resuming long transcripts or sharing a deep link.

```ts
{ text: 'Welcome to episode 12.', id: 'ep12-start' }
```

## Pronunciation hints (v0.0.3)

Cues may carry a `say: 'SI-borg'` string. It renders as small, dim, italic text directly above the cue text — a quick visual reminder of how to pronounce a name or term. No keyboard interaction; purely visual.

```ts
{ text: 'Svelte 5 runes.', say: 'ROONZ' }
```
