import { state } from './state.ts'
import type { ReloadData, ReloadState } from './types.ts'

type ApplyFn = (data: ReloadData) => void

let apply: ApplyFn = () => {}
let syncTimer: ReturnType<typeof setTimeout> | null = null
let firstOpen = true

export function bindSync(fn: ApplyFn): void {
	apply = fn
}

export function syncRemote(): void {
	if (syncTimer !== null) clearTimeout(syncTimer)
	syncTimer = setTimeout(() => {
		syncTimer = null
		fetch('/api/remote', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ action: 'sync', index: state.index, playing: state.playing }),
		}).catch(() => {})
	}, 120)
}

export function pullState(): void {
	if (syncTimer !== null) return
	fetch('/api/state')
		.then((r) => r.json())
		.then((s: unknown) => {
			const st = s as Partial<ReloadState> | null
			if (
				st
				&& typeof st.index === 'number'
				&& typeof st.playing === 'boolean'
				&& (st.index !== state.index || st.playing !== state.playing)
			) {
				apply({ state: { index: st.index, playing: st.playing } })
			}
		})
		.catch(() => {})
}

export function connect(): void {
	try {
		const es = new EventSource('/events')
		es.addEventListener('open', () => {
			if (firstOpen) {
				firstOpen = false
				return
			}
			pullState()
		})
		es.addEventListener('reload', (ev) => {
			try {
				apply(JSON.parse((ev as MessageEvent).data) as ReloadData)
			} catch {}
		})
		es.onerror = () => {
			try {
				es.close()
			} catch {}
			setTimeout(connect, 2000)
		}
	} catch {}
}
