import { type FSWatcher, watch } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { basename, dirname } from 'node:path'
import type { CueConfig } from '../config/types.ts'
import { cueError } from '../errors/index.ts'
import { renderPage } from '../frontend/index.ts'
import { renderRemotePage } from '../frontend/remote.ts'
import { getLogger } from '../log/logger.ts'
import { loadTranscript } from '../transcript/load.ts'
import type { LoadedTranscript } from '../transcript/types.ts'
import { applyAction, DEFAULT_PRESENTER, parseAction, type PresenterState } from './present.ts'
import { ReloadHub, sseResponse } from './reload.ts'
import { htmlResponse, jsonResponse, openBrowser } from './util.ts'

const log = getLogger(['cue', 'server'])

export interface ReloadSource {
	readonly inline?: unknown
	readonly meta?: { readonly wpm?: number; readonly duet?: boolean }
}

export interface ServeOptions {
	readonly transcriptPath: string
	readonly config: CueConfig
	readonly configPath?: string
	readonly reloadConfig?: (source?: ReloadSource) => Promise<CueConfig>
	readonly watch?: boolean
}

export interface ServeHandle {
	readonly url: string
	readonly stop: () => Promise<void>
}

export async function serveTranscript(opts: ServeOptions): Promise<ServeHandle> {
	const { transcriptPath, configPath, reloadConfig, watch = true } = opts
	let transcript = await loadTranscript(transcriptPath)
	let config = opts.config
	let present: PresenterState = { ...DEFAULT_PRESENTER }
	const hub = new ReloadHub()
	const watchers: FSWatcher[] = []

	const server = Bun.serve({
		port: config.port,
		hostname: '0.0.0.0',
		development: false,
		async fetch(req) {
			const url = new URL(req.url)
			if (req.method === 'POST' && url.pathname === '/api/remote') {
				const body: unknown = await req.json().catch(() => null)
				if (body !== null && typeof body === 'object' && (body as Record<string, unknown>).action === 'sync') {
					const record = body as Record<string, unknown>
					const index = typeof record.index === 'number' ? Math.trunc(record.index) : present.index
					const playing = typeof record.playing === 'boolean' ? record.playing : present.playing
					const next: PresenterState = {
						index: Math.max(0, Math.min(index, transcript.cues.length)),
						playing,
					}
					if (next.index !== present.index || next.playing !== present.playing) {
						present = next
						hub.broadcast({ state: present })
					}
					return jsonResponse(present)
				}
				const action = parseAction(body)
				if (!action) return new Response('Bad request', { status: 400 })
				const next = applyAction(present, action, transcript.cues.length)
				if (next !== present) {
					present = next
					hub.broadcast({ state: present })
				}
				return jsonResponse(present)
			}
			switch (url.pathname) {
				case '/':
					return htmlResponse(renderPage(transcript, config))
				case '/api/transcript':
					return jsonResponse({ meta: transcript.meta, cues: transcript.cues })
				case '/events':
					return sseResponse(hub)
				case '/remote':
					return htmlResponse(renderRemotePage(transcript, config, present))
				case '/api/state':
					return jsonResponse(present)
				default:
					return new Response('Not found', { status: 404 })
			}
		},
	})

	const port = server.port
	const url = `http://localhost:${typeof port === 'number' ? port : config.port}`
	if (typeof port === 'number') {
		log.info('Serving on {url}', { url })
		for (const lan of lanUrls(port)) {
			log.info('Remote control: {url}', { url: lan })
		}
	}

	if (watch) {
		startWatcher(watchers, transcriptPath, async () => {
			let parsed: LoadedTranscript
			try {
				parsed = await loadTranscript(transcriptPath)
				transcript = parsed
			} catch (cause) {
				log.warn('Reload skipped — transcript parse failed: {cause}', {
					cause: cause instanceof Error ? cause.message : String(cause),
				})
				return
			}
			if (reloadConfig) {
				try {
					config = await reloadConfig({ inline: parsed.inlineConfig, meta: parsed.meta })
				} catch (cause) {
					log.warn('Config reload skipped: {cause}', {
						cause: cause instanceof Error ? cause.message : String(cause),
					})
				}
			}
			hub.broadcast({ meta: transcript.meta, cues: transcript.cues, config, state: present })
		})
		if (configPath && reloadConfig) {
			startWatcher(watchers, configPath, async () => {
				try {
					config = await reloadConfig({ inline: transcript.inlineConfig, meta: transcript.meta })
					hub.broadcast({ config })
					log.info('Config reloaded')
				} catch (cause) {
					log.warn('Config reload skipped: {cause}', {
						cause: cause instanceof Error ? cause.message : String(cause),
					})
				}
			})
		}
	}

	if (config.open) {
		const opened = await openBrowser(url)
		log.info(opened ? 'Opened browser at {url}' : 'Could not auto-open browser; visit {url} manually', {
			url,
		})
	}

	return {
		url,
		stop: async () => {
			for (const w of watchers) w.close()
			server.stop(true)
			log.info('Server stopped')
		},
	}
}

function startWatcher(watchers: FSWatcher[], path: string, onChange: () => void): void {
	const dir = dirname(path)
	const base = basename(path)
	let timer: Timer | undefined
	try {
		const w = watch(dir, (_event, filename) => {
			if (filename !== null && filename !== base) return
			clearTimeout(timer)
			timer = setTimeout(onChange, 150)
		})
		w.on('error', () => {})
		watchers.push(w)
		log.debug('Watching {dir} for changes to {base}', { dir, base })
	} catch (cause) {
		throw cueError('SERVE', 'Failed to watch file for changes', {
			path,
			cause: cause instanceof Error ? cause.message : String(cause),
		})
	}
}

function lanUrls(port: number): string[] {
	const urls: string[] = []
	for (const list of Object.values(networkInterfaces())) {
		for (const net of list ?? []) {
			if (net.family !== 'IPv4' || net.internal) continue
			urls.push(`http://${net.address}:${port}/remote`)
		}
	}
	return urls
}
