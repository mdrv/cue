#!/usr/bin/env bun

import { CrustError } from '@crustjs/core'
import { helpPlugin, versionPlugin } from '@crustjs/plugins'
import packageJson from '../../package.json' with { type: 'json' }
import { CueError } from '../errors/index.ts'
import { checkCmd } from './check.ts'
import { initCmd } from './init.ts'
import { listCmd } from './list.ts'
import { playApp } from './play.ts'
import { app } from './shared.ts'

const configuredApp = playApp
	.use(versionPlugin(packageJson.version ?? '0.0.0'))
	.use(helpPlugin())
	.command(checkCmd)
	.command(listCmd)
	.command(initCmd)

async function main(): Promise<void> {
	try {
		await configuredApp.execute()
	} catch (cause) {
		if (cause instanceof CrustError) {
			if (cause.code === 'COMMAND_NOT_FOUND') {
				const available = cause.details?.available?.join(', ') ?? ''
				process.stderr.write(`cue: unknown command. Available: ${available}\n`)
			} else if (cause.code === 'VALIDATION') {
				process.stderr.write(`cue: ${cause.message}\nRun \`cue --help\` for usage.\n`)
			} else {
				process.stderr.write(`cue: ${cause.message}\n`)
			}
			process.exitCode = 1
			return
		}
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
			process.exitCode = 1
			return
		}
		process.stderr.write(
			`cue: unexpected error: ${cause instanceof Error ? cause.message : String(cause)}\n`,
		)
		process.exitCode = 1
	}
}

await main()
