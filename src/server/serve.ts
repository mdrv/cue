import { type FSWatcher, watch } from 'node:fs'
import type { CueConfig } from '../config/types.ts'
import { cueError } from '../errors/index.ts'
import { renderPage } from '../frontend/index.ts'
import { getLogger } from '../log/logger.ts'
import { loadTranscript } from '../transcript/load.ts'
import type { Transcript } from '../transcript/types.ts'
import { ReloadHub, sseResponse } from './reload.ts'
import { htmlResponse, jsonResponse, openBrowser } from './util.ts'

const log = getLogger(['cue', 'server'])

export interface ServeOptions {
	readonly transcriptPath: string
	readonly config: CueConfig
	readonly configPath?: string
	readonly reloadConfig?: () => Promise<CueConfig>
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
	const hub = new ReloadHub()
	const watchers: FSWatcher[] = []

	const server = Bun.serve({
		port: config.port,
		development: false,
		fetch(req) {
			const url = new URL(req.url)
			switch (url.pathname) {
				case '/':
					return htmlResponse(renderPage(transcript, config))
				case '/api/transcript':
					return jsonResponse({ meta: transcript.meta, cues: transcript.cues })
				case '/events':
					return sseResponse(hub)
				default:
					return new Response('Not found', { status: 404 })
			}
		},
	})

	const url = `http://localhost:${server.port}`
	log.info('Serving on {url}', { url })

	if (watch) {
		startWatcher(watchers, transcriptPath, async () => {
			try {
				transcript = await loadTranscript(transcriptPath)
				hub.broadcast({ meta: transcript.meta, cues: transcript.cues })
			} catch (cause) {
				log.warn('Reload skipped — transcript parse failed: {cause}', {
					cause: cause instanceof Error ? cause.message : String(cause),
				})
			}
		})
		if (configPath && reloadConfig) {
			startWatcher(watchers, configPath, async () => {
				try {
					config = await reloadConfig()
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
	let timer: Timer | undefined
	try {
		const w = watch(path, () => {
			clearTimeout(timer)
			timer = setTimeout(onChange, 150)
		})
		w.on('error', () => {})
		watchers.push(w)
		log.debug('Watching {path} for changes', { path })
	} catch (cause) {
		throw cueError('SERVE', 'Failed to watch file for changes', {
			path,
			cause: cause instanceof Error ? cause.message : String(cause),
		})
	}
}
