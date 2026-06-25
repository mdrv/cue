import { existsSync } from 'node:fs'
import { cueError } from '../errors/index.ts'
import { initLogger } from '../log/logger.ts'
import { loadTranscript } from '../transcript/load.ts'
import { app, withErrors } from './shared.ts'

export const checkCmd = app
	.sub('check')
	.meta({ description: 'Validate a transcript file without starting the server.' })
	.args([{ name: 'file', type: 'path', description: 'Transcript .ts file to validate' }])
	.run(
		withErrors(async ({ flags, args }) => {
			await initLogger(flags.debug ? 'debug' : 'warning')
			const file = args.file
			if (!file || !existsSync(file)) {
				throw cueError('LOAD', `Transcript file not found: ${file ?? '(none)'}`, { file })
			}
			const transcript = await loadTranscript(file)
			const speakers = [...new Set(transcript.cues.map((c) => c.speaker ?? 'main'))]
			if (flags.json) {
				console.log(
					JSON.stringify(
						{ ok: true, file, count: transcript.cues.length, speakers, meta: transcript.meta },
						null,
						2,
					),
				)
				return
			}
			const title = transcript.meta.title ? ` "${transcript.meta.title}"` : ''
			console.log(`✓ ${file}${title} — ${transcript.cues.length} cues, speakers: ${speakers.join(', ')}`)
		}),
	)
