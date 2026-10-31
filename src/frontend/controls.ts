import { dom } from './dom.ts'
import { css } from './layout.ts'
import { advance, prev, render, renderNotes, restart, scheduleAuto, togglePlay } from './render.ts'
import { currentBoundary, saveBool, saveNum, state } from './state.ts'

export function jumpSection(dir: number): void {
	if (!state.hasSections) return
	const cur = currentBoundary(state.index)
	const curIdx = cur ? state.boundaries.indexOf(cur) : -1
	const next = state.boundaries[curIdx + dir]
	if (!next) return
	state.index = Math.max(0, Math.min(state.total - 1, next.index))
	render()
	scheduleAuto()
}

export function toggleNotes(): void {
	state.notesVisible = !state.notesVisible
	saveBool('notes', state.notesVisible)
	renderNotes()
}

function toggleTheme(): void {
	state.light = !state.light
	saveBool('light', state.light)
	css()
}

function toggleFullscreen(): void {
	if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.()
	else void document.exitFullscreen?.()
}

function onKey(e: KeyboardEvent): void {
	const k = e.key
	if (k === ' ' || k === 'ArrowRight' || k === 'Enter') {
		e.preventDefault()
		advance()
	} else if (k === 'ArrowLeft' || k === 'Backspace') {
		e.preventDefault()
		prev()
	} else if (k === ']') {
		e.preventDefault()
		jumpSection(1)
	} else if (k === '[') {
		e.preventDefault()
		jumpSection(-1)
	} else if (k === 'n' || k === 'N') {
		toggleNotes()
	} else if (k === 'p' || k === 'P') {
		togglePlay()
	} else if (k === 'r' || k === 'R') {
		restart()
	} else if (k === 'f' || k === 'F') {
		toggleFullscreen()
	} else if (k === '+' || k === '=') {
		state.font = Math.min(160, state.font + 4)
		saveNum('font', state.font)
		render()
	} else if (k === '-' || k === '_') {
		state.font = Math.max(16, state.font - 4)
		saveNum('font', state.font)
		render()
	} else if (k === '?') {
		dom.help.classList.toggle('hidden')
	} else if (k === 't' || k === 'T') {
		toggleTheme()
	} else if (k === 'Escape') {
		dom.help.classList.add('hidden')
	}
}

function runCommand(cmd: string | undefined): void {
	if (cmd === 'prev') prev()
	else if (cmd === 'next') advance()
	else if (cmd === 'toggle') togglePlay()
	else if (cmd === 'restart') restart()
	else if (cmd === 'secprev') jumpSection(-1)
	else if (cmd === 'secnext') jumpSection(1)
	else if (cmd === 'fontdown') {
		state.font = Math.max(16, state.font - 4)
		saveNum('font', state.font)
		render()
	} else if (cmd === 'fontup') {
		state.font = Math.min(160, state.font + 4)
		saveNum('font', state.font)
		render()
	} else if (cmd === 'colwidthdown') {
		const cur = document.querySelector<HTMLElement>('.column.standalone, .solo')?.offsetWidth || 960
		state.col = Math.max(320, Math.round(cur * 0.8))
		saveNum('col', state.col)
		css()
	} else if (cmd === 'colwidthup') {
		const cur = document.querySelector<HTMLElement>('.column.standalone, .solo')?.offsetWidth || 960
		state.col = Math.min(4000, Math.round(cur * 1.25))
		saveNum('col', state.col)
		css()
	} else if (cmd === 'notes') toggleNotes()
	else if (cmd === 'theme') toggleTheme()
	else if (cmd === 'full') toggleFullscreen()
	else if (cmd === 'close') document.body.classList.remove('controls-open')
}

export function bindControls(): void {
	document.addEventListener('keydown', onKey)
	dom.stage.addEventListener('click', (e) => {
		if (e.clientX < window.innerWidth * 0.2) prev()
		else advance()
	})
	dom.hint.addEventListener('click', (e) => {
		e.stopPropagation()
		document.body.classList.toggle('controls-open')
	})
	document.querySelectorAll('#controls [data-cmd]').forEach((el) => {
		el.addEventListener('click', (e) => {
			e.stopPropagation()
			runCommand((el as HTMLElement).dataset.cmd)
		})
	})
	if (!document.documentElement.requestFullscreen) {
		document.querySelector('[data-cmd="full"]')?.remove()
	}
}
