```yaml
mid: cue-timing-estimation
label: "11 — Timing & Estimation"
description: Duration ms, WPM-based estimation, hybrid auto/manual advance
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  timing: 300
  estimation: 200
tags: [transcript, timing, estimation]
tags_excluded: []
```

## Two timing modes

Cue supports two timing modes that can be mixed freely within the same transcript:

### Auto-advance (duration set)

A cue with `duration` advances automatically after the specified milliseconds:

```ts
{ text: 'Hello!', duration: 3000 }  // auto-advances after 3 seconds
```

### Manual (no duration)

A cue without `duration` waits for a keypress (Space, Enter, or arrow keys):

```ts
{
	text: 'Press a key to continue...'
} // waits for user input
```

### Mixed

Both modes coexist naturally:

```ts
export const transcript = [
	{ text: 'Opening line', duration: 2000 }, // auto
	{ text: 'Pause for emphasis' }, // manual
	{ text: 'Next point', duration: 4000 }, // auto
	{ text: 'End of section — press to continue' }, // manual
]
```

## Duration estimation (`--estimate`)

When `--estimate` is passed (or `cue init` config sets it), missing durations are filled based on word count:

```
duration_ms = (word_count / wpm) * 60_000
```

Default WPM is 160 (configurable via `--wpm` or `config.wpm`). Estimation only fills cues that have no `duration` — explicitly set durations are never overridden.

## Frontend timing behavior

- Auto-advance uses `setTimeout` and resets on manual navigation.
- Pressing Space/Enter/→ during auto-advance cancels the current timer and advances immediately.
- Pressing ← goes back one cue (also cancels timer).
- `P` toggles play/pause (pauses auto-advance globally).
- `R` restarts from the beginning.

## Estimation API

```ts
import { estimateDuration, estimateDurations } from '@mdrv/cue'

estimateDuration('Hello world', 160) // → ~750ms (2 words at 160 WPM)
estimateDuration('', 160) // → 0

estimateDurations(
	[
		{ text: 'Auto', duration: 3000 },
		{ text: 'Manual' },
	],
	160,
)
// → [{ text: 'Auto', duration: 3000 }, { text: 'Manual', duration: 375 }]
```
