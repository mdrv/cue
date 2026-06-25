;(() => {
	'use strict'
	const DATA = window.__CUE__
	if (!DATA) return
	const { transcript, config } = DATA
	const cues = transcript.cues
	const total = cues.length
	const meta = transcript.meta || {}
	const darkTheme = config.theme
	const lightTheme = config.lightTheme
	const STORAGE_PREFIX = 'cue:' + (meta.title ? encodeURIComponent(meta.title) : 'default')
	const speakers = config.speakers || { main: { column: 'left' }, side: { column: 'right' } }

	const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
	function escapeHtml(s) {
		return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)
	}
	function isSafeUrl(url) {
		const t = url.trim()
		if (/^(https?:|mailto:)/i.test(t)) return true
		if (/^[/?#]/.test(t)) return true
		if (/^\.\.?\//.test(t)) return true
		if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) return true
		return false
	}
	function renderInlineMarkdown(input) {
		const codeSpans = []
		let s = escapeHtml(input)
		s = s.replace(/`([^`]+)`/g, (_, c) => {
			codeSpans.push(c)
			return `\uE000${codeSpans.length - 1}\uE001`
		})
		s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
			if (!isSafeUrl(url)) return text
			return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
		})
		s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
		s = s.replace(/\uE000(\d+)\uE001/g, (_m, i) => `<code>${codeSpans[Number(i)] ?? ''}</code>`)
		return s
	}
	function renderText(text) {
		return config.markdown !== false ? renderInlineMarkdown(text) : escapeHtml(text)
	}

	const columnOf = (sp) => {
		const s = speakers[sp]
		if (s && s.column) return s.column
		if (sp === 'side') return 'right'
		return 'left'
	}
	const colorOf = (sp) => (speakers[sp] && speakers[sp].color) || null

	let light = loadBool('light', false)
	let index = 0
	let playing = false
	let timer = null
	let font = loadNum('font', config.fontSize || 48)

	function loadNum(key, fallback) {
		try {
			const v = localStorage.getItem(STORAGE_PREFIX + ':' + key)
			if (v === null) return fallback
			const n = Number(v)
			return Number.isFinite(n) && n > 0 ? n : fallback
		} catch (_) {
			return fallback
		}
	}
	function saveNum(key, value) {
		try {
			localStorage.setItem(STORAGE_PREFIX + ':' + key, String(value))
		} catch (_) {}
	}
	function loadBool(key, fallback) {
		try {
			const v = localStorage.getItem(STORAGE_PREFIX + ':' + key)
			if (v === null) return fallback
			return v === '1'
		} catch (_) {
			return fallback
		}
	}
	function saveBool(key, value) {
		try {
			localStorage.setItem(STORAGE_PREFIX + ':' + key, value ? '1' : '0')
		} catch (_) {}
	}

	const stage = document.getElementById('stage')
	const bar = document.getElementById('bar')
	const titleEl = document.getElementById('title')
	const progressEl = document.getElementById('progress')
	const stateEl = document.getElementById('state')
	const helpEl = document.getElementById('help')
	const progressFill = document.getElementById('progressFill')

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

	function subsetFor(column) {
		const out = []
		for (let i = 0; i < total; i++) if (columnOf(cues[i].speaker || 'main') === column) out.push(i)
		return out
	}
	function activeIn(subset) {
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
		el.innerHTML = renderText(cue.text)
		if (column) el.dataset.column = column
		return el
	}

	function renderColumn(column) {
		const subset = subsetFor(column)
		const active = activeIn(subset)
		const wrap = document.createElement('div')
		wrap.className = 'column' + (config.anchor === 'bottom' ? ' bottom' : '')
		for (let j = 0; j < subset.length; j++) {
			const off = j - active
			let role = null
			if (off === 0) role = active >= 0 && subset[j] <= index ? 'focus' : 'next'
			else if (off === 1) role = 'next'
			else if (off === 2) role = 'next2'
			else if (off === -1) role = 'prev'
			else if (off < -1) continue
			else continue
			const el = cueEl(subset[j], role, column)
			wrap.appendChild(el)
		}
		if (active < 0) wrap.classList.add('standby')
		return wrap
	}

	function renderSolo() {
		const wrap = document.createElement('div')
		wrap.className = 'column solo' + (config.anchor === 'bottom' ? ' bottom' : '')
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
		} else if (config.duet || meta.duet) {
			stage.appendChild(renderColumn('left'))
			stage.appendChild(renderColumn('right'))
		} else {
			stage.appendChild(renderSolo())
		}
		progressEl.textContent = `${Math.min(index + 1, total)} / ${total}`
		stateEl.textContent = index >= total ? 'done' : playing ? 'playing' : 'paused'
		stateEl.className = 'state ' + (index >= total ? 'done' : playing ? 'playing' : 'paused')
		if (progressFill) {
			const pct = total > 0 ? (index / total) * 100 : 0
			progressFill.style.width = pct + '%'
		}
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
			saveNum('font', font)
			render()
		} else if (k === '-' || k === '_') {
			font = Math.max(16, font - 4)
			saveNum('font', font)
			render()
		} else if (k === '?') {
			helpEl.classList.toggle('hidden')
		} else if (k === 't' || k === 'T') {
			light = !light
			saveBool('light', light)
			css()
		} else if (k === 'Escape') {
			helpEl.classList.add('hidden')
		}
	}
	document.addEventListener('keydown', onKey)

	stage.addEventListener('click', () => advance())

	function applyReload(data) {
		if (!data) return
		if (data.cues) {
			transcript.cues = data.cues
			transcript.meta = data.meta || transcript.meta
			cues.length = 0
			for (const c of data.cues) cues.push(c)
			if (index > cues.length) index = cues.length
		}
		if (data.config) {
			Object.assign(config, data.config)
		}
		render()
		scheduleAuto()
	}

	function connect() {
		try {
			const es = new EventSource('/events')
			es.addEventListener('reload', (ev) => {
				try {
					applyReload(JSON.parse(ev.data))
				} catch (_) {}
			})
			es.onerror = () => {
				try {
					es.close()
				} catch (_) {}
				setTimeout(connect, 2000)
			}
		} catch (_) {}
	}

	render()
	scheduleAuto()
	connect()
})()
