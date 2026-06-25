import { expect, test } from 'bun:test'
import { estimateDuration, estimateDurations } from '../src/transcript/estimate.ts'

test('estimateDuration scales with word count', () => {
	const short = estimateDuration('one two three', 180)
	const long = estimateDuration('one two three four five six seven eight nine ten', 180)
	expect(long).toBeGreaterThan(short)
	expect(short).toBe(1000) // 3 words / 180 wpm * 60000
})

test('estimateDuration handles empty text', () => {
	expect(estimateDuration('   ', 160)).toBe(0)
})

test('estimateDurations only fills missing durations', () => {
	const out = estimateDurations(
		[
			{ text: 'a b c', duration: 999 },
			{ text: 'a b c d e' },
		],
		100,
	)
	expect(out[0]?.duration).toBe(999) // preserved
	expect(out[1]?.duration).toBe(3000) // 5/100*60000
})
