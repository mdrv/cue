# cue

> Dual-column transcript prompter — turn a `.ts` file into a teleprompter.

> [!CAUTION]
> **Personal software, maintained for the author only.** The repo is public so the CI and install pipeline have a home, not because it is a supported product. Development is heavily LLM-assisted: most commits are written with AI agents and verified only against the author's own apps. Expect breaking changes at any minor bump — no support, no stability guarantee, no release schedule. Use it, fork it, but you're on your own.

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
- **Look-ahead focus** — current cue bright, surrounding cues dimmed; `lookBehind` (default 1) and `lookAhead` (default 2) set exactly how many cues precede and follow the focus line — `lookBehind: 0` hides previous lines entirely
- **Duet mode** — two-column layout for partner reading or translations
- **Hybrid timing** — auto-advance by duration (ms) or manual keypress, mixed freely; while playing, a thin countdown bar under the current line shows when the next line comes
- **Hot-reload** — edit transcript or config, changes appear instantly via SSE
- **Remote control** — open `/remote` on a phone (same network) and drive the prompter from there: tap zones, play/pause, cue drawer; the prompter reports its own changes back, so both screens stay in sync
- **Markdown in cues** — `**bold**`, `*italic*`, `` `code` ``, `[label](url)`, plus GFM tables, lists, and headings — rendered safely, with raw HTML and unsafe URLs stripped
- **Scroll anchor & flow** — `anchor: 'top-left' … 'bottom-right'` pins the focus line to any edge or center; `flow: 'horizontal'` lays cues out as a side-scrolling strip; `reverse` flips the entry edge so the next line arrives from above (or from the left) — ideal when the camera sits on the empty side
- **Progress bar** — thin position indicator at the bottom
- **Chrome placement** — `chrome: 'bottom'` moves the title bar and section indicator to the bottom edge (useful when the camera crops the top of the screen)
- **Content width** — `contentWidth` (px; 0 = auto `60ch`) caps the reading column; `W−` / `W+` in the control bar adjust it live per device (saved)
- **Persistence** — font size and theme saved per transcript via `localStorage`
- **Sections** — `section: 'Act I'` per cue with sticky header, inline dividers, and `[`/`]` navigation
- **Presenter notes** — `{ notes: 'whisper this' }` off-stage panel toggled by `N`
- **Cue ids** — `{ id: 'welcome' }` stable handle with `?id=deep-link`
- **Pronunciation hints** — `{ say: 'ROONZ' }` small dim italic text above cue
- **Focus styles** — `focusStyle: 'opacity' | 'underline' | 'box'` for extra emphasis
- **Speaker color borders** — colored left edge on every cue from `SpeakerConfig.color`
- **Optional config** — `~/.config/cue/cue.ts` for theme, speakers, and defaults
- **Inline config** — `export const config` in the transcript file for self-contained shows (columns, speakers, theme)
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
- `section` (optional) — section name for sticky headers and dividers
- `notes` (optional) — presenter notes, shown in off-stage panel
- `id` (optional) — stable handle for `?id=deep-linking`
- `say` (optional) — pronunciation hint shown above cue text

Transcript files may also export an inline `config` for self-contained shows:

```ts
import { defineConfig } from '@mdrv/cue'

export const config = defineConfig({
	duet: true,
	fontSize: 56,
	speakers: { guest: { column: 'right', color: '#a5b4fc' } },
})
```

A plain object works too — both validate identically. See [Config](#config) for precedence.

## CLI

```sh
cue <file>                  # start prompter
cue <file> --duet           # force dual-column layout
cue <file> --estimate       # auto-fill missing durations
cue <file> --port 8080      # custom port
cue <file> --no-open        # don't open browser
cue check <file>            # validate transcript
cue check <file> --json     # validate, output JSON
cue list <file>             # numbered per-cue breakdown
cue list <file> --json      # richer JSON than check
cue list <file> --wpm 180   # show ~Xms estimates for untimed cues
cue init                    # create sample config
```

## Config

```ts
// ~/.config/cue/cue.ts
import { defineConfig } from '@mdrv/cue'

export default defineConfig({
	fontSize: 56,
	anchor: 'top',
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

Precedence (low → high): `DEFAULT_CONFIG` ← file config (`--config` → `./.cue/cue.ts` → `~/.config/cue/cue.ts`, first found) ← `transcript.meta` (`wpm`/`duet`) ← inline `export const config` ← CLI flags (only when passed). Layers merge deeply — `theme` merges per color and `speakers` per speaker entry, so an inline speaker map doesn't wipe the defaults.

## Keyboard controls

| Key                     | Action               |
| ----------------------- | -------------------- |
| `Space` / `Enter` / `→` | Next cue             |
| `←`                     | Previous cue         |
| `P`                     | Toggle play/pause    |
| `R`                     | Restart              |
| `F`                     | Fullscreen           |
| `T`                     | Toggle theme (saved) |
| `+` / `-`               | Font size (saved)    |
| `[`                     | Previous section     |
| `]`                     | Next section         |
| `N`                     | Toggle notes panel   |
| `?`                     | Help                 |

## Programmatic API

```ts
import {
	buildConfig,
	defineConfig,
	estimateDurations,
	loadConfig,
	parseTranscriptFile,
	renderMarkdown,
	VERSION,
} from '@mdrv/cue'

const transcript = await parseTranscriptFile('./script.ts')
const filled = estimateDurations(transcript.cues, 160)
const html = await renderMarkdown('**hello** world')
```

`renderMarkdown` renders full GFM markdown to an HTML string, sanitized: raw HTML is neutralized, event-handler attributes and scripts are stripped, and link/image URLs are restricted to safe schemes.

## Requirements

- **Bun** ^1.4.4

## License

MIT
