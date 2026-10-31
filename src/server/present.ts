export interface PresenterState {
	readonly index: number
	readonly playing: boolean
}

export const DEFAULT_PRESENTER: PresenterState = { index: 0, playing: false }

export type PresenterActionType = 'next' | 'prev' | 'goto' | 'play' | 'pause' | 'restart'

export interface PresenterAction {
	readonly type: PresenterActionType
	readonly index?: number
}

export function applyAction(state: PresenterState, action: PresenterAction, cueCount: number): PresenterState {
	const last = Math.max(0, cueCount)
	switch (action.type) {
		case 'next': {
			const index = Math.min(state.index + 1, last)
			return index === state.index ? state : { ...state, index }
		}
		case 'prev': {
			const index = Math.max(0, state.index - 1)
			return index === state.index ? state : { ...state, index }
		}
		case 'goto': {
			const raw = typeof action.index === 'number' ? action.index : state.index
			const index = Math.max(0, Math.min(Math.trunc(raw), last))
			return index === state.index ? state : { ...state, index }
		}
		case 'play':
			return state.playing ? state : { ...state, playing: true }
		case 'pause':
			return state.playing ? { ...state, playing: false } : state
		case 'restart':
			return state.index === 0 ? state : { ...state, index: 0 }
	}
}

export function parseAction(body: unknown): PresenterAction | undefined {
	if (typeof body !== 'object' || body === null) return undefined
	const record = body as Record<string, unknown>
	const type = record.action ?? record.type
	if (type === 'next' || type === 'prev' || type === 'play' || type === 'pause' || type === 'restart') {
		return { type }
	}
	if (type === 'goto' && typeof record.index === 'number' && Number.isFinite(record.index)) {
		return { type: 'goto', index: record.index }
	}
	return undefined
}
