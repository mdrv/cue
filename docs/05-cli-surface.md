```yaml
mid: cue-cli-surface
label: "05 — CLI Surface"
description: cue commands, flags, exit codes, output formats
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T18:00:00+07:00
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

Prints a numbered, per-cue breakdown of a transcript — richer than `check`. Each row shows the speaker, duration (or `~Xms` estimate with `--wpm`), and a 80-char preview of the cue text. Ends with a totals line.

```sh
cue list transcript.ts
cue list --json transcript.ts
cue list --wpm 180 transcript.ts
```

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

`list --json` emits a deeper structure:

```json
{
	"ok": true,
	"file": "transcript.ts",
	"meta": { "title": "Episode 1", "wpm": 160, "duet": true },
	"cues": [
		{ "index": 0, "text": "...", "speaker": "main", "duration": 3000 },
		{ "index": 1, "text": "...", "speaker": "side", "estimated": 1500 }
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
