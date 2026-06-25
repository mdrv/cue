export type CueErrorCode = 'CONFIG' | 'PARSE' | 'LOAD' | 'SERVE' | 'GENERIC'

export interface CueErrorContext {
	readonly [key: string]: unknown
}

export class CueError extends Error {
	readonly code: CueErrorCode
	readonly context: CueErrorContext

	constructor(
		code: CueErrorCode,
		message: string,
		context: CueErrorContext = {},
	) {
		super(message)
		this.name = 'CueError'
		this.code = code
		this.context = context
	}

	override toString(): string {
		const ctx = Object.keys(this.context).length > 0 ? ` ${JSON.stringify(this.context)}` : ''
		return `${this.name} [${this.code}]: ${this.message}${ctx}`
	}
}

export function cueError(
	code: CueErrorCode,
	message: string,
	context?: CueErrorContext,
): CueError {
	return new CueError(code, message, context)
}
