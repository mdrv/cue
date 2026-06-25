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
		throw cueError('PARSE', `No \`transcript\` export found in ${filePath}`, { file: filePath })
	}

	const result = transcriptSchema.safeParse(raw)
	if (!result.success) {
		throw cueError('PARSE', `Invalid transcript in ${filePath}`, {
			file: filePath,
			issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
		})
	}
	return result.data
}

function uniqueSpeakers(cues: readonly { speaker?: string }[]): string[] {
	const set = new Set<string>()
	for (const c of cues) if (c.speaker) set.add(c.speaker)
	return [...set]
}
