```yaml
mid: cue-configuration
label: "04 — Configuration"
description: defineConfig helper, config resolution order, CueConfig shape
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
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

| Field      | Type                            | Default    | Description                                  |
| ---------- | ------------------------------- | ---------- | -------------------------------------------- |
| `port`     | `number`                        | `0` (auto) | Server port. 0 = OS picks a free port        |
| `open`     | `boolean`                       | `true`     | Open browser on start                        |
| `wpm`      | `number`                        | `160`      | Words-per-minute for duration estimation     |
| `duet`     | `boolean`                       | `false`    | Force dual-column layout                     |
| `fontSize` | `number`                        | `48`       | Base font size in px                         |
| `theme`    | `ThemeConfig`                   | dark theme | Colors: background, focus, dim, fade, accent |
| `speakers` | `Record<string, SpeakerConfig>` | main+side  | Speaker-to-column routing                    |

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
