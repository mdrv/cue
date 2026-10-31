export { defineConfig } from './config/defineConfig.ts'
export { loadConfig, resolveConfigPath } from './config/loader.ts'
export {
	type Column,
	type CueConfig,
	DEFAULT_CONFIG,
	DEFAULT_THEME,
	type FocusStyle,
	type SpeakerConfig,
	type ThemeConfig,
} from './config/types.ts'
export { CueError, cueError, type CueErrorCode, type CueErrorContext } from './errors/index.ts'
export { renderMarkdown } from './frontend/markdown.ts'
export { getLogger, initLogger } from './log/logger.ts'
export { type ServeHandle, type ServeOptions, serveTranscript } from './server/serve.ts'
export { estimateDuration, estimateDurations } from './transcript/estimate.ts'
export { loadTranscript, parseTranscriptFile } from './transcript/load.ts'
export { cueSchema, type ParsedCue, type ParsedTranscript, transcriptSchema } from './transcript/schema.ts'
export {
	type Cue,
	DEFAULT_SPEAKER,
	DEFAULT_WPM,
	type Speaker,
	type Transcript,
	type TranscriptMeta,
} from './transcript/types.ts'

import packageJson from '../package.json' with { type: 'json' }
export const VERSION: string = packageJson.version ?? '0.0.0'
