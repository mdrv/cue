import { state } from './state.ts'

export type PinV = 'top' | 'center' | 'bottom'
export type PinH = 'left' | 'center' | 'right'

export function pinParts(): { v: PinV; h: PinH } {
	const parts = String(state.data.config.anchor || 'center').split('-')
	let v: PinV = 'center'
	let h: PinH = 'center'
	for (const p of parts) {
		if (p === 'top' || p === 'bottom') v = p
		else if (p === 'left' || p === 'right') h = p
	}
	return { v, h }
}

export function applyLayout(): void {
	const { v, h } = pinParts()
	const flow = !state.data.config.duet && state.data.config.flow === 'horizontal' ? 'horizontal' : 'vertical'
	const b = document.body.classList
	b.toggle('flow-h', flow === 'horizontal')
	b.toggle('reverse', Boolean(state.data.config.reverse) && !state.data.config.duet)
	b.toggle('pin-v-top', v === 'top')
	b.toggle('pin-v-bottom', v === 'bottom')
	b.toggle('pin-h-left', flow === 'vertical' && h === 'left')
	b.toggle('pin-h-right', flow === 'vertical' && h === 'right')
	b.toggle('chrome-bottom', state.data.config.chrome === 'bottom')
}

export function css(): void {
	const t = state.light ? state.data.config.lightTheme : state.data.config.theme
	const root = document.documentElement.style
	root.setProperty('--bg', t.background)
	root.setProperty('--focus', t.focus)
	root.setProperty('--dim', t.dim)
	root.setProperty('--fade', t.fade)
	root.setProperty('--accent', t.accent)
	root.setProperty('--font', state.font + 'px')
	root.setProperty('--col', state.col > 0 ? state.col + 'px' : '60ch')
}
