import type { CueConfig } from '../config/types.ts'
import type { Cue, TranscriptMeta } from '../transcript/types.ts'

export interface ClientConfig {
	duet: boolean
	fontSize: number
	markdown: boolean
	anchor: CueConfig['anchor']
	flow: CueConfig['flow']
	reverse: CueConfig['reverse']
	lookBehind: number
	lookAhead: number
	chrome: CueConfig['chrome']
	contentWidth: number
	focusStyle: CueConfig['focusStyle']
	theme: CueConfig['theme']
	lightTheme: CueConfig['theme']
	speakers: CueConfig['speakers']
}

export interface ClientData {
	transcript: {
		meta: TranscriptMeta
		cues: readonly Cue[]
	}
	config: ClientConfig
}

export interface ReloadState {
	index: number
	playing: boolean
}

export interface ReloadData {
	state?: ReloadState
	cues?: readonly Cue[]
	meta?: TranscriptMeta
	config?: Partial<ClientConfig>
}

export type CueRole = 'focus' | 'next' | 'next2' | 'prev'
