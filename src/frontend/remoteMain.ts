import type { Cue } from '../transcript/types.ts'

interface RemoteData {
	cues: readonly Cue[]
	title: string
	state: { index: number; playing: boolean }
}

const DATA = (window as { __CUE__?: RemoteData }).__CUE__
if (DATA) {
	let cues = DATA.cues
	let index = DATA.state.index
	let playing = DATA.state.playing

	function $(sel: string): HTMLElement {
		const el = document.querySelector(sel)
		if (!el) throw new Error(`cue remote: missing ${sel}`)
		return el as HTMLElement
	}

	function esc(s: string): string {
		return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
	}

	function send(body: Record<string, unknown>): void {
		fetch('/api/remote', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}).catch(() => {})
	}

	function render(): void {
		const total = cues.length
		$('#count').textContent = Math.min(index + 1, total) + ' / ' + total
		const badge = $('#badge')
		badge.textContent = index >= total ? 'done' : playing ? 'playing' : 'paused'
		badge.classList.toggle('playing', playing && index < total)
		$('#fill').style.width = (total > 0 ? (index / total) * 100 : 0) + '%'
		const cur = cues[index]
		$('#current').innerHTML = cur
			? '<div class="cue">' + (cur.section ? '<span class="section">' + esc(cur.section) + '</span>' : '')
				+ esc(cur.text) + '</div>'
			: '<div class="cue">— end —</div>'
		let upcoming = ''
		for (let i = index + 1; i < Math.min(index + 3, total); i++) {
			const c = cues[i]
			if (!c) break
			upcoming += '<div>' + esc(c.text) + '</div>'
		}
		$('#next').innerHTML = upcoming
		const list = $('#list')
		list.innerHTML = ''
		cues.forEach((cue, i) => {
			const b = document.createElement('button')
			b.className = i === index ? 'cur' : ''
			b.innerHTML = '<span class="n">' + (i + 1) + '</span>' + esc(cue.text)
			b.addEventListener('click', () => {
				$('#drawer').classList.remove('open')
				apply({ action: 'goto', index: i })
			})
			list.appendChild(b)
		})
	}

	function apply(body: { action: string; index?: number }): void {
		if (body.action === 'toggle') {
			send({ action: playing ? 'pause' : 'play' })
			playing = !playing
		} else {
			send(body)
			if (body.action === 'next') index = Math.min(index + 1, cues.length)
			else if (body.action === 'prev') index = Math.max(0, index - 1)
			else if (body.action === 'goto') index = body.index ?? index
			else if (body.action === 'restart') index = 0
		}
		render()
	}

	let textOn = true
	try {
		textOn = localStorage.getItem('cue-remote-text') !== '0'
	} catch {}
	function toggleText(): void {
		textOn = !textOn
		try {
			localStorage.setItem('cue-remote-text', textOn ? '1' : '0')
		} catch {}
		document.body.classList.toggle('text-off', !textOn)
	}
	document.body.classList.toggle('text-off', !textOn)

	document.querySelectorAll('[data-act]').forEach((el) => {
		el.addEventListener('click', (ev) => {
			ev.stopPropagation()
			const act = (el as HTMLElement).dataset.act
			if (act === 'list') {
				$('#drawer').classList.add('open')
				return
			}
			if (act === 'text') {
				toggleText()
				return
			}
			if (act) apply({ action: act })
		})
	})
	$('#fab').addEventListener('click', () => document.body.classList.toggle('bar-open'))
	$('#close').addEventListener('click', () => $('#drawer').classList.remove('open'))
	$('#restart').addEventListener('click', () => {
		$('#drawer').classList.remove('open')
		apply({ action: 'restart' })
	})
	document.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') apply({ action: 'next' })
		else if (e.key === 'ArrowLeft') apply({ action: 'prev' })
		else if (e.key === ' ') {
			e.preventDefault()
			apply({ action: 'toggle' })
		}
	})

	function pullState(): void {
		fetch('/api/state')
			.then((r) => r.json())
			.then((s: unknown) => {
				const st = s as { index?: number; playing?: boolean } | null
				if (
					st
					&& typeof st.index === 'number'
					&& typeof st.playing === 'boolean'
					&& (st.index !== index || st.playing !== playing)
				) {
					index = st.index
					playing = st.playing
					render()
				}
			})
			.catch(() => {})
	}

	let firstOpen = true

	function connect(): void {
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
					const data = JSON.parse((ev as MessageEvent).data) as {
						state?: { index: number; playing: boolean }
						cues?: readonly Cue[]
					}
					if (data.state) {
						index = data.state.index
						playing = data.state.playing
					}
					if (data.cues) cues = data.cues
					render()
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

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') pullState()
	})

	render()
	connect()
}
