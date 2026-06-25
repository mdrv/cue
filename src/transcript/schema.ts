import { z } from 'zod'
import { DEFAULT_SPEAKER, DEFAULT_WPM } from './types.ts'

export const cueSchema = z.object({
	text: z.string().min(1, 'cue.text must be a non-empty string'),
	duration: z.number().int().positive('cue.duration must be a positive integer (ms)').optional(),
	speaker: z.string().min(1).optional(),
})

export const transcriptMetaSchema = z
	.object({
		title: z.string().optional(),
		wpm: z.number().int().positive().optional(),
		duet: z.boolean().optional(),
	})
	.optional()

// Authors may export either a bare array of cues or a { meta, cues } object.
export const transcriptSchema = z
	.union([
		z.object({
			meta: transcriptMetaSchema,
			cues: z.array(cueSchema).min(1, 'transcript must contain at least one cue'),
		}),
		z.array(cueSchema).min(1, 'transcript must contain at least one cue'),
	])
	.transform((value) => {
		const meta = Array.isArray(value) ? {} : value.meta ?? {}
		const cues = Array.isArray(value) ? value : value.cues
		return {
			meta: {
				title: meta?.title,
				wpm: meta?.wpm ?? DEFAULT_WPM,
				duet: meta?.duet ?? false,
			},
			cues: cues.map((c) => ({
				text: c.text,
				duration: c.duration,
				speaker: c.speaker ?? DEFAULT_SPEAKER,
			})),
		}
	})

export type ParsedTranscript = z.infer<typeof transcriptSchema>
export type ParsedCue = z.infer<typeof cueSchema>
