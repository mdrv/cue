import { expect, test } from 'bun:test'
import { renderInlineMarkdown } from '../src/frontend/markdown.ts'

test('renderInlineMarkdown escapes HTML', () => {
	expect(renderInlineMarkdown('<script>alert(1)</script>')).toBe(
		'&lt;script&gt;alert(1)&lt;/script&gt;',
	)
	expect(renderInlineMarkdown('a & b < c > d "e" \'f\'')).toBe(
		'a &amp; b &lt; c &gt; d &quot;e&quot; &#39;f&#39;',
	)
})

test('renderInlineMarkdown renders bold and italic', () => {
	expect(renderInlineMarkdown('**bold**')).toBe('<strong>bold</strong>')
	expect(renderInlineMarkdown('*italic*')).toBe('<em>italic</em>')
	expect(renderInlineMarkdown('**a** and *b*')).toBe('<strong>a</strong> and <em>b</em>')
})

test('renderInlineMarkdown renders inline code (protected from other transforms)', () => {
	expect(renderInlineMarkdown('use `*foo`')).toBe('use <code>*foo</code>')
	expect(renderInlineMarkdown('`x` and **y**')).toBe('<code>x</code> and <strong>y</strong>')
})

test('renderInlineMarkdown renders links', () => {
	expect(renderInlineMarkdown('[Bun](https://bun.sh)')).toBe(
		'<a href="https://bun.sh" target="_blank" rel="noopener noreferrer">Bun</a>',
	)
})

test('renderInlineMarkdown blocks unsafe link schemes', () => {
	expect(renderInlineMarkdown('[x](javascript:alert)')).toBe('x')
	expect(renderInlineMarkdown('[x](data:foo)')).toBe('x')
})

test('renderInlineMarkdown allows relative links', () => {
	expect(renderInlineMarkdown('[a](/path)')).toBe(
		'<a href="/path" target="_blank" rel="noopener noreferrer">a</a>',
	)
	expect(renderInlineMarkdown('[a](./relative)')).toBe(
		'<a href="./relative" target="_blank" rel="noopener noreferrer">a</a>',
	)
	expect(renderInlineMarkdown('[a](#anchor)')).toBe(
		'<a href="#anchor" target="_blank" rel="noopener noreferrer">a</a>',
	)
})

test('renderInlineMarkdown leaves plain text untouched', () => {
	expect(renderInlineMarkdown('just a plain cue')).toBe('just a plain cue')
})
