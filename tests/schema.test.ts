import { expect, test } from 'bun:test'
import { cueSchema, transcriptSchema } from '../src/transcript/schema.ts'

test('cueSchema accepts a minimal cue', () => {
	const r = cueSchema.safeParse({ text: 'hello' })
	expect(r.success).toBe(true)
})

test('cueSchema rejects empty text', () => {
	const r = cueSchema.safeParse({ text: '' })
	expect(r.success).toBe(false)
})

test('cueSchema rejects non-positive duration', () => {
	expect(cueSchema.safeParse({ text: 'x', duration: 0 }).success).toBe(false)
	expect(cueSchema.safeParse({ text: 'x', duration: -5 }).success).toBe(false)
	expect(cueSchema.safeParse({ text: 'x', duration: 3.5 }).success).toBe(false)
})

test('transcriptSchema accepts a bare array of cues', () => {
	const r = transcriptSchema.parse([
		{ text: 'a', duration: 1000 },
		{ text: 'b', speaker: 'side' },
	])
	expect(r.cues).toHaveLength(2)
	expect(r.cues[0]?.speaker).toBe('main')
	expect(r.cues[1]?.speaker).toBe('side')
	expect(r.meta.duet).toBe(false)
	expect(r.meta.wpm).toBe(160)
})

test('transcriptSchema accepts a { meta, cues } object', () => {
	const r = transcriptSchema.parse({ meta: { title: 'T', duet: true }, cues: [{ text: 'a' }] })
	expect(r.meta.title).toBe('T')
	expect(r.meta.duet).toBe(true)
})

test('transcriptSchema rejects an empty cue list', () => {
	expect(transcriptSchema.safeParse([]).success).toBe(false)
	expect(transcriptSchema.safeParse({ cues: [] }).success).toBe(false)
})

test('transcriptSchema defaults speaker to main', () => {
	const r = transcriptSchema.parse([{ text: 'a' }, { text: 'b', speaker: 'narrator' }])
	expect(r.cues.map((c) => c.speaker)).toEqual(['main', 'narrator'])
})
