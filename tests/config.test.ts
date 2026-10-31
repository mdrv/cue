import { expect, test } from 'bun:test'
import { buildConfig } from '../src/config/loader.ts'
import { mergeConfigPatch, parseConfigPatch } from '../src/config/merge.ts'
import { DEFAULT_CONFIG } from '../src/config/types.ts'
import { CueError } from '../src/errors/index.ts'

test('mergeConfigPatch overrides primitives', () => {
	const merged = mergeConfigPatch(DEFAULT_CONFIG, { fontSize: 72, duet: true })
	expect(merged.fontSize).toBe(72)
	expect(merged.duet).toBe(true)
	expect(merged.anchor).toBe(DEFAULT_CONFIG.anchor)
})

test('mergeConfigPatch deep-merges theme and speakers', () => {
	const merged = mergeConfigPatch(DEFAULT_CONFIG, {
		theme: { accent: '#ff0000' },
		speakers: { guest: { column: 'right' } },
	})
	expect(merged.theme.accent).toBe('#ff0000')
	expect(merged.theme.background).toBe(DEFAULT_CONFIG.theme.background)
	expect(merged.speakers.main).toEqual(DEFAULT_CONFIG.speakers.main)
	expect(merged.speakers.guest).toEqual({ column: 'right' })
})

test('parseConfigPatch throws CueError with source in message', () => {
	try {
		parseConfigPatch({ fontSize: -5 }, 'show.ts')
		expect.unreachable()
	} catch (e) {
		expect(e).toBeInstanceOf(CueError)
		const err = e as CueError
		expect(err.code).toBe('CONFIG')
		expect(err.message).toContain('show.ts')
	}
})

test('buildConfig layers: defaults < meta < inline < overrides', async () => {
	const config = await buildConfig({
		meta: { wpm: 180, duet: true },
		inline: { wpm: 200, fontSize: 56 },
		overrides: { wpm: 220 },
	})
	expect(config.wpm).toBe(220)
	expect(config.duet).toBe(true)
	expect(config.fontSize).toBe(56)
	expect(config.anchor).toBe(DEFAULT_CONFIG.anchor)
})

test('buildConfig without layers returns defaults', async () => {
	const config = await buildConfig({})
	expect(config).toEqual(DEFAULT_CONFIG)
})

test('buildConfig throws CueError on invalid inline config', async () => {
	try {
		await buildConfig({ inline: { fontSize: -5 }, inlineSource: 'show.ts' })
		expect.unreachable()
	} catch (e) {
		expect(e).toBeInstanceOf(CueError)
		expect((e as CueError).message).toContain('show.ts')
	}
})
