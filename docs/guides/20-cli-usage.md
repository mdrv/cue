```yaml
mid: cue-guide-cli-usage
label: "20 — CLI Usage Guide"
description: Practical walkthrough of using cue from the command line
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  guide: 300
  cli: 200
  usage: 200
tags: [guide, cli, usage, walkthrough]
tags_excluded: []
```

## Quick start

```sh
# Install
bun add @mdrv/cue

# Create a transcript file
cat > my-transcript.ts << 'EOF'
export const transcript = [
	{ text: 'Welcome to the show!', duration: 3000 },
	{ text: 'First topic...', duration: 5000 },
	{ text: 'Thanks for watching!' },
]
EOF

# Start the prompter
cue my-transcript.ts
```

Cue opens your browser and displays the prompter. Press Space to advance, ← to go back.

## Duet mode

Create a two-speaker transcript:

```ts
export const transcript = [
	{ text: 'Good evening, everyone.', speaker: 'host', duration: 3000 },
	{ text: 'Good evening! Happy to be here.', speaker: 'guest', duration: 4000 },
	{ text: 'Let us start with your background.', speaker: 'host' },
	{
		text: 'Sure! I started coding in 2015...',
		speaker: 'guest',
		duration: 8000,
	},
]
```

Run with duet enabled:

```sh
cue --duet my-transcript.ts
```

The host's cues appear in the left column, the guest's in the right.

## Auto-estimate missing durations

If most of your cues have durations but some are manual-only, you can auto-fill the missing ones:

```sh
cue --estimate --wpm 140 my-transcript.ts
```

## Check without starting server

Validate a transcript file:

```sh
cue check my-transcript.ts
# Output: ✓ 12 cues, 2 speakers (main, side), total ~45s

cue check --json my-transcript.ts
# Output: {"valid":true,"cues":12,"speakers":["main","side"],...}
```

## List cues with details

See a numbered breakdown of every cue — speaker, duration, and a preview of the text:

```sh
cue list my-transcript.ts
# ✓ my-transcript.ts "My Talk" — 12 cues, speakers: main, side
#   1. [main] (3000ms) Welcome to the show! Today we are going to explore...
#   2. [side] (4000ms) Thanks for having me! I am excited to share...
#   ...
#   Total: 45000ms timed, 2 manual cues

cue list --wpm 180 my-transcript.ts   # show estimated durations for manual cues

cue list --json my-transcript.ts      # machine-readable JSON output
```

When cues have `section` tags, `cue list` groups output by section with per-group subtotals:

```sh
cue list sections.ts
# ✓ sections.ts "Demo" — 6 cues, speakers: main, side
#
# # Intro
#   1. [main] (3000ms) #welcome notes Hello and welcome to the show!
#   2. [side] (—) say:BUN Today we are looking at Bun and Svelte.
#   — section: 3000ms timed, 1 manual cue
#
# # Main
#   3. [main] (4000ms) #idea The first idea is simple...
#   — section: 4000ms timed, 0 manual cues
#
# Total: 7000ms timed, 1 manual cue
```

Inline tags appear next to each cue row: `#id`, `say:text`, and a `notes` marker. These are purely informational — they help you confirm your cue metadata is correct.

## Initialize config

Create a starter config file:

```sh
cue init
# Creates ./.cue/cue.ts

cue init --path ~/.config/cue/cue.ts
# Creates global config
```

Edit the config to customize theme, speakers, and defaults:

```ts
import { defineConfig } from '@mdrv/cue'

export default defineConfig({
	fontSize: 56,
	anchor: 'top',
	focusStyle: 'opacity',
	markdown: true,
	theme: {
		background: '#1a1a2e',
		focus: '#eaeaea',
		dim: '#555555',
		fade: '#333344',
		accent: '#00d4aa',
	},
})
```

## Common flag combinations

```sh
cue --no-open --port 3000 transcript.ts   # custom port, no browser
cue --debug transcript.ts                  # verbose logging
cue --duet --estimate transcript.ts         # duet + auto-durations
```
