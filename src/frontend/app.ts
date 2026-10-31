import { bindControls } from './controls.ts'
import { dom } from './dom.ts'
import { applyLayout } from './layout.ts'
import { applyReload, render, scheduleAuto } from './render.ts'
import { findById, initState, state } from './state.ts'
import { bindSync, connect, pullState, syncRemote } from './sync.ts'
import type { ClientData } from './types.ts'

const data = (window as { __CUE__?: ClientData }).__CUE__
if (data) {
	initState(data)
	const title = data.transcript.meta.title
	dom.title.textContent = title || 'cue'
	document.title = title ? `${title} — cue` : 'cue'
	applyLayout()
	bindSync(applyReload)
	bindControls()
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') pullState()
	})
	try {
		const id = new URLSearchParams(window.location.search).get('id')
		if (id) {
			const at = findById(id)
			if (at >= 0) state.index = at
		}
	} catch {}
	render()
	syncRemote()
	scheduleAuto()
	connect()
}
