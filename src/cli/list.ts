import { existsSync } from 'node:fs'
import { cueError } from '../errors/index.ts'
import { initLogger } from '../log/logger.ts'
import { estimateDuration } from '../transcript/estimate.ts'
import { loadTranscript } from '../transcript/load.ts'
import { app, withErrors } from './shared.ts'

const NO_DURATION = '—'

export const listCmd = app
	.sub('list')
	.meta({
		description: 'List every cue in a transcript with index, speaker, duration, and text preview.',
	})
	.args([{ name: 'file', type: 'path', description: 'Transcript .ts file to list' }])
	.flags({
		wpm: { type: 'number', description: 'Show estimated durations for cues without one' },
	})
	.run(
		withErrors(async ({ flags, args }) => {
			await initLogger('warning')
			const file = args.file
			if (!file || !existsSync(file)) {
				throw cueError('LOAD', `Transcript file not found: ${file ?? '(none)'}`, { file })
			}
			const transcript = await loadTranscript(file)
			const { meta, cues } = transcript
			const speakers = [...new Set(cues.map((c) => c.speaker ?? 'main'))]
			const wpm = flags.wpm ?? meta.wpm

			const rows = cues.map((c, i) => {
				const speaker = c.speaker ?? 'main'
				const hasDur = typeof c.duration === 'number' && c.duration > 0
				const ms = hasDur ? c.duration : flags.wpm ? estimateDuration(c.text, wpm) : undefined
				return {
					index: i + 1,
					text: c.text,
					speaker,
					duration: hasDur ? c.duration : undefined,
					estimated: !hasDur && flags.wpm ? ms : undefined,
				}
			})

			if (flags.json) {
				const totalDuration = rows.reduce((s, r) => s + (r.duration ?? r.estimated ?? 0), 0)
				const timedCount = rows.filter((r) => r.duration !== undefined).length
				console.log(
					JSON.stringify(
						{
							ok: true,
							file,
							meta,
							cues: rows,
							summary: {
								count: rows.length,
								speakers,
								totalDuration,
								timedCount,
								manualCount: rows.length - timedCount,
							},
						},
						null,
						2,
					),
				)
				return
			}

			const title = meta.title ? ` "${meta.title}"` : ''
			console.log(`✓ ${file}${title} — ${cues.length} cues, speakers: ${speakers.join(', ')}`)
			const indexW = String(rows.length).length
			const speakerW = Math.max(...speakers.map((s) => s.length), 4)
			for (const r of rows) {
				const idx = String(r.index).padStart(indexW)
				const sp = r.speaker.padEnd(speakerW)
				const dur = formatMs(r.duration, r.estimated)
				const preview = r.text.replace(/\s+/g, ' ').slice(0, 80)
				console.log(`  ${idx}. [${sp}] (${dur}) ${preview}`)
			}
			const timedTotal = rows.reduce((s, r) => s + (r.duration ?? 0), 0)
			const manualCount = rows.length - rows.filter((r) => r.duration !== undefined).length
			console.log(
				`\nTotal: ${formatMs(timedTotal)} timed, ${manualCount} manual cue${manualCount === 1 ? '' : 's'}`,
			)
		}),
	)

function formatMs(ms: number | undefined, estimated?: number): string {
	if (ms !== undefined) return `${ms}ms`
	if (estimated !== undefined) return `~${estimated}ms`
	return NO_DURATION
}
