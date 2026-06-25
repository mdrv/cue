;(() => {
	'use strict'
	const DATA = window.__CUE__
	if (!DATA) return
	const { transcript, config } = DATA
	const cues = transcript.cues
	const total = cues.length
	const meta = transcript.meta || {}
	const duet = !!(config.duet || meta.duet)
	const darkTheme = config.theme
	const lightTheme = config.lightTheme
	let light = false
	const speakers = config.speakers || { main: { column: 'left' }, side: { column: 'right' } }

	const columnOf = (sp) => {
		const s = speakers[sp]
		if (s && s.column) return s.column
		if (sp === 'side') return 'right'
		return 'left'
	}
	const colorOf = (sp) => (speakers[sp] && speakers[sp].color) || null

	let index = 0
	let playing = false
	let timer = null
	let font = config.fontSize || 48

	const stage = document.getElementById('stage')
	const bar = document.getElementById('bar')
	const titleEl = document.getElementById('title')
	const progressEl = document.getElementById('progress')
	const stateEl = document.getElementById('state')
	const helpEl = document.getElementById('help')

	titleEl.textContent = meta.title || 'cue'
	document.title = meta.title ? `${meta.title} — cue` : 'cue'

	function css() {
		const t = light ? lightTheme : darkTheme
		document.documentElement.style.setProperty('--bg', t.background)
		document.documentElement.style.setProperty('--focus', t.focus)
		document.documentElement.style.setProperty('--dim', t.dim)
		document.documentElement.style.setProperty('--fade', t.fade)
		document.documentElement.style.setProperty('--accent', t.accent)
		document.documentElement.style.setProperty('--font', font + 'px')
	}

	// Build a column: subset cues (with their global indices) and an "active" pointer.
	function subsetFor(column) {
		const out = []
		for (let i = 0; i < total; i++) if (columnOf(cues[i].speaker || 'main') === column) out.push(i)
		return out
	}
	function activeIn(subset) {
		// latest subset cue whose global index <= playhead; -1 if none yet
		let k = -1
		for (let j = 0; j < subset.length; j++) if (subset[j] <= index) k = j
		return k
	}

	function cueEl(i, role, column) {
		const cue = cues[i]
		const el = document.createElement('div')
		el.className = 'cue ' + role
		el.dataset.index = String(i)
		const speaker = cue.speaker || 'main'
		const col = colorOf(speaker)
		if (col && role === 'focus') el.style.setProperty('--speaker', col)
		el.textContent = cue.text
		if (column) el.dataset.column = column
		return el
	}

	function renderColumn(column) {
		const subset = subsetFor(column)
		const active = activeIn(subset)
		const wrap = document.createElement('div')
		wrap.className = 'column'
		// window: 1 prev (faded) + focus + 2 next (dim), hide the rest
		for (let j = 0; j < subset.length; j++) {
			const off = j - active
			let role = null
			if (off === 0) role = active >= 0 && subset[j] <= index ? 'focus' : 'next'
			else if (off === 1) role = 'next'
			else if (off === 2) role = 'next2'
			else if (off === -1) role = 'prev'
			else if (off < -1) role = 'past'
			else continue
			if (off < -1) continue // keep only the immediate previous visible
			const el = cueEl(subset[j], role, column)
			wrap.appendChild(el)
		}
		if (active < 0) wrap.classList.add('standby')
		return wrap
	}

	function renderSolo() {
		const wrap = document.createElement('div')
		wrap.className = 'column solo'
		for (let j = 0; j < total; j++) {
			const off = j - index
			let role = null
			if (off === 0) role = index >= total ? null : 'focus'
			else if (off === 1) role = 'next'
			else if (off === 2) role = 'next2'
			else if (off === -1) role = 'prev'
			else if (off < -1) continue
			else continue
			if (!role) continue
			wrap.appendChild(cueEl(j, role))
		}
		return wrap
	}

	function render() {
		css()
		stage.innerHTML = ''
		if (index >= total) {
			const fin = document.createElement('div')
			fin.className = 'fin'
			fin.textContent = '— end —'
			stage.appendChild(fin)
		} else if (duet) {
			stage.appendChild(renderColumn('left'))
			stage.appendChild(renderColumn('right'))
		} else {
			stage.appendChild(renderSolo())
		}
		progressEl.textContent = `${Math.min(index + 1, total)} / ${total}`
		stateEl.textContent = index >= total ? 'done' : playing ? 'playing' : 'paused'
		stateEl.className = 'state ' + (index >= total ? 'done' : playing ? 'playing' : 'paused')
		const f = stage.querySelector('.focus')
		if (f) f.scrollIntoView({ block: 'center', behavior: 'smooth' })
	}

	function scheduleAuto() {
		clearTimeout(timer)
		timer = null
		if (!playing || index >= total) return
		const cue = cues[index]
		const d = cue && cue.duration
		if (d && d > 0) timer = setTimeout(advance, d)
	}

	function advance() {
		if (index < total) index++
		render()
		scheduleAuto()
	}
	function prev() {
		if (index > 0) index--
		render()
		scheduleAuto()
	}
	function restart() {
		index = 0
		render()
		scheduleAuto()
	}
	function togglePlay() {
		playing = !playing
		if (playing && index >= total) index = 0
		render()
		scheduleAuto()
	}

	function onKey(e) {
		const k = e.key
		if (k === ' ' || k === 'ArrowRight' || k === 'Enter') {
			e.preventDefault()
			advance()
		} else if (k === 'ArrowLeft' || k === 'Backspace') {
			e.preventDefault()
			prev()
		} else if (k === 'p' || k === 'P') {
			togglePlay()
		} else if (k === 'r' || k === 'R') {
			restart()
		} else if (k === 'f' || k === 'F') {
			if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
			else document.exitFullscreen?.()
		} else if (k === '+' || k === '=') {
			font = Math.min(160, font + 4)
			render()
		} else if (k === '-' || k === '_') {
			font = Math.max(16, font - 4)
			render()
		} else if (k === '?') {
			helpEl.classList.toggle('hidden')
		} else if (k === 't' || k === 'T') {
			light = !light
			css()
		} else if (k === 'Escape') {
			helpEl.classList.add('hidden')
		}
	}
	document.addEventListener('keydown', onKey)

	// Click anywhere to advance (handy for mouse users)
	stage.addEventListener('click', () => advance())

	// Hot reload via SSE
	function connect() {
		try {
			const es = new EventSource('/events')
			es.addEventListener('reload', (ev) => {
				try {
					const data = JSON.parse(ev.data)
					if (data && data.cues) {
						transcript.cues = data.cues
						transcript.meta = data.meta || transcript.meta
						cues.length = 0
						for (const c of data.cues) cues.push(c)
						if (index > cues.length) index = cues.length
						render()
						scheduleAuto()
					}
				} catch (_) {
					// ignore malformed payload
				}
			})
			es.onerror = () => {
				try {
					es.close()
				} catch (_) {}
				setTimeout(connect, 2000)
			}
		} catch (_) {
			// SSE unsupported — degrade silently
		}
	}

	render()
	scheduleAuto()
	connect()
})()
