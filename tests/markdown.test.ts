import { describe, expect, test } from 'bun:test'
import { escapeHtml, isSafeUrl, renderInlineMarkdown, renderText } from '../src/frontend/inlineMarkdown.ts'

describe('markdown', () => {
	test('escapes raw html', () => {
		expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;')
	})

	test('blocks unsafe link schemes', () => {
		expect(isSafeUrl('javascript:alert(1)')).toBe(false)
		expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false)
		expect(isSafeUrl('data:text/html,x')).toBe(false)
		expect(isSafeUrl('https://example.com')).toBe(true)
		expect(isSafeUrl('mailto:a@b.c')).toBe(true)
		expect(isSafeUrl('/local/path')).toBe(true)
		expect(isSafeUrl('../rel')).toBe(true)
	})

	test('renders inline markdown', () => {
		expect(renderInlineMarkdown('**bold** *em*')).toBe('<strong>bold</strong> <em>em</em>')
		expect(renderInlineMarkdown('`code`')).toBe('<code>code</code>')
		expect(renderInlineMarkdown('[x](https://e.com)')).toBe(
			'<a href="https://e.com" target="_blank" rel="noopener noreferrer">x</a>',
		)
	})

	test('drops unsafe links but keeps text', () => {
		expect(renderInlineMarkdown('[x](javascript:alert(1))')).toBe('x)')
	})

	test('renderText respects the markdown flag', () => {
		expect(renderText('<b>hi</b>', false)).toBe('&lt;b&gt;hi&lt;/b&gt;')
		expect(renderText('**hi**', true)).toBe('<strong>hi</strong>')
	})
})
