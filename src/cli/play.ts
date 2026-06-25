import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadConfig } from '../config/loader.ts'
import { cueError } from '../errors/index.ts'
import { getLogger, initLogger } from '../log/logger.ts'
import type { ServeHandle } from '../server/serve.ts'
import { serveTranscript } from '../server/serve.ts'
import { estimateDurations } from '../transcript/estimate.ts'
import { loadTranscript } from '../transcript/load.ts'
import { app } from './shared.ts'

let handle: ServeHandle | undefined

export const playApp = app
	.args([{ name: 'file', type: 'path', description: 'Transcript .ts file exporting `transcript`' }])
	.run(async ({ flags, args }) => {
		await initLogger(flags.debug ? 'debug' : 'info')
		const log = getLogger(['cue', 'cli'])
		const file = args.file
		if (!file || !existsSync(file)) {
			throw cueError('LOAD', `Transcript file not found: ${file ?? '(none)'}`, { file })
		}

		const base = await loadConfig(flags.config)
		const config = {
			...base,
			port: flags.port ?? base.port,
			open: flags.open,
			duet: flags.duet ?? base.duet,
			wpm: flags.wpm ?? base.wpm,
		}

		let transcriptPath = resolve(file)
		if (flags.estimate) {
			const t = await loadTranscript(file)
			estimateDurations(t.cues, config.wpm)
			log.info('Estimating missing durations at {wpm} wpm', { wpm: config.wpm })
		}

		handle = await serveTranscript({ transcriptPath, config, watch: true })
		log.info('cue is running. Press Ctrl+C to stop.')

		const stop = async () => {
			await handle?.stop()
			process.exit(0)
		}
		process.on('SIGINT', stop)
		process.on('SIGTERM', stop)
	})
