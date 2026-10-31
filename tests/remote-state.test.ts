import { describe, expect, test } from 'bun:test'

import { applyAction, parseAction, type PresenterState } from '../src/server/present.ts'

const base: PresenterState = { index: 2, playing: false }

describe('applyAction', () => {
	test('next advances and clamps to cue count', () => {
		expect(applyAction(base, { type: 'next' }, 5)).toEqual({ index: 3, playing: false })
		expect(applyAction({ index: 5, playing: false }, { type: 'next' }, 5)).toEqual({ index: 5, playing: false })
	})

	test('prev steps back and never goes negative', () => {
		expect(applyAction(base, { type: 'prev' }, 5)).toEqual({ index: 1, playing: false })
		expect(applyAction({ index: 0, playing: false }, { type: 'prev' }, 5)).toEqual({ index: 0, playing: false })
	})

	test('goto clamps into [0, cueCount] and truncates', () => {
		expect(applyAction(base, { type: 'goto', index: 4 }, 5)).toEqual({ index: 4, playing: false })
		expect(applyAction(base, { type: 'goto', index: 99 }, 5)).toEqual({ index: 5, playing: false })
		expect(applyAction(base, { type: 'goto', index: -3 }, 5)).toEqual({ index: 0, playing: false })
		expect(applyAction(base, { type: 'goto', index: 2.9 }, 5)).toEqual({ index: 2, playing: false })
	})

	test('play and pause are idempotent', () => {
		expect(applyAction(base, { type: 'play' }, 5)).toEqual({ index: 2, playing: true })
		expect(applyAction({ index: 2, playing: true }, { type: 'play' }, 5)).toEqual({ index: 2, playing: true })
		expect(applyAction({ index: 2, playing: true }, { type: 'pause' }, 5)).toEqual({ index: 2, playing: false })
		expect(applyAction(base, { type: 'pause' }, 5)).toEqual(base)
	})

	test('restart returns same object when already at start', () => {
		expect(applyAction(base, { type: 'restart' }, 5)).toEqual({ index: 0, playing: false })
		expect(applyAction({ index: 0, playing: true }, { type: 'restart' }, 5)).toEqual({ index: 0, playing: true })
	})

	test('no-op returns the same object reference', () => {
		expect(applyAction(base, { type: 'next' }, 2)).toBe(base)
		expect(applyAction(base, { type: 'pause' }, 5)).toBe(base)
	})

	test('parseAction accepts action/type aliases and goto with finite index', () => {
		expect(parseAction({ action: 'next' })).toEqual({ type: 'next' })
		expect(parseAction({ type: 'pause' })).toEqual({ type: 'pause' })
		expect(parseAction({ action: 'goto', index: 3 })).toEqual({ type: 'goto', index: 3 })
		expect(parseAction({ action: 'goto', index: Number.NaN })).toBeUndefined()
		expect(parseAction({ action: 'explode' })).toBeUndefined()
		expect(parseAction('next')).toBeUndefined()
		expect(parseAction(null)).toBeUndefined()
	})
})
