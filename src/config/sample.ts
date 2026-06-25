export const SAMPLE_CONFIG = `import { defineConfig } from '@mdrv/cue'

export default defineConfig({
  // 0 = pick a free port automatically. Set a fixed port to bookmark it.
  port: 0,
  // Open the default browser when the prompter starts.
  open: true,
  // Fallback words-per-minute used only when a cue omits \`duration\` and you
  // pass --estimate. Cues without duration otherwise wait for a keypress.
  wpm: 160,
  // Force dual-column layout regardless of the transcript's own setting.
  duet: false,
  // Base focus font size in pixels.
  fontSize: 48,
  theme: {
    background: '#0b0d12',
    focus: '#f5f7fb',
    dim: '#6b7280',
    fade: '#2b313b',
    accent: '#7dd3fc',
  },
  speakers: {
    main: { column: 'left' },
    side: { column: 'right', color: '#fca5a5' },
  },
})
`
