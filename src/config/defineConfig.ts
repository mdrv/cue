import { configSchema, type CueConfigInput } from './schema.ts'
import type { CueConfig } from './types.ts'

export function defineConfig(input: CueConfigInput): CueConfig {
	return configSchema.parse(input)
}
