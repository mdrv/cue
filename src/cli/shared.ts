import { Crust } from '@crustjs/core'

export const app = new Crust('cue').meta({
	description: 'Dual-column transcript prompter — turn a .ts file into a teleprompter.',
	usage: 'cue <file> [flags]\n       cue check <file>\n       cue init',
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
