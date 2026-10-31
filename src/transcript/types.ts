export type Speaker = 'main' | 'side' | (string & {})

export interface Cue {
	readonly text: string
	readonly duration?: number
	readonly speaker?: Speaker
	readonly section?: string
	readonly notes?: string
	readonly id?: string
	readonly say?: string
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

export interface LoadedTranscript extends Transcript {
	readonly inlineConfig?: unknown
}

export const DEFAULT_SPEAKER: Speaker = 'main'
export const DEFAULT_WPM = 160
