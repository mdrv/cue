#!/usr/bin/env bun

import { didYouMean, help, version } from '@crustjs/extensions'
import { checkCmd } from './check.ts'
import { initCmd } from './init.ts'
import { listCmd } from './list.ts'
import { playAction } from './play.ts'
import { app } from './shared.ts'

const configured = app
	.extend(version(), help(), didYouMean())
	.args({ name: 'file', type: 'path', description: 'Transcript .ts file exporting `transcript`' })
	.flags(
		{ name: 'port', type: 'number', short: 'p', description: 'Server port (0 = pick a free port)' },
		{ name: 'open', type: 'boolean', default: true, description: 'Open the browser on start (use --no-open)' },
		{ name: 'duet', type: 'boolean', description: 'Force dual-column (duet) layout' },
		{ name: 'wpm', type: 'number', description: 'Words-per-minute used by --estimate to fill durations' },
		{ name: 'estimate', type: 'boolean', description: 'Auto-fill missing durations from --wpm' },
	)
	.action(playAction)
	.add(checkCmd, listCmd, initCmd)

await configured.execute()
