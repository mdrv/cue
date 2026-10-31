import { defineCommand } from '@crustjs/core'
import { existsSync } from 'node:fs'
import { parseConfigPatch } from '../config/merge.ts'
import { cueError } from '../errors/index.ts'
import { initLogger } from '../log/logger.ts'
import { loadTranscript } from '../transcript/load.ts'
import type { GlobalFlags } from './shared.ts'
import { withErrors } from './shared.ts'

export const checkCmd = defineCommand(
	'check',
	{ description: 'Validate a transcript file without starting the server.' },
	(cmd) =>
		cmd
			.args({ name: 'file', type: 'path', description: 'Transcript .ts file to validate' })
			.action(
				withErrors<{ file?: string }, GlobalFlags>(async ({ flags, args }) => {
					await initLogger(flags.debug ? 'debug' : 'warning')
					const file = args.file
					if (!file || !existsSync(file)) {
						throw cueError('LOAD', `Transcript file not found: ${file ?? '(none)'}`, { file })
					}
					const transcript = await loadTranscript(file)
					const speakers = [...new Set(transcript.cues.map((c) => c.speaker ?? 'main'))]
					const inline = transcript.inlineConfig === undefined || transcript.inlineConfig === null
						? undefined
						: parseConfigPatch(transcript.inlineConfig, file)
					const configInfo = inline ? { inline: true, keys: Object.keys(inline) } : undefined
					if (flags.json) {
						console.log(
							JSON.stringify(
								{
									ok: true,
									file,
									count: transcript.cues.length,
									speakers,
									meta: transcript.meta,
									config: configInfo,
								},
								null,
								2,
							),
						)
						return
					}
					const title = transcript.meta.title ? ` "${transcript.meta.title}"` : ''
					const configNote = inline ? ` + inline config (${Object.keys(inline).length} keys)` : ''
					console.log(
						`✓ ${file}${title} — ${transcript.cues.length} cues, speakers: ${speakers.join(', ')}${configNote}`,
					)
				}),
			),
)
