```yaml
mid: cue-prompter-ui
label: "20 — Prompter UI"
description: Look-ahead rendering, duet layout, keyboard controls, CSS classes
time_created: 2026-06-25T12:00:00+07:00
time_updated: 2026-06-25T20:00:00+07:00
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
| `[`                     | Jump to previous section boundary (v0.0.3)  |
| `]`                     | Jump to next section boundary (v0.0.3)      |
| `N`                     | Toggle presenter notes panel (v0.0.3)       |
| `?`                     | Show help overlay                           |

## Click to advance

Clicking anywhere on the prompter area advances to the next cue (same as Space).

## Inline markdown (v0.0.2)

Cue text is rendered with an inline markdown subset (`**bold**`, `*italic*`, `` `code` ``, `[label](url)`). HTML is escaped before transforms; `javascript:`/`data:` URLs are blocked. Block-level markdown is not supported.

Disable globally via `config.markdown = false`.

## Progress bar (v0.0.2)

A thin 3px bar at the bottom of the prompter fills as you advance: `width = (index / total) * 100%`. The fill color is `--accent` with a `.2s` width transition for smooth movement.

## Persistence (v0.0.2)

Font size, theme choice, and notes visibility are saved to `localStorage` and keyed per transcript title:

- `cue:<encoded-title>:font` — number
- `cue:<encoded-title>:light` — boolean
- `cue:<encoded-title>:notes` — boolean (v0.0.3)

All three survive hot-reload and full page reloads. Browsers with `localStorage` disabled silently fall back to config defaults.

## Sections (v0.0.3)

When any cue in the transcript carries a `section` string, the prompter adds:

- **Sticky section bar** — a thin bar at the top of the stage (or bottom for `anchor: 'bottom'`) showing the current section name, a `position / total` counter (e.g. `2 / 4`), and a mini progress bar. When no sections are present, the bar is hidden entirely.
- **Section dividers** — rendered inline within each column whenever the section changes. A thin horizontal rule with the new section name in uppercase letter-spaced caps. In duet mode, each column tracks its own boundaries independently (a section change in one column does not force a divider in the other).
- **`[` / `]` keyboard shortcuts** — jump the global index to the previous or next section boundary.

The sticky bar reflects the **global** current cue's section, even in duet mode. Cues with no `section` belong to a `(no section)` group; dividers still render at transitions into or out of unsectioned cues.

## Presenter notes (v0.0.3)

Cues may carry a `notes` string. Notes are not part of the stage — they appear in a fixed-position panel at the top-right of the viewport, toggled by `N`. The panel shows the current cue's notes plus a one-line preview of the next cue that has notes. Panel visibility is persisted per transcript title (`cue:<title>:notes`).

## Pronunciation hints (v0.0.3)

Cues may carry a `say` string. It renders as small (`.45em`), dim, italic text directly above the cue text — a quick visual reminder of how to pronounce a name or term. Purely visual; no keyboard interaction.

## Cue ids and deep-linking (v0.0.3)

Cues may carry a stable `id` string. On load, the prompter parses `?id=welcome` from the URL and jumps to the first cue whose `id` matches. Useful for resuming long transcripts or sharing a deep link to a specific point. Ids must be unique (duplicates fail validation).

## Focus style (v0.0.3)

The `focusStyle` config adds extra visual emphasis on top of the existing size/color gradient:

- `focusStyle: 'opacity'` (default) — no extra emphasis. Focus cue is simply the largest and brightest. Original look.
- `focusStyle: 'underline'` — adds a 3px `--accent` bottom border under the focus cue.
- `focusStyle: 'box'` — wraps the focus cue in a 2px `--accent` border with rounded corners.

The style is additive — it does not change size, color, or opacity, only adds an extra emphasis layer to the focus cue.

## Speaker color border (v0.0.3)

Every cue carries a left-edge color derived from its speaker's `SpeakerConfig.color` (falling back to a default). The colored edge renders as an inset box-shadow on the cue's left side, visible on all cues — not just focus. This gives a constant visual cue for which speaker is talking without needing to read the speaker tag.

## Bootstrap

## Responsive behavior

The prompter is designed for desktop browser use. The layout fills the viewport width. Font size is configurable via `+`/`-` keys or the config `fontSize` setting.

## No framework

The entire prompter is vanilla JavaScript (`app.js`) with no dependencies. It runs directly in the browser with no build step, no imports, no framework.
