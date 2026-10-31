import { escapeHtml, renderText } from './inlineMarkdown.ts'
import { colorOf, columnOf, sectionOf, state } from './state.ts'
import type { CueRole } from './types.ts'

function subsetFor(column: string): number[] {
	const out: number[] = []
	for (let i = 0; i < state.total; i++) {
		const c = state.cues[i]
		if (c && columnOf(c.speaker || 'main') === column) out.push(i)
	}
	return out
}

function activeIn(subset: number[]): number {
	let k = -1
	for (let j = 0; j < subset.length; j++) {
		const idx = subset[j]
		if (idx !== undefined && idx <= state.index) k = j
	}
	return k
}

export function cueEl(i: number, role: CueRole, column?: string): HTMLElement {
	const cue = state.cues[i]
	const config = state.data.config
	const el = document.createElement('div')
	let cls = 'cue ' + role
	if (role === 'focus' && (config.focusStyle === 'underline' || config.focusStyle === 'box')) {
		cls += ' ' + config.focusStyle
	}
	el.className = cls
	el.dataset.index = String(i)
	if (cue) {
		const color = colorOf(cue.speaker || 'main')
		if (color) el.style.setProperty('--speaker', color)
		let html = ''
		if (cue.say) html += `<span class="say">${escapeHtml(cue.say)}</span>`
		html += renderText(cue.text, config.markdown)
		el.innerHTML = html
		if (role === 'focus' && i === state.index && state.playing && (cue.duration ?? 0) > 0) {
			const timer = document.createElement('span')
			timer.className = 'cuetimer'
			timer.dataset.duration = String(cue.duration)
			el.appendChild(timer)
		}
	}
	if (column) el.dataset.column = column
	return el
}

export function dividerEl(name?: string): HTMLElement {
	const el = document.createElement('div')
	el.className = 'divider'
	el.textContent = name || '—'
	return el
}

export function renderColumn(column: string): HTMLElement {
	const subset = subsetFor(column)
	const active = activeIn(subset)
	const config = state.data.config
	const wrap = document.createElement('div')
	wrap.className = 'column'
	const startJ = Math.max(0, active - Math.max(0, config.lookBehind ?? 1))
	let lastSection = startJ > 0 ? sectionOf(subset[startJ - 1] ?? -1) : null
	for (let j = startJ; j < subset.length; j++) {
		const off = j - active
		if (off > (config.lookAhead ?? 2)) break
		const i = subset[j]
		if (i === undefined) break
		const sec = sectionOf(i)
		if (sec !== lastSection) wrap.appendChild(dividerEl(sec || ''))
		lastSection = sec
		let role: CueRole
		if (off === 0) role = active >= 0 && i <= state.index ? 'focus' : 'next'
		else if (off < 0) role = 'prev'
		else if (off === 1) role = 'next'
		else role = 'next2'
		wrap.appendChild(cueEl(i, role, column))
	}
	if (active < 0) wrap.classList.add('standby')
	return wrap
}

export function renderSolo(): HTMLElement {
	const config = state.data.config
	const wrap = document.createElement('div')
	wrap.className = 'column solo'
	const frag = document.createDocumentFragment()
	const startJ = Math.max(0, state.index - Math.max(0, config.lookBehind ?? 1))
	let lastSection = startJ > 0 ? sectionOf(startJ - 1) : null
	for (let j = startJ; j < state.total; j++) {
		const off = j - state.index
		if (off > (config.lookAhead ?? 2)) break
		const sec = sectionOf(j)
		if (sec !== lastSection) frag.appendChild(dividerEl(sec || ''))
		lastSection = sec
		let role: CueRole
		if (off === 0) role = 'focus'
		else if (off < 0) role = 'prev'
		else if (off === 1) role = 'next'
		else role = 'next2'
		frag.appendChild(cueEl(j, role))
	}
	if (!document.body.classList.contains('flow-h')) {
		const kids = Array.from(frag.children)
		for (let k = kids.length - 1; k >= 0; k--) {
			const kid = kids[k]
			if (kid) wrap.appendChild(kid)
		}
	} else {
		wrap.appendChild(frag)
	}
	return wrap
}
