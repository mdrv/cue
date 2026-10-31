import { expect, test } from 'bun:test'
import { renderMarkdown } from '../src/frontend/markdown.ts'

test('renderMarkdown neutralizes raw HTML', async () => {
	const out = await renderMarkdown('<script>alert(1)</script>')
	expect(out).not.toContain('<script')
})

test('renderMarkdown renders bold and italic', async () => {
	expect(await renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
	expect(await renderMarkdown('*italic*')).toContain('<em>italic</em>')
	expect(await renderMarkdown('**a** and *b*')).toContain('<strong>a</strong> and <em>b</em>')
})

test('renderMarkdown renders inline code', async () => {
	expect(await renderMarkdown('use `foo`')).toContain('<code>foo</code>')
})

test('renderMarkdown renders links with safe href', async () => {
	const out = await renderMarkdown('[Bun](https://bun.sh)')
	expect(out).toContain('<a href="https://bun.sh"')
	expect(out).toContain('rel="noopener noreferrer"')
})

test('renderMarkdown blocks unsafe link schemes', async () => {
	expect(await renderMarkdown('[x](javascript:alert)')).not.toContain('<a ')
	expect(await renderMarkdown('[x](data:foo)')).not.toContain('<a ')
})

test('renderMarkdown allows relative links', async () => {
	expect(await renderMarkdown('[a](/path)')).toContain('<a href="/path"')
	expect(await renderMarkdown('[a](./relative)')).toContain('<a href="./relative"')
	expect(await renderMarkdown('[a](#anchor)')).toContain('<a href="#anchor"')
})

test('renderMarkdown supports GFM tables', async () => {
	const out = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |')
	expect(out).toContain('<table>')
	expect(out).toContain('<td>1</td>')
})

test('renderMarkdown leaves plain text untouched', async () => {
	expect(await renderMarkdown('just a plain cue')).toContain('just a plain cue')
})
