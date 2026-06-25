```yaml
mid: cue-prompter-ui
label: "20 — Prompter UI"
description: Look-ahead rendering, duet layout, keyboard controls, CSS classes
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T19:00:00+07:00
scores:
  cue: 1000
  mdrv/cue: 1000
  prompter: 300
  ui: 200
  frontend: 200
tags: [frontend, prompter, ui, controls]
tags_excluded: []
```

## Rendering model

The prompter renders cues with a look-ahead focus pattern:

| Position         | CSS class | Opacity | Font size           |
| ---------------- | --------- | ------- | ------------------- |
| Current (active) | `.focus`  | 1.0     | Base (48px default) |
| Next cue         | `.next`   | 0.5     | Base                |
| Next+1 cue       | `.next2`  | 0.25    | Base                |
| Previous cue     | `.prev`   | 0.3     | Smaller             |
| Older cues       | `.past`   | 0.1     | Smaller             |

This creates a natural reading flow: current cue is bright and centered, the upcoming cue is visible but dimmed, and past cues fade out.

## Anchor — top / bottom (v0.0.2)

The `anchor` config (`'top'` default, or `'bottom'`) controls where the focus sits and which way content scrolls as you advance:

- **`'top'`** — focus is 2nd from top. Layout top-to-bottom: `[prev, focus, next, next2]`. Advancing scrolls content **up**.
- **`'bottom'`** — focus is 2nd from bottom. Layout top-to-bottom: `[next2, next, focus, prev]`. Advancing scrolls content **down**.

`'bottom'` is a true mirror: same DOM order, but each column gets a `.bottom` class that applies `flex-direction: column-reverse`. Both columns (and the standby column) get the class. Switching takes effect on next config hot-reload or server restart.

## Duet mode (dual-column)

When duet is active (via `--duet` flag, transcript meta, or config), the layout splits into two columns:

- **Left column:** cues with `speaker` mapped to `column: 'left'` (default: `main`)
- **Right column:** cues with `speaker` mapped to `column: 'right'` (default: `side`)

Each column has its own independent cue progression. Cues are ordered by their position in the transcript array, and each column renders only its own cues at the corresponding timeline position.

## Keyboard controls

| Key                     | Action                                      |
| ----------------------- | ------------------------------------------- |
| `Space` / `Enter` / `→` | Advance to next cue                         |
| `←`                     | Go back to previous cue                     |
| `P`                     | Toggle play/pause (auto-advance)            |
| `R`                     | Restart from first cue                      |
| `F`                     | Toggle fullscreen                           |
| `T`                     | Toggle dark / light theme (saved per title) |
| `+` / `=`               | Increase font size (saved per title)        |
| `-`                     | Decrease font size (saved per title)        |
| `?`                     | Show help overlay                           |

## Click to advance

Clicking anywhere on the prompter area advances to the next cue (same as Space).

## Inline markdown (v0.0.2)

Cue text is rendered with an inline markdown subset (`**bold**`, `*italic*`, `` `code` ``, `[label](url)`). HTML is escaped before transforms; `javascript:`/`data:` URLs are blocked. Block-level markdown is not supported.

Disable globally via `config.markdown = false`.

## Progress bar (v0.0.2)

A thin 3px bar at the bottom of the prompter fills as you advance: `width = (index / total) * 100%`. The fill color is `--accent` with a `.2s` width transition for smooth movement.

## Persistence (v0.0.2)

Font size and theme choice are saved to `localStorage` and keyed per transcript title:

- `cue:<encoded-title>:font` — number
- `cue:<encoded-title>:light` — boolean

Both survive hot-reload and full page reloads. Browsers with `localStorage` disabled silently fall back to config defaults.

## Bootstrap

## Responsive behavior

The prompter is designed for desktop browser use. The layout fills the viewport width. Font size is configurable via `+`/`-` keys or the config `fontSize` setting.

## No framework

The entire prompter is vanilla JavaScript (`app.js`) with no dependencies. It runs directly in the browser with no build step, no imports, no framework.
