```yaml
mid: cue-cli-surface
label: "05 — CLI Surface"
description: cue commands, flags, exit codes, output formats
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  cli: 300
  commands: 200
tags: [foundation, cli, commands]
tags_excluded: []
```

## Commands

### `cue <file>` (root)

Starts the prompter server for the given transcript file.

```sh
cue transcript.ts
cue --port 8080 transcript.ts
cue --duet --estimate transcript.ts
```

### `cue check <file>`

Validates a transcript file without starting the server. Prints cue count, speakers, and duration summary.

```sh
cue check transcript.ts
cue check --json transcript.ts
```

### `cue list <file>` (v0.0.2)

Prints a numbered, per-cue breakdown of a transcript — richer than `check`. Each row shows the speaker, duration (or `~Xms` estimate with `--wpm`), inline tags (`#id`, `say:`, `notes`), and a 80-char preview of the cue text. As of v0.0.3, output is **grouped by section**: a `# Section` header introduces each group, followed by its cues and a `— section:` subtotal line.

```sh
cue list transcript.ts
cue list --json transcript.ts
cue list --wpm 180 transcript.ts
```

Plain output example (v0.0.3):

```
✓ demo.ts "Cue Demo" — 6 cues, speakers: main, side

# Intro
  1. [main] (3000ms) #welcome notes Hello and welcome to the show!
  2. [side] (—) say:BUN Today we are looking at Bun and Svelte.
  — section: 3000ms timed, 1 manual cue

# Main
  3. [main] (4000ms) #idea The first idea is simple...
  — section: 4000ms timed, 0 manual cues

Total: 7000ms timed, 1 manual cue
```

When the transcript has no sections, no group headers are printed and output matches the v0.0.2 flat format.

### `cue init`

Creates a sample config file at `./.cue/cue.ts` (or `--path`).

```sh
cue init
cue init --force
cue init --path ~/.config/cue/cue.ts
```

## Global flags (inherited by all commands)

| Flag       | Short | Type    | Description                  |
| ---------- | ----- | ------- | ---------------------------- |
| `--debug`  | `-d`  | boolean | Verbose (debug) logging      |
| `--json`   | `-j`  | boolean | Machine-readable JSON output |
| `--config` | —     | string  | Path to cue.ts config file   |

## Root-only flags

| Flag         | Short | Type    | Description                                          |
| ------------ | ----- | ------- | ---------------------------------------------------- |
| `--port`     | `-p`  | number  | Server port (0 = pick free)                          |
| `--open`     | —     | boolean | Open browser (default true, negate with `--no-open`) |
| `--duet`     | —     | boolean | Force dual-column layout                             |
| `--wpm`      | —     | number  | Words-per-minute for estimation                      |
| `--estimate` | —     | boolean | Auto-fill missing durations                          |

## Subcommand-only flags

### `cue init`

| Flag      | Description                    |
| --------- | ------------------------------ |
| `--force` | Overwrite existing config file |
| `--path`  | Custom output path             |

### `cue list`

| Flag    | Type   | Description                                           |
| ------- | ------ | ----------------------------------------------------- |
| `--wpm` | number | Show `~Xms` estimates for cues that lack a `duration` |

## Exit codes

| Code | Meaning                       |
| ---- | ----------------------------- |
| `0`  | Success                       |
| `1`  | Error (CueError or unhandled) |

## Output format

When `--json` is set, `check` emits structured JSON:

```json
{
	"valid": true,
	"cues": 6,
	"speakers": ["main", "side"],
	"totalDuration": 15000
}
```

`list --json` emits a deeper structure (v0.0.3 adds per-cue `section`, `notes`, `id`, `say`, plus a top-level `sections` array):

```json
{
	"ok": true,
	"file": "transcript.ts",
	"meta": { "title": "Episode 1", "wpm": 160, "duet": true },
	"cues": [
		{
			"index": 1,
			"text": "...",
			"speaker": "main",
			"section": "Intro",
			"duration": 3000,
			"id": "welcome",
			"notes": "..."
		},
		{
			"index": 2,
			"text": "...",
			"speaker": "side",
			"section": "Intro",
			"say": "BUN"
		}
	],
	"sections": [
		{
			"name": "Intro",
			"start": 1,
			"end": 2,
			"count": 2,
			"speakers": ["main", "side"],
			"totalDuration": 3000
		}
	],
	"summary": {
		"count": 6,
		"speakers": ["main", "side"],
		"totalDuration": 13500,
		"timedCount": 4,
		"manualCount": 2
	}
}
```

Without `--json`, output is human-readable plain text.

## Error output (v0.0.2)

`CueError`s are formatted uniformly by the CLI:

```
cue: Invalid transcript in /path/to/file.ts
  - cue #2 "has bad duration" — duration: cue.duration must be a positive integer (ms)
  - cue #3 — text: cue.text must be a non-empty string
  file: /path/to/file.ts
```

Each Zod issue becomes a `- cue #N "<preview>" — <field>: <message>` line. Non-cue paths fall back to `- <path>: <message>`. Other context fields (e.g. `file`, `hint`) are printed as `key: value` lines.

All errors exit with code `1`.
