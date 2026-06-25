export type Speaker = 'main' | 'side' | (string & {})

export interface Cue {
	readonly text: string
	readonly duration?: number
	readonly speaker?: Speaker
}

export interface TranscriptMeta {
	readonly title?: string
	readonly wpm?: number
	readonly duet?: boolean
}

export interface Transcript {
	readonly meta: TranscriptMeta
	readonly cues: readonly Cue[]
}

export const DEFAULT_SPEAKER: Speaker = 'main'
export const DEFAULT_WPM = 160
