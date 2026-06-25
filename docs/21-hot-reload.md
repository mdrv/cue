```yaml
mid: cue-hot-reload
label: "21 — Hot Reload"
description: File watching, SSE endpoint, live editing workflow
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
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
3. After debounce, the transcript is re-loaded, re-validated, and re-estimated.
4. A `reload` event is published to the `ReloadHub`.
5. The frontend SSE connection receives the event.
6. The frontend re-fetches `/api/transcript` and re-renders.

## SSE endpoint

`GET /events` returns a `text/event-stream` response:

```
event: hello
data: {"version":"0.0.1"}

event: reload
data: {}

: keepalive-ping
```

- `hello` — sent on connection, confirms the stream is live.
- `reload` — sent when the transcript file changes.
- `keepalive-ping` — sent every 15 seconds to keep the connection alive.

## Frontend SSE client

The frontend connects to `/events` on page load. On receiving a `reload` event, it fetches `/api/transcript` to get the updated data and re-initializes the prompter state. On disconnect, it reconnects after a 1-second delay.

## Debounce rationale

150ms debounce prevents rapid-fire reloads when editors write temporary files (e.g., Vim swap files, VS Code save-on-type). Most editors complete a save in under 100ms, so 150ms catches the final write.

## Disabling hot-reload

Hot-reload is always active when the server is running. There is no flag to disable it. If you want a static server, use any static file server instead.
