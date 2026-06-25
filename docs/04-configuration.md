```yaml
mid: cue-configuration
label: "04 — Configuration"
description: defineConfig helper, config resolution order, CueConfig shape
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  configuration: 300
  config: 200
tags: [foundation, configuration, config]
tags_excluded: []
```

## Resolution order

Cue resolves config in this order (first found wins):

1. `--config <path>` — explicit CLI flag
2. `./.cue/cue.ts` — project-local config
3. `~/.config/cue/cue.ts` — user-global config
4. `DEFAULT_CONFIG` — hardcoded defaults

## defineConfig helper

```ts
import { defineConfig } from '@mdrv/cue'

export default defineConfig({
	port: 0,
	open: true,
	wpm: 160,
	duet: false,
	markdown: true,
	anchor: 'top',
	focusStyle: 'opacity',
	fontSize: 48,
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

## CueConfig shape

| Field        | Type                                | Default     | Description                                        |
| ------------ | ----------------------------------- | ----------- | -------------------------------------------------- |
| `port`       | `number`                            | `0` (auto)  | Server port. 0 = OS picks a free port              |
| `open`       | `boolean`                           | `true`      | Open browser on start                              |
| `wpm`        | `number`                            | `160`       | Words-per-minute for duration estimation           |
| `duet`       | `boolean`                           | `false`     | Force dual-column layout                           |
| `markdown`   | `boolean`                           | `true`      | Render inline markdown in cue text (v0.0.2)        |
| `anchor`     | `'top' \| 'bottom'`                 | `'top'`     | Focus position. `'bottom'` mirrors layout (v0.0.2) |
| `focusStyle` | `'opacity' \| 'underline' \| 'box'` | `'opacity'` | Extra emphasis on the focus cue (v0.0.3)           |
| `fontSize`   | `number`                            | `48`        | Base font size in px                               |
| `theme`      | `ThemeConfig`                       | dark theme  | Colors: background, focus, dim, fade, accent       |
| `speakers`   | `Record<string, SpeakerConfig>`     | main+side   | Speaker-to-column routing                          |

## SpeakerConfig

| Field    | Type                | Description                                |
| -------- | ------------------- | ------------------------------------------ |
| `column` | `'left' \| 'right'` | Which column this speaker's cues appear in |
| `color`  | `string?`           | Optional custom color override             |

## Flag overrides

CLI flags override config values at runtime:

- `--port` overrides `config.port`
- `--no-open` overrides `config.open`
- `--duet` overrides `config.duet`
- `--wpm` overrides `config.wpm`
- `--estimate` triggers duration estimation using `config.wpm` (or `--wpm` if set)

## Default theme

Cue ships with a dark theme optimized for readability on stage/presenter monitors. Colors use high-contrast pairings: near-white focus text on near-black background, with blue accent for navigation cues.

## Markdown in cues

When `markdown: true` (the default), Cue renders an inline subset — `**bold**`, `*italic*`, `` `code` ``, and `[label](url)` — in cue text. HTML is always escaped first, and `javascript:`/`data:` URLs are blocked. The renderer is inline-only; block-level markdown (headings, lists, blockquotes) is deferred to v0.1.0.

Set `markdown: false` to disable the renderer and display cue text verbatim (escaped).

## Anchor (scroll direction)

The `anchor` config controls where the focus cue sits in the viewport and which direction content scrolls as you advance:

- `anchor: 'top'` (default) — focus is pinned near the **top**. Look-ahead cues (`next`, `next2`) appear below. As you advance, content scrolls **up** through the focus.
- `anchor: 'bottom'` — focus is pinned near the **bottom**. Look-ahead cues appear above. As you advance, content scrolls **down** through the focus.

The two modes are true vertical mirrors: the DOM order `[prev, focus, next, next2]` is unchanged, but `anchor: 'bottom'` adds a `.bottom` class to each column which applies `flex-direction: column-reverse`, so visual order becomes `[next2, next, focus, prev]`. Both columns (and the standby column in duet) get the class.

Switching anchor takes effect on the next config hot-reload (edit the config file and save) or on server restart.

## Focus style (v0.0.3)

The `focusStyle` config controls how the focus cue is visually emphasized on top of the existing size/color gradient. Three modes:

- `focusStyle: 'opacity'` (default) — no extra emphasis. The focus cue is simply the largest and brightest. This is the original v0.0.1 look.
- `focusStyle: 'underline'` — adds a 3px `--accent` bottom border under the focus cue.
- `focusStyle: 'box'` — wraps the focus cue in a 2px `--accent` border with rounded corners.

The style is additive: it does not change size, color, opacity, or speaker-color border — those still come from the existing look-ahead gradient. Only the focus cue receives the extra emphasis.
