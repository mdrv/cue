import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { SAMPLE_CONFIG } from '../config/sample.ts'
import { cueError } from '../errors/index.ts'
import { getLogger, initLogger } from '../log/logger.ts'
import { app } from './shared.ts'

export const initCmd = app
	.sub('init')
	.meta({ description: 'Scaffold a user config at ~/.config/cue/cue.ts.' })
	.flags({
		force: { type: 'boolean', description: 'Overwrite an existing config file' },
		path: { type: 'path', description: 'Custom destination path (default: ~/.config/cue/cue.ts)' },
	})
	.run(async ({ flags }) => {
		await initLogger('info')
		const log = getLogger(['cue', 'cli'])
		const target = flags.path ?? join(homedir(), '.config', 'cue', 'cue.ts')
		if (existsSync(target) && !flags.force) {
			throw cueError('CONFIG', `Config already exists at ${target} (use --force to overwrite)`, {
				path: target,
			})
		}
		mkdirSync(join(target, '..'), { recursive: true })
		await Bun.write(target, SAMPLE_CONFIG)
		log.info('Wrote config to {path}', { path: target })
	})
