```yaml
mid: cue-http-server
label: "30 — HTTP Server"
description: Bun.serve routes, JSON API, SSE endpoint, browser launch
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T12:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  server: 300
  http: 200
  api: 200
tags: [server, http, api, routes]
tags_excluded: []
```

## Routes

| Method | Path              | Content-Type        | Description                                       |
| ------ | ----------------- | ------------------- | ------------------------------------------------- |
| `GET`  | `/`               | `text/html`         | Full prompter page (inline CSS+JS+bootstrap JSON) |
| `GET`  | `/api/transcript` | `application/json`  | Transcript data (cues, meta, speakers)            |
| `GET`  | `/events`         | `text/event-stream` | SSE stream for hot-reload                         |

## `GET /`

Returns the complete prompter page as a single HTML document. The HTML includes:

- Inline `<style>` with all CSS
- Inline `<script>` with `window.__CUE__` bootstrap data (JSON)
- `<script>` tag loading `app.js` (the browser-side prompter logic)

The `app.js` content is read from disk at serve time via `Bun.file`. This means server restart picks up frontend changes.

## `GET /api/transcript`

Returns the validated transcript as JSON:

```json
{
	"meta": { "title": "Episode 1", "wpm": 160, "duet": true },
	"cues": [
		{ "text": "Hello!", "duration": 2000, "speaker": "main" },
		{ "text": "Hi there.", "duration": 3000, "speaker": "side" }
	]
}
```

This endpoint is called by the frontend SSE client on reload events.

## `GET /events`

Server-Sent Events stream. See [21 — Hot Reload](./21-hot-reload.md) for protocol details.

## Browser launch

When `config.open` is true (default), Cue opens the default browser to the server URL using a cross-platform command:

- macOS: `open <url>`
- Linux: `xdg-open <url>`
- Windows: `start <url>`

This can be suppressed with `--no-open`.

## Port selection

Default port is `0` (OS assigns a free port). The actual URL is printed to stdout. Use `--port` to specify a fixed port.

## Graceful shutdown

`Ctrl+C` (SIGINT) triggers a clean shutdown: the HTTP server stops, the file watcher closes, and the process exits with code 0.
