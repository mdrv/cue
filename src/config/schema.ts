import { z } from 'zod'
import { type Anchor, DEFAULT_CONFIG, LIGHT_THEME } from './types.ts'

const themeSchema = z.object({
	background: z.string(),
	focus: z.string(),
	dim: z.string(),
	fade: z.string(),
	accent: z.string(),
})

const speakerSchema = z.object({
	column: z.enum(['left', 'right']),
	color: z.string().optional(),
})

const ANCHOR_SHORTHANDS: Record<string, Anchor> = {
	top: 'top-center',
	bottom: 'bottom-center',
	left: 'center-left',
	right: 'center-right',
	center: 'center',
}

const anchorInputSchema = z
	.union([
		z.enum([
			'top-left',
			'top-center',
			'top-right',
			'center-left',
			'center',
			'center-right',
			'bottom-left',
			'bottom-center',
			'bottom-right',
		]),
		z.enum(['top', 'bottom', 'left', 'right', 'center']),
	])
	.transform((a) => ANCHOR_SHORTHANDS[a] ?? (a as Anchor))

export const configSchema = z.object({
	port: z.number().int().min(0).max(65535).default(DEFAULT_CONFIG.port),
	open: z.boolean().default(DEFAULT_CONFIG.open),
	wpm: z.number().int().positive().default(DEFAULT_CONFIG.wpm),
	duet: z.boolean().default(DEFAULT_CONFIG.duet),
	fontSize: z.number().int().positive().default(DEFAULT_CONFIG.fontSize),
	markdown: z.boolean().default(DEFAULT_CONFIG.markdown),
	anchor: anchorInputSchema.default(DEFAULT_CONFIG.anchor),
	flow: z.enum(['vertical', 'horizontal']).default(DEFAULT_CONFIG.flow),
	reverse: z.boolean().default(DEFAULT_CONFIG.reverse),
	lookBehind: z.number().int().min(0).max(10).default(DEFAULT_CONFIG.lookBehind),
	lookAhead: z.number().int().min(0).max(10).default(DEFAULT_CONFIG.lookAhead),
	chrome: z.enum(['top', 'bottom']).default(DEFAULT_CONFIG.chrome),
	contentWidth: z.number().int().min(0).max(5000).default(DEFAULT_CONFIG.contentWidth),
	focusStyle: z.enum(['opacity', 'underline', 'box']).default(DEFAULT_CONFIG.focusStyle),
	theme: themeSchema.default(DEFAULT_CONFIG.theme),
	lightTheme: themeSchema.default(LIGHT_THEME),
	speakers: z.record(z.string(), speakerSchema).default(DEFAULT_CONFIG.speakers),
})

export type CueConfigInput = z.input<typeof configSchema>

const themePatchSchema = themeSchema.partial()
const speakerPatchSchema = speakerSchema.partial()

export const configPatchSchema = z.object({
	port: z.number().int().min(0).max(65535).optional(),
	open: z.boolean().optional(),
	wpm: z.number().int().positive().optional(),
	duet: z.boolean().optional(),
	fontSize: z.number().int().positive().optional(),
	markdown: z.boolean().optional(),
	anchor: anchorInputSchema.optional(),
	flow: z.enum(['vertical', 'horizontal']).optional(),
	reverse: z.boolean().optional(),
	lookBehind: z.number().int().min(0).max(10).optional(),
	lookAhead: z.number().int().min(0).max(10).optional(),
	chrome: z.enum(['top', 'bottom']).optional(),
	contentWidth: z.number().int().min(0).max(5000).optional(),
	focusStyle: z.enum(['opacity', 'underline', 'box']).optional(),
	theme: themePatchSchema.optional(),
	lightTheme: themePatchSchema.optional(),
	speakers: z.record(z.string(), speakerPatchSchema).optional(),
})

export type CueConfigPatch = z.infer<typeof configPatchSchema>
