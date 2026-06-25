```yaml
mid: cue-issues
label: "99 — Known Issues & Limitations"
description: Open bugs, deferred features, design scope cuts
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
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

### BUG-002: Frontend font size not persisted

Font size changes via `+`/`-` keys are lost on hot-reload because the page re-renders from the bootstrap data. The config `fontSize` is the authoritative source.

### BUG-003: SSE reconnection on Firefox

Firefox's EventSource does not support `reconnectInterval` natively. The built-in 1-second reconnect delay may cause flicker on network hiccups.

## Limitations

### Plain text only

Cue renders cues as plain text. No markdown, no rich text, no HTML in cue content. This is a design choice — see [00 — Overview](./00-overview.md).

### Desktop only

The prompter is designed for desktop browsers. There is no mobile-responsive layout. On narrow viewports, cues may overflow or be clipped.

### Single user

One browser tab, one user. No multi-user sync, no shared state, no collaboration features.

### No recording

Cue does not record audio or video. Pair with OBS, QuickTime, or similar for recording sessions.

### No undo/redo

The prompter has no undo stack. `←` goes back one cue; `R` restarts from the beginning.

### Config requires restart

Config changes (theme, speakers, columns) require restarting the cue server. Hot-reload only applies to transcript content.
