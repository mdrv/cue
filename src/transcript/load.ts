import { pathToFileURL } from 'node:url'
import { cueError } from '../errors/index.ts'
import { getLogger } from '../log/logger.ts'
import { type ParsedTranscript, transcriptSchema } from './schema.ts'
import type { Transcript } from './types.ts'

const log = getLogger(['cue', 'transcript'])

export async function loadTranscript(filePath: string): Promise<Transcript> {
	const parsed = await parseTranscriptFile(filePath)
	const speakers = uniqueSpeakers(parsed.cues)
	log.info('Loaded transcript {file} ({count} cues, {speakers} speakers)', {
		file: filePath,
		count: parsed.cues.length,
		speakers: speakers.length,
	})
	return parsed
}

export async function parseTranscriptFile(filePath: string): Promise<ParsedTranscript> {
	let mod: Record<string, unknown>
	const url = pathToFileURL(filePath).href
	try {
		mod = (await import(url)) as Record<string, unknown>
	} catch (cause) {
		throw cueError('LOAD', `Failed to import transcript file: ${filePath}`, {
			file: filePath,
			cause: cause instanceof Error ? cause.message : String(cause),
		})
	}

	const raw = (mod.transcript ?? mod.default) as unknown
	if (raw === undefined || raw === null) {
		throw cueError('PARSE', `No \`transcript\` export found in ${filePath}`, {
			file: filePath,
			hint: 'Add `export const transcript = [...]` (or `export default defineConfig(...)` style).',
		})
	}

	const result = transcriptSchema.safeParse(raw)
	if (!result.success) {
		throw cueError('PARSE', `Invalid transcript in ${filePath}`, {
			file: filePath,
			issues: result.error.issues.map((i) => formatIssue(i.path, i.message, raw)),
		})
	}
	return result.data
}

function formatIssue(
	path: readonly PropertyKey[],
	message: string,
	raw: unknown,
): string {
	const cueIdx = extractCueIndex(path)
	const last = path.length ? path[path.length - 1] : '(root)'
	const field = typeof last === 'symbol' ? '(symbol)' : String(last)
	if (cueIdx !== null) {
		const cue = lookupCue(raw, cueIdx)
		const preview = cuePreview(cue)
		return `cue #${cueIdx + 1}${preview} — ${field}: ${message}`
	}
	const joined = path.map((p) => (typeof p === 'symbol' ? '(symbol)' : String(p))).join('.')
	return `${joined || '(root)'}: ${message}`
}

function extractCueIndex(path: readonly PropertyKey[]): number | null {
	if (path.length === 0) return null
	if (typeof path[0] === 'number') return path[0]
	if (path[0] === 'cues' && typeof path[1] === 'number') return path[1]
	return null
}

function lookupCue(raw: unknown, idx: number): unknown {
	if (Array.isArray(raw)) return raw[idx]
	if (typeof raw === 'object' && raw !== null && 'cues' in raw) {
		const cues = (raw as { cues: unknown }).cues
		if (Array.isArray(cues)) return cues[idx]
	}
	return undefined
}

function cuePreview(cue: unknown): string {
	if (typeof cue === 'object' && cue !== null && 'text' in cue) {
		const text = String((cue as { text: unknown }).text ?? '')
		const single = text.replace(/\s+/g, ' ').trim()
		if (!single) return ''
		const slice = single.slice(0, 60)
		return single.length > 60 ? ` "${slice}…"` : ` "${slice}"`
	}
	return ''
}

function uniqueSpeakers(cues: readonly { speaker?: string }[]): string[] {
	const set = new Set<string>()
	for (const c of cues) if (c.speaker) set.add(c.speaker)
	return [...set]
}
