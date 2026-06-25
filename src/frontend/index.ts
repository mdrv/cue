import type { CueConfig } from '../config/types.ts'
import type { Transcript } from '../transcript/types.ts'

const appUrl = new URL('./app.js', import.meta.url)
const APP_JS = await Bun.file(appUrl).text()

export interface ClientConfig {
	duet: boolean
	fontSize: number
	theme: CueConfig['theme']
	lightTheme: CueConfig['theme']
	speakers: CueConfig['speakers']
}

export interface ClientData {
	transcript: {
		meta: Transcript['meta']
		cues: Transcript['cues']
	}
	config: ClientConfig
}

export function renderPage(transcript: Transcript, config: CueConfig): string {
	const data: ClientData = {
		transcript: { meta: transcript.meta, cues: transcript.cues },
		config: {
			duet: config.duet || (transcript.meta.duet ?? false),
			fontSize: config.fontSize,
			theme: config.theme,
			lightTheme: config.lightTheme,
			speakers: config.speakers,
		},
	}
	const bootstrap = JSON.stringify(data).replace(/</g, '\\u003c')
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>cue</title>
<style>
  :root {
    --bg: #0b0d12; --focus: #f5f7fb; --dim: #6b7280; --fade: #2b313b; --accent: #7dd3fc;
    --font: 48px;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: var(--bg); color: var(--focus);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column; overflow: hidden;
  }
  #bar {
    display: flex; align-items: center; gap: 1rem; padding: .6rem 1rem;
    border-bottom: 1px solid var(--fade); font-size: .85rem; color: var(--dim);
    flex: 0 0 auto; user-select: none;
  }
  #title { font-weight: 600; color: var(--focus); }
  #bar .grow { flex: 1 1 auto; }
  #progress { font-variant-numeric: tabular-nums; }
  .state { padding: .1rem .5rem; border-radius: .3rem; border: 1px solid var(--fade); }
  .state.playing { color: var(--accent); border-color: var(--accent); }
  .state.paused { color: var(--dim); }
  .state.done { color: var(--focus); }
  #stage { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; display: flex; gap: 2rem; padding: 2rem; align-items: flex-start; }
  .column { flex: 1 1 0; display: flex; flex-direction: column; gap: 1.2rem; min-width: 0; }
  .column.standalone, .solo { max-width: 60ch; margin: 0 auto; width: 100%; }
  .cue { line-height: 1.35; transition: opacity .25s ease, color .25s ease, font-size .15s ease; }
  .cue.focus { font-size: var(--font); color: var(--focus); font-weight: 600; }
  .cue.focus[style*="--speaker"] { box-shadow: inset .25rem 0 0 var(--speaker); padding-left: .75rem; }
  .cue.next  { font-size: calc(var(--font) * .62); color: var(--dim); }
  .cue.next2 { font-size: calc(var(--font) * .5); color: var(--fade); }
  .cue.prev  { font-size: calc(var(--font) * .5); color: var(--fade); font-style: italic; }
  .fin { margin: auto; color: var(--dim); font-size: calc(var(--font) * .8); }
  #help {
    position: fixed; right: 1rem; bottom: 1rem; background: var(--bg); border: 1px solid var(--fade);
    border-radius: .5rem; padding: .75rem 1rem; font-size: .8rem; color: var(--dim); line-height: 1.7;
  }
  #help.hidden { display: none; }
  #help b { color: var(--focus); }
  kbd { background: var(--fade); border-radius: .25rem; padding: 0 .35rem; color: var(--focus); }
  #hint { font-size: .75rem; color: var(--fade); }
</style>
</head>
<body>
  <div id="bar">
    <span id="title">cue</span>
    <span class="grow"></span>
    <span id="progress">0 / 0</span>
    <span id="state" class="state paused">paused</span>
    <span id="hint">press <kbd>?</kbd> for keys</span>
  </div>
  <div id="stage"></div>
  <div id="help" class="hidden">
    <b>keys</b><br/>
    <kbd>space</kbd>/<kbd>→</kbd> next cue<br/>
    <kbd>←</kbd> previous cue<br/>
    <kbd>p</kbd> play / pause auto-advance<br/>
    <kbd>r</kbd> restart<br/>
    <kbd>f</kbd> fullscreen<br/>
    <kbd>+</kbd>/<kbd>−</kbd> font size<br/>
    <kbd>t</kbd> toggle dark / light
    <kbd>?</kbd> toggle this help
  </div>
  <script>window.__CUE__ = ${bootstrap};</script>
  <script>${APP_JS}</script>
</body>
</html>`
}
