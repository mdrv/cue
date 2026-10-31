export interface ThemeConfig {
	readonly background: string
	readonly focus: string
	readonly dim: string
	readonly fade: string
	readonly accent: string
}

export type Column = 'left' | 'right'
export type Anchor =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right'
export type Flow = 'vertical' | 'horizontal'
export type FocusStyle = 'opacity' | 'underline' | 'box'

export interface SpeakerConfig {
	readonly column: Column
	readonly color?: string
}

export interface CueConfig {
	readonly port: number
	readonly open: boolean
	readonly wpm: number
	readonly duet: boolean
	readonly fontSize: number
	readonly markdown: boolean
	readonly anchor: Anchor
	readonly flow: Flow
	readonly reverse: boolean
	readonly lookBehind: number
	readonly lookAhead: number
	readonly chrome: 'top' | 'bottom'
	readonly contentWidth: number
	readonly focusStyle: FocusStyle
	readonly theme: ThemeConfig
	readonly lightTheme: ThemeConfig
	readonly speakers: Record<string, SpeakerConfig>
}

export const DEFAULT_THEME: ThemeConfig = {
	background: '#0b0d12',
	focus: '#f5f7fb',
	dim: '#6b7280',
	fade: '#2b313b',
	accent: '#7dd3fc',
}
export const LIGHT_THEME: ThemeConfig = {
	background: '#f8f9fb',
	focus: '#111827',
	dim: '#6b7280',
	fade: '#d1d5db',
	accent: '#0284c7',
}

export const DEFAULT_CONFIG: CueConfig = {
	port: 0,
	open: true,
	wpm: 160,
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
	lightTheme: LIGHT_THEME,
	speakers: {
		main: { column: 'left' },
		side: { column: 'right', color: '#fca5a5' },
	},
}
