import { expect, test } from 'bun:test'
import { join } from 'node:path'
import { CueError } from '../src/errors/index.ts'
import { loadTranscript, parseTranscriptFile } from '../src/transcript/load.ts'

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

test('loadTranscript preserves section / notes / id / say fields (v0.0.3)', async () => {
	const t = await loadTranscript(join(fixtures, 'valid.ts'))
	expect(t.cues[0]?.section).toBe('Intro')
	expect(t.cues[0]?.id).toBe('a')
	expect(t.cues[1]?.notes).toBe('whisper')
	expect(t.cues[1]?.section).toBe('Intro')
})

test('loadTranscript rejects duplicate ids (v0.0.3)', async () => {
	const p = loadTranscript(join(fixtures, 'dup-ids.ts'))
	let caught: CueError | undefined
	try {
		await p
	} catch (e) {
		caught = e as CueError
	}
	expect(caught).toBeInstanceOf(CueError)
	expect(caught?.code).toBe('PARSE')
	const issues = caught?.context.issues
	expect(Array.isArray(issues)).toBe(true)
	const first = (issues as string[])[0] ?? ''
	expect(first).toContain('dup')
	expect(first).toContain('#1')
	expect(first).toContain('#2')
})

test('parseTranscriptFile exposes inlineConfig export', async () => {
	const t = await parseTranscriptFile(join(fixtures, 'valid.ts'))
	expect(t.inlineConfig).toBeUndefined()
})

test('parseTranscriptFile passes through config export untouched', async () => {
	const t = await parseTranscriptFile(join(fixtures, 'inline-config.ts'))
	expect(t.cues.length).toBe(2)
	expect(t.meta.duet).toBe(false)
	expect(t.inlineConfig).toEqual({
		duet: true,
		fontSize: 56,
		speakers: { guest: { column: 'right', color: '#a5b4fc' } },
	})
})

test('transcript layer does not validate inline config (config layer owns it)', async () => {
	const t = await parseTranscriptFile(join(fixtures, 'inline-bad.ts'))
	expect(t.cues.length).toBe(1)
	expect(t.inlineConfig).toEqual({ fontSize: -5 })
})
