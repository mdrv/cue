import { dom } from './dom.ts'
import { applyLayout, css, pinParts } from './layout.ts'
import { dividerEl, renderColumn, renderSolo } from './renderWindow.ts'
import { currentBoundary, duet, refreshBoundaries, sectionRange, state } from './state.ts'
import { syncRemote } from './sync.ts'
import type { ReloadData } from './types.ts'

export function renderSectionbar(): void {
	if (!state.hasSections) {
		dom.sectionbar.classList.remove('visible')
		return
	}
	dom.sectionbar.classList.add('visible')
	const cur = currentBoundary(state.index)
	const name = cur && cur.section ? cur.section : ''
	dom.sectionLabel.textContent = name || '—'
	if (name) {
		const range = sectionRange(name)
		if (range) {
			const pos = Math.max(0, Math.min(range.end - 1, state.index)) - range.start + 1
			const totalInSec = range.end - range.start
			dom.sectionCount.textContent = `${pos} / ${totalInSec}`
			dom.sectionMini.style.width = `${(pos / totalInSec) * 100}%`
		} else {
			dom.sectionCount.textContent = ''
			dom.sectionMini.style.width = '0%'
		}
	} else {
		dom.sectionCount.textContent = ''
		dom.sectionMini.style.width = '0%'
	}
}

export function renderNotes(): void {
	dom.notes.classList.toggle('visible', state.notesVisible)
	if (!state.notesVisible) return
	const cur = state.cues[state.index]
	dom.notesBody.textContent = cur && cur.notes ? cur.notes : '(no notes for this cue)'
	let upcomingText = ''
	for (let i = state.index + 1; i < state.total; i++) {
		const c = state.cues[i]
		if (c?.notes) {
			upcomingText = `next: ${c.notes}`
			break
		}
	}
	dom.notesUpcoming.textContent = upcomingText
	dom.notesUpcoming.classList.toggle('hidden', !upcomingText)
}

export function render(): void {
	css()
	dom.stage.innerHTML = ''
	if (state.index >= state.total) {
		const fin = document.createElement('div')
		fin.className = 'fin'
		fin.textContent = '— end —'
		dom.stage.appendChild(fin)
	} else if (duet()) {
		dom.stage.appendChild(renderColumn('left'))
		dom.stage.appendChild(renderColumn('right'))
	} else {
		dom.stage.appendChild(renderSolo())
	}
	const t = dom.stage.querySelector<HTMLElement>('.cuetimer')
	if (t) {
		void t.offsetWidth
		t.style.transition = `width ${Number(t.dataset.duration || 0)}ms linear`
		t.style.width = '100%'
	}
	dom.progress.textContent = `${Math.min(state.index + 1, state.total)} / ${state.total}`
	const done = state.index >= state.total
	const label = done ? 'done' : state.playing ? 'playing' : 'paused'
	dom.stateEl.textContent = label
	dom.stateEl.className = 'state ' + label
	dom.progressFill.style.width = (state.total > 0 ? (state.index / state.total) * 100 : 0) + '%'
	renderSectionbar()
	renderNotes()
	syncRemote()
	const f = dom.stage.querySelector<HTMLElement>('.focus')
	if (f) {
		requestAnimationFrame(() => {
			const { v, h } = pinParts()
			const horizontal = document.body.classList.contains('flow-h')
			f.scrollIntoView({
				block: v === 'top' ? 'start' : v === 'bottom' ? 'end' : 'center',
				inline: horizontal ? (h === 'left' ? 'start' : h === 'right' ? 'end' : 'center') : 'nearest',
				behavior: state.playing ? 'auto' : 'smooth',
			})
		})
	}
}

export function scheduleAuto(): void {
	if (state.timer !== null) clearTimeout(state.timer)
	state.timer = null
	if (!state.playing || state.index >= state.total) return
	const d = state.cues[state.index]?.duration
	if (d && d > 0) state.timer = setTimeout(advance, d)
}

export function advance(): void {
	if (state.index < state.total) state.index++
	if (state.index >= state.total) state.playing = false
	render()
	scheduleAuto()
}

export function prev(): void {
	if (state.index > 0) state.index--
	render()
	scheduleAuto()
}

export function restart(): void {
	state.index = 0
	render()
	scheduleAuto()
}

export function togglePlay(): void {
	state.playing = !state.playing
	if (state.playing && state.index >= state.total) state.index = 0
	render()
	scheduleAuto()
}

export function applyReload(data: ReloadData | null): void {
	if (!data) return
	if (data.state) {
		if (!data.cues && !data.config && data.state.index === state.index && data.state.playing === state.playing) return
		state.index = data.state.index
		state.playing = data.state.playing
	}
	if (data.cues) {
		state.data.transcript.cues = data.cues
		if (data.meta) state.data.transcript.meta = data.meta
		state.cues = data.cues
		state.total = data.cues.length
		if (state.index > state.cues.length) state.index = state.cues.length
		refreshBoundaries()
	}
	if (data.config) {
		Object.assign(state.data.config, data.config)
		applyLayout()
	}
	render()
	scheduleAuto()
}
