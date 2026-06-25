export const transcript = {
	meta: { title: 'Cue Demo', wpm: 160, duet: true },
	cues: [
		{
			text: 'Hello and welcome to the show!',
			duration: 3000,
			section: 'Intro',
			id: 'welcome',
			notes: 'Smile. Pause for one beat after "show".',
		},
		{
			text: 'Today we are looking at **Bun** and *Svelte*.',
			speaker: 'side',
			section: 'Intro',
			say: 'BUN',
		},
		{
			text: 'The first idea is simple: write your script as `data`.',
			duration: 4000,
			section: 'Main',
			id: 'idea',
		},
		{
			text: 'Docs: [mdrv/cue](https://github.com/anomalyco/cue) on GitHub.',
			speaker: 'side',
			duration: 3500,
			section: 'Main',
			notes: 'Gesture to the projector if it is up.',
		},
		{
			text: 'Press space to move on whenever you are ready.',
			section: 'Outro',
		},
		{
			text: 'And that is the whole demo. **Thank you!**',
			speaker: 'side',
			duration: 3000,
			section: 'Outro',
			notes: 'Hold for applause.',
		},
	],
}
