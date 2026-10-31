import { cueError } from '../errors/index.ts'
import { configPatchSchema, type CueConfigPatch } from './schema.ts'
import type { CueConfig } from './types.ts'

export function mergeConfigPatch(base: CueConfig, patch: CueConfigPatch): CueConfig {
	return {
		port: patch.port ?? base.port,
		open: patch.open ?? base.open,
		wpm: patch.wpm ?? base.wpm,
		duet: patch.duet ?? base.duet,
		fontSize: patch.fontSize ?? base.fontSize,
		markdown: patch.markdown ?? base.markdown,
		anchor: patch.anchor ?? base.anchor,
		flow: patch.flow ?? base.flow,
		reverse: patch.reverse ?? base.reverse,
		lookBehind: patch.lookBehind ?? base.lookBehind,
		lookAhead: patch.lookAhead ?? base.lookAhead,
		chrome: patch.chrome ?? base.chrome,
		contentWidth: patch.contentWidth ?? base.contentWidth,
		focusStyle: patch.focusStyle ?? base.focusStyle,
		theme: { ...base.theme, ...withoutUndefined(patch.theme) },
		lightTheme: { ...base.lightTheme, ...withoutUndefined(patch.lightTheme) },
		speakers: mergeSpeakers(base.speakers, patch.speakers),
	}
}

export function parseConfigPatch(raw: unknown, source: string): CueConfigPatch {
	const result = configPatchSchema.safeParse(raw)
	if (!result.success) {
		throw cueError('CONFIG', `Invalid config exported by ${source}`, {
			file: source,
			issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
		})
	}
	return result.data
}

function withoutUndefined<T extends object>(value: T | undefined): Partial<T> {
	if (!value) return {}
	const out: Partial<T> = {}
	for (const [k, v] of Object.entries(value)) {
		if (v !== undefined) out[k as keyof T] = v as T[keyof T]
	}
	return out
}

function mergeSpeakers(
	base: CueConfig['speakers'],
	patch: CueConfigPatch['speakers'],
): CueConfig['speakers'] {
	const merged: CueConfig['speakers'] = { ...base }
	for (const [name, entry] of Object.entries(patch ?? {})) {
		const clean = withoutUndefined(entry)
		const prev = merged[name]
		const column = clean.column ?? prev?.column
		if (!column) continue
		const color = clean.color ?? prev?.color
		merged[name] = color === undefined ? { column } : { column, color }
	}
	return merged
}
