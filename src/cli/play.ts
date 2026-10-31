import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadConfig, resolveConfigPath } from '../config/loader.ts'
import { cueError } from '../errors/index.ts'
import { getLogger, initLogger } from '../log/logger.ts'
import { serveTranscript } from '../server/serve.ts'
import type { ServeHandle } from '../server/serve.ts'
import { estimateDurations } from '../transcript/estimate.ts'
import { loadTranscript } from '../transcript/load.ts'
import type { GlobalFlags } from './shared.ts'
import { withErrors } from './shared.ts'

export const playAction = withErrors<
	{ file?: string },
	GlobalFlags & { port?: number; open?: boolean; duet?: boolean; wpm?: number; estimate?: boolean }
>(async ({ flags, args, signal }) => {
	await initLogger(flags.debug ? 'debug' : 'info')
	const log = getLogger(['cue', 'cli'])
	const file = args.file
	if (!file || !existsSync(file)) {
		throw cueError('LOAD', `Transcript file not found: ${file ?? '(none)'}`, { file })
	}

	const buildConfig = async () => {
		const base = await loadConfig(flags.config)
		return {
			...base,
			port: flags.port ?? base.port,
			open: flags.open ?? true,
			duet: flags.duet ?? base.duet,
			wpm: flags.wpm ?? base.wpm,
		}
	}
	const configPath = resolveConfigPath(flags.config)
	const config = await buildConfig()

	const transcriptPath = resolve(file)
	if (flags.estimate) {
		const t = await loadTranscript(file)
		estimateDurations(t.cues, config.wpm)
		log.info('Estimating missing durations at {wpm} wpm', { wpm: config.wpm })
	}

	const handle: ServeHandle = await serveTranscript({
		transcriptPath,
		config,
		configPath,
		reloadConfig: buildConfig,
		watch: true,
	})
	log.info('cue is running. Press Ctrl+C to stop.')

	await new Promise<void>((done) => {
		signal.addEventListener(
			'abort',
			() => {
				void handle.stop().finally(done)
			},
			{ once: true },
		)
	})
})
