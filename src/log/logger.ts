import { configure, getConsoleSink, type LogLevel } from '@logtape/logtape'
import { getPrettyFormatter } from '@logtape/pretty'

let initialized = false

export async function initLogger(level: LogLevel = 'info'): Promise<void> {
	if (initialized) return
	await configure({
		reset: true,
		sinks: {
			console: getConsoleSink({ formatter: getPrettyFormatter({ colors: true }) }),
		},
		loggers: [
			{ category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['console'] },
			{ category: ['cue'], lowestLevel: level, sinks: ['console'] },
		],
	})
	initialized = true
}

export { getLogger } from '@logtape/logtape'
