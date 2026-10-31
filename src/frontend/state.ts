import type { Cue, Speaker } from '../transcript/types.ts'
import type { ClientData } from './types.ts'

export interface SectionBoundary {
	index: number
	section: string | null
}

export interface AppState {
	data: ClientData
	cues: readonly Cue[]
	total: number
	index: number
	playing: boolean
	light: boolean
	font: number
	col: number
	notesVisible: boolean
	timer: ReturnType<typeof setTimeout> | null
	boundaries: SectionBoundary[]
	hasSections: boolean
}

const DEFAULT_THEME = { background: '#0b0d12', focus: '#f5f7fb', dim: '#6b7280', fade: '#2b313b', accent: '#7dd3fc' }

export const state: AppState = {
	data: {
		transcript: { meta: {}, cues: [] },
		config: {
			duet: false,
			fontSize: 48,
			markdown: true,
			anchor: 'center',
			flow: 'vertical',
			reverse: false,
			lookBehind: 1,
			lookAhead: 2,
			chrome: 'top',
			contentWidth: 0,
			focusStyle: 'opacity',
			theme: DEFAULT_THEME,
			lightTheme: DEFAULT_THEME,
			speakers: { main: { column: 'left' }, side: { column: 'right' } },
		},
	},
	cues: [],
	total: 0,
	index: 0,
	playing: false,
	light: false,
	font: 48,
	col: 0,
	notesVisible: false,
	timer: null,
	boundaries: [],
	hasSections: false,
}

let storagePrefix = 'cue:default'

export function loadNum(key: string, fallback: number): number {
	try {
		const v = localStorage.getItem(storagePrefix + ':' + key)
		if (v === null) return fallback
		const n = Number(v)
		return Number.isFinite(n) && n > 0 ? n : fallback
	} catch {
		return fallback
	}
}

export function saveNum(key: string, value: number): void {
	try {
		localStorage.setItem(storagePrefix + ':' + key, String(value))
	} catch {}
}

export function loadBool(key: string, fallback: boolean): boolean {
	try {
		const v = localStorage.getItem(storagePrefix + ':' + key)
		if (v === null) return fallback
		return v === '1'
	} catch {
		return fallback
	}
}

export function saveBool(key: string, value: boolean): void {
	try {
		localStorage.setItem(storagePrefix + ':' + key, value ? '1' : '0')
	} catch {}
}

export function initState(data: ClientData): void {
	state.data = data
	state.cues = data.transcript.cues
	state.total = data.transcript.cues.length
	storagePrefix = 'cue:' + (data.transcript.meta.title ? encodeURIComponent(data.transcript.meta.title) : 'default')
	state.light = loadBool('light', false)
	state.font = loadNum('font', data.config.fontSize || 48)
	state.col = loadNum('col', data.config.contentWidth || 0)
	state.notesVisible = loadBool('notes', false)
	refreshBoundaries()
}

export function refreshBoundaries(): void {
	const out: SectionBoundary[] = []
	let last: string | null = null
	for (let i = 0; i < state.total; i++) {
		const s = state.cues[i]?.section || null
		if (s !== last) {
			out.push({ index: i, section: s })
			last = s
		}
	}
	state.boundaries = out
	state.hasSections = out.some((b) => b.section !== null)
}

export function duet(): boolean {
	return Boolean(state.data.config.duet || state.data.transcript.meta.duet)
}

export function columnOf(sp: Speaker): string {
	const s = state.data.config.speakers[sp]
	if (s && s.column) return s.column
	if (sp === 'side') return 'right'
	return 'left'
}

export function colorOf(sp: Speaker): string | null {
	return state.data.config.speakers[sp]?.color || null
}

export function sectionOf(i: number): string | null {
	return i >= 0 && i < state.total ? state.cues[i]?.section || null : null
}

export function currentBoundary(at: number): SectionBoundary | null {
	let cur: SectionBoundary | null = null
	for (const b of state.boundaries) {
		if (b.index <= at) cur = b
		else break
	}
	return cur
}

export function sectionRange(name: string): { start: number; end: number } | null {
	for (let i = 0; i < state.boundaries.length; i++) {
		const b = state.boundaries[i]
		if (b && b.section === name) {
			const next = state.boundaries[i + 1]
			const start = b.index
			const end = next ? next.index : state.total
			return { start, end }
		}
	}
	return null
}

export function findById(id: string): number {
	for (let i = 0; i < state.total; i++) if (state.cues[i]?.id === id) return i
	return -1
}
