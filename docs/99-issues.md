```yaml
mid: cue-issues
label: "99 — Known Issues & Limitations"
description: Open bugs, deferred features, design scope cuts
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T18:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  issues: 300
  limitations: 200
tags: [quality, issues, limitations]
tags_excluded: []
```

## Known issues

### BUG-001: Hot-reload re-fetch race

If the transcript file is edited rapidly (under 150ms debounce), the SSE reload event fires once but the `/api/transcript` fetch may return stale data from the previous write. Workaround: pause editing for 200ms before checking the result.

### BUG-002: Frontend font size not persisted (fixed in v0.0.2)

Fixed: font size and theme choice now persist to `localStorage` keyed per transcript title (`cue:<title>:font`, `cue:<title>:light`). See [v0.0.2 release notes](./releases/v0.0.2.md).

### BUG-003: SSE reconnection on Firefox

Firefox's EventSource does not support `reconnectInterval` natively. The built-in 1-second reconnect delay may cause flicker on network hiccups.

### BUG-004: Markdown link regex truncates URLs with literal `)` (v0.0.2)

The inline link regex uses `[^)\s]+` for the URL, so URLs containing `)` are truncated at the first close-paren. Workaround: percent-encode `)` as `%29`.

### BUG-005: Markdown rendering is inline-only (v0.0.2)

The renderer supports `**bold**`, `*italic*`, `` `code` ``, and `[label](url)` but no block-level constructs (headings, lists, blockquotes). Block-level support is deferred to v0.1.0.

### BUG-006: `cue list --json` omits estimates without `--wpm` (v0.0.2)

Cues without a `duration` only show an `estimated` field when `--wpm` is passed. Without it they appear un-timed in the JSON output.

## Limitations

### Markdown is inline-only

Cue renders `**bold**`, `*italic*`, `` `code` ``, and `[label](url)` in cue text. Block-level markdown (headings, lists, blockquotes) is not supported — see v0.1.0 roadmap.

### Desktop only

The prompter is designed for desktop browsers. There is no mobile-responsive layout. On narrow viewports, cues may overflow or be clipped.

### Single user

One browser tab, one user. No multi-user sync, no shared state, no collaboration features.

### No recording

Cue does not record audio or video. Pair with OBS, QuickTime, or similar for recording sessions.

### No undo/redo

The prompter has no undo stack. `←` goes back one cue; `R` restarts from the beginning.

### Config hot-reload requires a resolved file

Editing the resolved config file triggers hot-reload. If Cue fell back to `DEFAULT_CONFIG` (no `--config`, no `./.cue/cue.ts`, no `~/.config/cue/cue.ts`), there is no file to watch.
