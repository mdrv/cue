```yaml
mid: cue-hot-reload
label: "21 — Hot Reload"
description: File watching, SSE endpoint, live editing workflow
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T18:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  hot-reload: 300
  sse: 200
tags: [server, hot-reload, sse]
tags_excluded: []
```

## How it works

Cue watches the transcript file for changes using `Bun.watch`. When a change is detected:

1. The watcher fires with the file path.
2. A 150ms debounce timer starts. If another change arrives within 150ms, the timer resets.
3. After debounce:
   - For transcript edits — the transcript is re-loaded, re-validated, and re-estimated. A `reload` event with `{ meta, cues }` is published.
   - For config edits (v0.0.2) — the config is re-loaded via the same flag-merge path used at startup. A `reload` event with `{ config }` is published.
4. The frontend SSE connection receives the `reload` event.
5. The frontend applies the patch (`Object.assign`) without a re-fetch for config changes, or re-fetches `/api/transcript` for transcript changes.

Both watchers share the same 150ms debounce pattern and are tracked in a single `watchers` array on the server.

## SSE endpoint

`GET /events` returns a `text/event-stream` response:

```
event: hello
data: {"version":"0.0.2"}

event: reload
data: {}

: keepalive-ping
```

- `hello` — sent on connection, confirms the stream is live.
- `reload` — sent when the transcript or config file changes. The `data` payload indicates which changed: `{ meta, cues }` for transcript, `{ config }` for config.
- `keepalive-ping` — sent every 15 seconds to keep the connection alive.

## Frontend SSE client

The frontend connects to `/events` on page load. On receiving a `reload` event, it inspects the payload: if `data.config` is present it patches the in-memory config via `Object.assign` and re-renders (no re-fetch); otherwise it fetches `/api/transcript` and re-initializes the prompter state. On disconnect, it reconnects after a 1-second delay.

## Debounce rationale

150ms debounce prevents rapid-fire reloads when editors write temporary files (e.g., Vim swap files, VS Code save-on-type). Most editors complete a save in under 100ms, so 150ms catches the final write.

Hot-reload is always active for the transcript when the server is running. Config hot-reload (v0.0.2) only activates when Cue successfully resolved a config file at startup — if Cue fell back to `DEFAULT_CONFIG`, there is no config file to watch.

If you want a static server with no hot-reload, use any static file server instead.
