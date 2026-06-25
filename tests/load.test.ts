import { expect, test } from 'bun:test'
import { join } from 'node:path'
import { CueError } from '../src/errors/index.ts'
import { parseTranscriptFile } from '../src/transcript/load.ts'

const fixtures = join(import.meta.dir, 'fixtures')

test('parseTranscriptFile loads a valid file', async () => {
	const t = await parseTranscriptFile(join(fixtures, 'valid.ts'))
	expect(t.cues.length).toBeGreaterThan(0)
	expect(t.meta.title).toBe('Valid')
})

test('parseTranscriptFile throws LOAD on missing file', async () => {
	expect(parseTranscriptFile(join(fixtures, 'nope.ts'))).rejects.toBeInstanceOf(CueError)
})

test('parseTranscriptFile throws PARSE on missing transcript export', async () => {
	expect(parseTranscriptFile(join(fixtures, 'no-export.ts'))).rejects.toBeInstanceOf(CueError)
})
