import { Crust, defineContext, defineFlag } from '@crustjs/core'
import packageJson from '../../package.json' with { type: 'json' }
import { CueError } from '../errors/index.ts'

export const VERSION: string = packageJson.version ?? '0.0.0'

const debugFlag = defineFlag('debug', { type: 'boolean', short: 'd', description: 'Verbose (debug) logging' })
const jsonFlag = defineFlag('json', { type: 'boolean', short: 'j', description: 'Emit machine-readable JSON output' })
const configFlag = defineFlag('config', { type: 'string', description: 'Path to a cue.ts config file' })

const globals = defineContext('globals').flags(debugFlag, jsonFlag, configFlag).setup(() => ({}))

export const app = new Crust('cue', {
	description: 'Dual-column transcript prompter — turn a .ts file into a teleprompter.',
	usage: 'cue <file> [flags]\n       cue check <file>\n       cue list <file>\n       cue init',
	version: VERSION,
}).provide(globals())

export interface GlobalFlags {
	readonly debug?: boolean
	readonly json?: boolean
	readonly config?: string
}

type RunCtx<TArgs, TFlags> = {
	readonly args: TArgs
	readonly flags: TFlags
	readonly signal: AbortSignal
}
type RunHandler<TArgs, TFlags> = (ctx: RunCtx<TArgs, TFlags>) => Promise<void> | void

export function withErrors<TArgs, TFlags>(handler: RunHandler<TArgs, TFlags>): RunHandler<TArgs, TFlags> {
	return async (ctx) => {
		try {
			await handler(ctx)
		} catch (cause) {
			reportError(cause)
			process.exit(1)
		}
	}
}

export function reportError(cause: unknown): void {
	if (cause instanceof CueError) {
		process.stderr.write(`cue: ${cause.message}\n`)
		const ctx = cause.context ?? {}
		if (Array.isArray(ctx.issues)) {
			for (const i of ctx.issues) process.stderr.write(`  - ${i}\n`)
		}
		for (const [k, v] of Object.entries(ctx)) {
			if (k === 'issues') continue
			process.stderr.write(`  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}\n`)
		}
		return
	}
	const msg = cause instanceof Error ? cause.message : String(cause)
	process.stderr.write(`cue: ${msg}\n`)
}
