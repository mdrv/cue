import { existsSync } from 'node:fs'
import { cueError } from '../errors/index.ts'
import { initLogger } from '../log/logger.ts'
import { estimateDuration } from '../transcript/estimate.ts'
import { loadTranscript } from '../transcript/load.ts'
import { app, withErrors } from './shared.ts'

const NO_DURATION = '—'
const NO_SECTION = '(no section)'

export const listCmd = app
	.sub('list')
	.meta({
		description: 'List every cue in a transcript, grouped by section, with speaker, duration, and preview.',
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
					section: c.section ?? null,
					duration: hasDur ? c.duration : undefined,
					estimated: !hasDur && flags.wpm ? ms : undefined,
					notes: c.notes,
					say: c.say,
					id: c.id,
				}
			})

			const totalDuration = rows.reduce((s, r) => s + (r.duration ?? r.estimated ?? 0), 0)
			const timedCount = rows.filter((r) => r.duration !== undefined).length
			const summary = {
				count: rows.length,
				speakers,
				totalDuration,
				timedCount,
				manualCount: rows.length - timedCount,
			}

			const sectionGroups = buildSectionGroups(rows)

			if (flags.json) {
				console.log(
					JSON.stringify(
						{
							ok: true,
							file,
							meta,
							cues: rows,
							sections: sectionGroups.map((g) => ({
								name: g.name,
								start: g.start,
								end: g.end,
								count: g.rows.length,
								speakers: [...new Set(g.rows.map((r) => r.speaker))],
								totalDuration: g.rows.reduce(
									(s, r) => s + (r.duration ?? r.estimated ?? 0),
									0,
								),
							})),
							summary,
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
			for (const group of sectionGroups) {
				if (sectionGroups.length > 1 || group.name !== NO_SECTION) {
					console.log(`\n# ${group.name}`)
				}
				for (const r of group.rows) {
					const idx = String(r.index).padStart(indexW)
					const sp = r.speaker.padEnd(speakerW)
					const dur = formatMs(r.duration, r.estimated)
					const tags = formatTags(r)
					const preview = r.text.replace(/\s+/g, ' ').slice(0, 80)
					console.log(`  ${idx}. [${sp}] (${dur})${tags} ${preview}`)
				}
				const subTotal = group.rows.reduce((s, r) => s + (r.duration ?? 0), 0)
				const subManual = group.rows.filter((r) => r.duration === undefined).length
				console.log(
					`  — section: ${formatMs(subTotal)} timed, ${subManual} manual cue${subManual === 1 ? '' : 's'}`,
				)
			}

			console.log(
				`\nTotal: ${formatMs(summary.totalDuration)} timed, ${summary.manualCount} manual cue${
					summary.manualCount === 1 ? '' : 's'
				}`,
			)
		}),
	)

interface ListRow {
	index: number
	text: string
	speaker: string
	section: string | null
	duration?: number
	estimated?: number
	notes?: string
	say?: string
	id?: string
}

interface SectionGroup {
	name: string
	start: number
	end: number
	rows: ListRow[]
}

function buildSectionGroups(rows: ListRow[]): SectionGroup[] {
	const groups: SectionGroup[] = []
	let current: SectionGroup | null = null
	for (const r of rows) {
		const name = r.section ?? NO_SECTION
		if (!current || current.name !== name) {
			current = { name, start: r.index, end: r.index, rows: [] }
			groups.push(current)
		}
		current.end = r.index
		current.rows.push(r)
	}
	return groups
}

function formatTags(r: ListRow): string {
	const tags: string[] = []
	if (r.id) tags.push(`#${r.id}`)
	if (r.say) tags.push(`say:${r.say}`)
	if (r.notes) tags.push('notes')
	return tags.length ? ` ${tags.join(' ')}` : ''
}

function formatMs(ms: number | undefined, estimated?: number): string {
	if (ms !== undefined && ms > 0) return `${ms}ms`
	if (estimated !== undefined) return `~${estimated}ms`
	return NO_DURATION
}
