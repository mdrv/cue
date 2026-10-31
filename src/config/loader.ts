import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { cueError } from '../errors/index.ts'
import { mergeConfigPatch, parseConfigPatch } from './merge.ts'
import { configSchema, type CueConfigPatch } from './schema.ts'
import { type CueConfig, DEFAULT_CONFIG } from './types.ts'

const require = createRequire(import.meta.url)

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
		const abs = require.resolve(resolve(resolved))
		delete require.cache[abs]
		mod = require(abs) as Record<string, unknown>
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

export interface BuildConfigOptions {
	readonly configFlag?: string
	readonly inline?: unknown
	readonly meta?: { readonly wpm?: number; readonly duet?: boolean }
	readonly overrides?: CueConfigPatch
	readonly inlineSource?: string
}

export async function buildConfig(opts: BuildConfigOptions = {}): Promise<CueConfig> {
	let config = await loadConfig(opts.configFlag)
	config = mergeConfigPatch(config, { wpm: opts.meta?.wpm, duet: opts.meta?.duet })
	if (opts.inline !== undefined && opts.inline !== null) {
		config = mergeConfigPatch(config, parseConfigPatch(opts.inline, opts.inlineSource ?? '(inline config)'))
	}
	return mergeConfigPatch(config, opts.overrides ?? {})
}
