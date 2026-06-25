# @mdrv/cue

> Dual-column transcript prompter — turn a `.ts` file into a teleprompter.

Cue is a Bun-powered prompter for read-aloud sessions, voice-overs, and side-by-side script reading. Feed it a TypeScript transcript file and it spins up a local server with an interactive teleprompter frontend.

## Quick start

```sh
bun add @mdrv/cue
```

```ts
// transcript.ts
export const transcript = [
	{ text: 'Hello and welcome to the show!', duration: 3000 },
	{ text: 'Today we are looking at Bun and Svelte.', speaker: 'side' },
]
```

```sh
cue transcript.ts
```

## Features

- **CLI-first** — `cue <file>` with zero config required
- **Look-ahead focus** — current cue bright, surrounding cues dimmed
- **Duet mode** — two-column layout for partner reading or translations
- **Hybrid timing** — auto-advance by duration (ms) or manual keypress, mixed freely
- **Hot-reload** — edit the transcript file, changes appear instantly via SSE
- **Optional config** — `~/.config/cue/cue.ts` for theme, speakers, and defaults
- **Vanilla frontend** — no build step, no framework, single HTML page

## Transcript format

A `.ts` file exporting a `transcript` array:

```ts
export const transcript = [
	{ text: 'Opening line', duration: 3000 },
	{ text: 'Response from the other side', speaker: 'side', duration: 4000 },
	{ text: 'Manual advance — press Space to continue' },
]
```

Each cue has:

- `text` (required) — the content to display
- `duration` (optional) — auto-advance delay in milliseconds
- `speaker` (optional) — speaker tag, defaults to `"main"`

## CLI

```sh
cue <file>                  # start prompter
cue <file> --duet           # force dual-column layout
cue <file> --estimate       # auto-fill missing durations
cue <file> --port 8080      # custom port
cue <file> --no-open        # don't open browser
cue check <file>            # validate transcript
cue check <file> --json     # validate, output JSON
cue init                    # create sample config
```

## Config

```ts
// ~/.config/cue/cue.ts
import { defineConfig } from '@mdrv/cue'

export default defineConfig({
	fontSize: 56,
	theme: {
		background: '#0b0d12',
		focus: '#f5f7fb',
		dim: '#6b7280',
		fade: '#2b313b',
		accent: '#7dd3fc',
	},
	speakers: {
		main: { column: 'left' },
		side: { column: 'right', color: '#fca5a5' },
	},
})
```

Resolution order: `--config` → `./.cue/cue.ts` → `~/.config/cue/cue.ts` → defaults.

## Keyboard controls

| Key                     | Action            |
| ----------------------- | ----------------- |
| `Space` / `Enter` / `→` | Next cue          |
| `←`                     | Previous cue      |
| `P`                     | Toggle play/pause |
| `R`                     | Restart           |
| `F`                     | Fullscreen        |
| `+` / `-`               | Font size         |
| `?`                     | Help              |

## Programmatic API

```ts
import {
	defineConfig,
	estimateDurations,
	loadConfig,
	parseTranscriptFile,
	VERSION,
} from '@mdrv/cue'

const transcript = await parseTranscriptFile('./script.ts')
const filled = estimateDurations(transcript.cues, 160)
```

## Requirements

- **Bun** ^1.3.0

## License

MIT
