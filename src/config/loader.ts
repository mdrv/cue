import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cueError } from '../errors/index.ts'
import { configSchema } from './schema.ts'
import { type CueConfig, DEFAULT_CONFIG } from './types.ts'

export function resolveConfigPath(explicit?: string): string | undefined {
	if (explicit) return existsSync(explicit) ? explicit : undefined
	const local = join(process.cwd(), '.cue', 'cue.ts')
	if (existsSync(local)) return local
	const user = join(homedir(), '.config', 'cue', 'cue.ts')
	if (existsSync(user)) return user
	return undefined
}

export async function loadConfig(path?: string): Promise<CueConfig> {
	const resolved = resolveConfigPath(path)
	if (!resolved) return DEFAULT_CONFIG
	let mod: Record<string, unknown>
	try {
		mod = (await import(pathToFileURL(resolved).href)) as Record<string, unknown>
	} catch (cause) {
		throw cueError('CONFIG', `Failed to import config file: ${resolved}`, {
			file: resolved,
			cause: cause instanceof Error ? cause.message : String(cause),
		})
	}
	const raw = mod.default ?? mod.config
	const result = configSchema.safeParse(raw ?? {})
	if (!result.success) {
		throw cueError('CONFIG', `Invalid config in ${resolved}`, {
			file: resolved,
			issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
		})
	}
	return result.data
}
