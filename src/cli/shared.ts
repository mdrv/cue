import { Crust } from '@crustjs/core'
import { CueError } from '../errors/index.ts'

export const app = new Crust('cue').meta({
	description: 'Dual-column transcript prompter — turn a .ts file into a teleprompter.',
	usage: 'cue <file> [flags]\n       cue check <file>\n       cue list <file>\n       cue init',
}).flags({
	// Global, inherited by every subcommand.
	debug: { type: 'boolean', short: 'd', description: 'Verbose (debug) logging', inherit: true },
	json: { type: 'boolean', short: 'j', description: 'Emit machine-readable JSON output', inherit: true },
	config: { type: 'string', description: 'Path to a cue.ts config file', inherit: true },

	// Root (`cue <file>`) only — not inherited.
	port: { type: 'number', short: 'p', description: 'Server port (0 = pick a free port)' },
	open: { type: 'boolean', default: true, description: 'Open the browser on start (use --no-open)' },
	duet: { type: 'boolean', description: 'Force dual-column (duet) layout' },
	wpm: { type: 'number', description: 'Words-per-minute used by --estimate to fill durations' },
	estimate: { type: 'boolean', description: 'Auto-fill missing durations from --wpm' },
})

export interface GlobalFlags {
	readonly debug?: boolean
	readonly json?: boolean
	readonly config?: string
}

type RunCtx<TArgs, TFlags> = { readonly args: TArgs; readonly flags: TFlags }
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
