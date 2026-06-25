```yaml
mid: cue-transcript-format
label: "10 — Transcript Format"
description: .ts transcript schema, cue shape, speakers, meta object
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
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

| Field      | Type     | Required | Description                                              |
| ---------- | -------- | -------- | -------------------------------------------------------- |
| `text`     | `string` | yes      | The text to display. Must be non-empty                   |
| `duration` | `number` | no       | Auto-advance delay in milliseconds. Omit for manual-only |
| `speaker`  | `string` | no       | Speaker tag. Defaults to `'main'`                        |

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
- `cues` array must have at least one element
- Unknown properties are silently stripped (Zod `.passthrough().transform()`)

## Dynamic import

Cue loads transcript files via `Bun.dynamicImport()` with `pathToFileURL`. This means:

- The file runs in a sandboxed module context
- Imports work normally (you can import other modules in your transcript file)
- The file must export `transcript` as a named export
- Top-level side effects in the transcript file will execute
