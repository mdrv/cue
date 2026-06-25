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

	const sectionOf = (i) => (i >= 0 && i < total ? cues[i].section || null : null)
	function sectionBoundaries() {
		const out = []
		let last = null
		for (let i = 0; i < total; i++) {
			const s = cues[i].section || null
			if (s !== last) {
				out.push({ index: i, section: s })
				last = s
			}
		}
		return out
	}
	const boundaries = sectionBoundaries()
	const hasSections = boundaries.some((b) => b.section !== null)

	function currentBoundary(at) {
		let cur = null
		for (const b of boundaries) {
			if (b.index <= at) cur = b
			else break
		}
		return cur
	}
	function sectionRange(name) {
		let start = -1
		let end = total
		for (let i = 0; i < boundaries.length; i++) {
			if (boundaries[i].section === name) {
				start = boundaries[i].index
				end = i + 1 < boundaries.length ? boundaries[i + 1].index : total
				break
			}
		}
		return start < 0 ? null : { start, end }
	}
	function jumpSection(dir) {
		if (!hasSections) return
		const cur = currentBoundary(index)
		const curIdx = cur ? boundaries.indexOf(cur) : -1
		const next = boundaries[curIdx + dir]
		if (!next) return
		index = Math.max(0, Math.min(total - 1, next.index))
		render()
		scheduleAuto()
	}
	function findById(id) {
		for (let i = 0; i < total; i++) if (cues[i].id === id) return i
		return -1
	}

	let light = loadBool('light', false)
	let index = 0
	let playing = false
	let timer = null
	let font = loadNum('font', config.fontSize || 48)
	let notesVisible = loadBool('notes', false)

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
	const sectionbar = document.getElementById('sectionbar')
	const sectionLabel = sectionbar.querySelector('.label')
	const sectionCount = sectionbar.querySelector('.count')
	const sectionMini = sectionbar.querySelector('.mini > span')
	const notesEl = document.getElementById('notes')
	const notesBody = notesEl.querySelector('.body')
	const notesUpcoming = notesEl.querySelector('.upcoming')

	titleEl.textContent = meta.title || 'cue'
	document.title = meta.title ? `${meta.title} — cue` : 'cue'
	document.body.classList.toggle('anchor-bottom', config.anchor === 'bottom')

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
		let cls = 'cue ' + role
		if (role === 'focus' && (config.focusStyle === 'underline' || config.focusStyle === 'box')) {
			cls += ' ' + config.focusStyle
		}
		el.className = cls
		el.dataset.index = String(i)
		const speaker = cue.speaker || 'main'
		const col = colorOf(speaker)
		if (col) el.style.setProperty('--speaker', col)
		let html = ''
		if (cue.say) html += `<span class="say">${escapeHtml(cue.say)}</span>`
		html += renderText(cue.text)
		el.innerHTML = html
		if (column) el.dataset.column = column
		return el
	}

	function dividerEl(name) {
		const el = document.createElement('div')
		el.className = 'divider'
		el.textContent = name || '—'
		return el
	}

	function renderColumn(column) {
		const subset = subsetFor(column)
		const active = activeIn(subset)
		const wrap = document.createElement('div')
		wrap.className = 'column' + (config.anchor === 'bottom' ? ' bottom' : '')
		const startJ = Math.max(0, active - 1)
		let lastSection = startJ > 0 ? sectionOf(subset[startJ - 1]) : null
		for (let j = startJ; j < subset.length; j++) {
			const off = j - active
			if (off > 2) break
			const i = subset[j]
			const sec = sectionOf(i)
			if (sec !== lastSection) wrap.appendChild(dividerEl(sec || ''))
			lastSection = sec
			let role = null
			if (off === 0) role = active >= 0 && subset[j] <= index ? 'focus' : 'next'
			else if (off === 1) role = 'next'
			else if (off === 2) role = 'next2'
			else if (off === -1) role = 'prev'
			wrap.appendChild(cueEl(i, role, column))
		}
		if (active < 0) wrap.classList.add('standby')
		return wrap
	}

	function renderSolo() {
		const wrap = document.createElement('div')
		wrap.className = 'column solo' + (config.anchor === 'bottom' ? ' bottom' : '')
		const startJ = Math.max(0, index - 1)
		let lastSection = startJ > 0 ? sectionOf(startJ - 1) : null
		for (let j = startJ; j < total; j++) {
			const off = j - index
			if (off > 2) break
			const sec = sectionOf(j)
			if (sec !== lastSection) wrap.appendChild(dividerEl(sec || ''))
			lastSection = sec
			let role = null
			if (off === 0) role = index >= total ? null : 'focus'
			else if (off === 1) role = 'next'
			else if (off === 2) role = 'next2'
			else if (off === -1) role = 'prev'
			if (!role) continue
			wrap.appendChild(cueEl(j, role))
		}
		return wrap
	}

	function renderSectionbar() {
		if (!hasSections) {
			sectionbar.classList.remove('visible')
			return
		}
		sectionbar.classList.add('visible')
		const cur = currentBoundary(index)
		const name = cur && cur.section ? cur.section : ''
		sectionLabel.textContent = name || '—'
		if (name) {
			const range = sectionRange(name)
			if (range) {
				const pos = Math.max(0, Math.min(range.end - 1, index)) - range.start + 1
				const totalInSec = range.end - range.start
				sectionCount.textContent = `${pos} / ${totalInSec}`
				sectionMini.style.width = `${(pos / totalInSec) * 100}%`
			} else {
				sectionCount.textContent = ''
				sectionMini.style.width = '0%'
			}
		} else {
			sectionCount.textContent = ''
			sectionMini.style.width = '0%'
		}
	}

	function renderNotes() {
		notesEl.classList.toggle('visible', notesVisible)
		if (!notesVisible) return
		const cur = cues[index]
		notesBody.textContent = cur && cur.notes ? cur.notes : '(no notes for this cue)'
		let upcomingText = ''
		for (let i = index + 1; i < total; i++) {
			if (cues[i].notes) {
				upcomingText = `next: ${cues[i].notes}`
				break
			}
		}
		notesUpcoming.textContent = upcomingText
		notesUpcoming.classList.toggle('hidden', !upcomingText)
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
		renderSectionbar()
		renderNotes()
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
	function toggleNotes() {
		notesVisible = !notesVisible
		saveBool('notes', notesVisible)
		renderNotes()
	}

	function onKey(e) {
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
			document.body.classList.toggle('anchor-bottom', config.anchor === 'bottom')
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

	function applyDeepLink() {
		try {
			const params = new URLSearchParams(window.location.search)
			const id = params.get('id')
			if (!id) return
			const at = findById(id)
			if (at >= 0) index = at
		} catch (_) {}
	}

	applyDeepLink()
	render()
	scheduleAuto()
	connect()
})()
