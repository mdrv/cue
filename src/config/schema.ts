import { z } from 'zod'
import { DEFAULT_CONFIG, LIGHT_THEME } from './types.ts'

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

export const configSchema = z.object({
	port: z.number().int().min(0).max(65535).default(DEFAULT_CONFIG.port),
	open: z.boolean().default(DEFAULT_CONFIG.open),
	wpm: z.number().int().positive().default(DEFAULT_CONFIG.wpm),
	duet: z.boolean().default(DEFAULT_CONFIG.duet),
	fontSize: z.number().int().positive().default(DEFAULT_CONFIG.fontSize),
	markdown: z.boolean().default(DEFAULT_CONFIG.markdown),
	anchor: z.enum(['top', 'bottom']).default(DEFAULT_CONFIG.anchor),
	theme: themeSchema.default(DEFAULT_CONFIG.theme),
	lightTheme: themeSchema.default(LIGHT_THEME),
	speakers: z.record(z.string(), speakerSchema).default(DEFAULT_CONFIG.speakers),
})

export type CueConfigInput = z.input<typeof configSchema>
