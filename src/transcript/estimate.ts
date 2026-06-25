import type { Cue } from './types.ts'
import { DEFAULT_WPM } from './types.ts'

const MS_PER_MIN = 60_000

export function estimateDuration(text: string, wpm = DEFAULT_WPM): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length
	if (words === 0) return 0
	return Math.round((words / wpm) * MS_PER_MIN)
}

export function estimateDurations(cues: readonly Cue[], wpm = DEFAULT_WPM): Cue[] {
	return cues.map((c) => (c.duration === undefined ? { ...c, duration: estimateDuration(c.text, wpm) } : c))
}
