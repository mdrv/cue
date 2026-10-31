import type { CueConfig } from '../config/types.ts'
import type { PresenterState } from '../server/present.ts'
import type { LoadedTranscript } from '../transcript/types.ts'

const remoteScript = new URL('./remoteMain.ts', import.meta.url)
const transpiler = new Bun.Transpiler({ loader: 'ts' })
const REMOTE_JS = transpiler.transformSync(await Bun.file(remoteScript).text())

function escapeHtml(input: string): string {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}

export function renderRemotePage(transcript: LoadedTranscript, config: CueConfig, present: PresenterState): string {
	const theme = config.theme
	const bootstrap = JSON.stringify({
		cues: transcript.cues,
		title: transcript.meta.title ?? '',
		state: present,
	}).replaceAll('<', '\\u003c')

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>cue remote</title>
<style>
	:root {
		--bg: ${theme.background};
		--focus: ${theme.focus};
		--dim: ${theme.dim};
		--fade: ${theme.fade};
		--accent: ${theme.accent};
		--bar: 6rem;
		--fab: 4.2rem;
	}
	* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
	html, body { height: 100%; }
	body {
		background: var(--bg);
		color: var(--focus);
		font: ${Math.max(24, Math.round(config.fontSize * 0.5))}px/1.35 system-ui, sans-serif;
		display: flex;
		flex-direction: column;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.7rem 1rem;
		border-bottom: 1px solid var(--fade);
	}
	header .title { font-size: 1rem; color: var(--dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
	header .count { font-size: 1rem; color: var(--accent); font-variant-numeric: tabular-nums; }
	header .badge { font-size: 0.8rem; color: var(--dim); border: 1px solid var(--fade); border-radius: 999px; padding: 0.15rem 0.6rem; }
	header .badge.playing { color: var(--accent); border-color: var(--accent); }
	#zones { position: fixed; left: 0; right: 0; top: 0; bottom: 0; display: flex; z-index: 5; }
	#zones .zone { flex: 1; position: relative; }
	#zones .zone:active { background: var(--fade); }
	#zones [data-act="next"] { border-left: 1px solid var(--fade); }
	#zones .chev { position: absolute; top: 50%; transform: translateY(-50%); color: var(--focus); opacity: 0.45; font-size: 4.5rem; }
	#zones [data-act="prev"] .chev { left: 1.4rem; }
	#zones [data-act="next"] .chev { right: 1.4rem; }
	body > header, #current, #next { pointer-events: none; }
	body.text-off #current, body.text-off #next { visibility: hidden; }
	body.text-off #textbtn { color: var(--dim); }
	#textbtn { font-size: 1.7rem; letter-spacing: 0.08em; }
	#current {
		padding: 0.4rem 1.2rem;
		max-height: 26vh;
		overflow: hidden;
	}
	#current .cue { color: var(--focus); }
	#current .cue .section { display: block; color: var(--accent); font-size: 0.7em; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.3em; }
	#next { padding: 0 1.2rem 0.6rem; color: var(--dim); font-size: 0.75em; max-height: 12vh; overflow: hidden; }
	#next div { opacity: 0.7; margin-top: 0.25em; }
	#bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: var(--bar);
		z-index: 6;
		display: none;
		border-top: 1px solid var(--fade);
		background: var(--bg);
	}
	body.bar-open #bar { display: flex; }
	#fab {
		position: fixed;
		left: 50%;
		bottom: calc(1.2rem + env(safe-area-inset-bottom));
		transform: translateX(-50%);
		width: var(--fab);
		height: var(--fab);
		border-radius: 50%;
		border: 1px solid var(--fade);
		background: var(--bg);
		color: var(--focus);
		font-size: 1.4rem;
		z-index: 7;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
	#fab .g { display: inline-block; transition: transform 0.15s; }
	body.bar-open #fab .g { transform: rotate(180deg); }
	#bar button {
		flex: 1;
		height: var(--bar);
		background: none;
		border: none;
		color: var(--focus);
		font-size: 2.4rem;
		padding: 0;
		padding-bottom: env(safe-area-inset-bottom);
		font-family: inherit;
	}
	#bar button:active { background: var(--fade); }
	#drawer {
		position: fixed;
		inset: 0;
		background: var(--bg);
		display: none;
		flex-direction: column;
		z-index: 10;
	}
	#drawer.open { display: flex; }
	#drawer header button {
		background: none;
		border: none;
		color: var(--accent);
		font-size: 1rem;
		padding: 0.7rem 1rem;
	}
	#list { flex: 1; overflow-y: auto; }
	#list button {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-bottom: 1px solid var(--fade);
		color: var(--dim);
		font: inherit;
		font-size: 0.85em;
		padding: 0.7rem 1rem;
	}
	#list button .n { color: var(--fade); margin-right: 0.6em; font-variant-numeric: tabular-nums; }
	#list button.cur { color: var(--accent); }
	#progress { position: fixed; left: 0; right: 0; bottom: 0; height: 3px; background: var(--fade); z-index: 6; pointer-events: none; }
	#progress div { height: 100%; width: 0; background: var(--accent); transition: width 0.2s; }
</style>
</head>
<body>
<script>window.__CUE__ = ${bootstrap}</script>
<header>
	<span class="title">${escapeHtml(transcript.meta.title ?? '')}</span>
	<span class="badge" id="badge">paused</span>
	<span class="count" id="count">1 / ${transcript.cues.length}</span>
</header>
<div id="current"></div>
<div id="next"></div>
<div id="zones">
	<div class="zone" data-act="prev"><span class="chev">&#8249;</span></div>
	<div class="zone" data-act="next"><span class="chev">&#8250;</span></div>
</div>
<div id="progress"><div id="fill"></div></div>
<div id="bar">
	<button data-act="list">&#9776;</button>
	<button data-act="toggle">&#9199;</button>
</div>
<button id="fab"><span class="g">&#9652;</span></button>
<div id="drawer">
	<header>
		<span class="title">All cues</span>
		<button data-act="text" id="textbtn">Aa</button>
		<button id="restart">Restart</button>
		<button id="close">Close</button>
	</header>
	<div id="list"></div>
</div>
<script>
${REMOTE_JS}
</script>
</body>
</html>`
}
