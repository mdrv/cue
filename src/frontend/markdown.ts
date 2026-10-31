function isSafeUrl(url: string): boolean {
	const trimmed = url.trim()
	if (/^(https?:|mailto:)/i.test(trimmed)) return true
	if (/^[/?#]/.test(trimmed)) return true
	if (/^\.\.?\//.test(trimmed)) return true
	if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true
	return false
}

const UNSAFE_ELEMENTS = 'script, style, iframe, object, embed, form'

const sanitize = new HTMLRewriter()
	.on(UNSAFE_ELEMENTS, {
		element(el) {
			el.remove()
		},
	})
	.on('*', {
		element(el) {
			for (const [name] of el.attributes) {
				if (name.toLowerCase().startsWith('on')) el.removeAttribute(name)
			}
		},
	})
	.on('[href], [src]', {
		element(el) {
			for (const attr of ['href', 'src']) {
				const value = el.getAttribute(attr)
				if (value !== null && !isSafeUrl(value)) el.removeAttribute(attr)
			}
		},
	})
	.on('a', {
		element(el) {
			const href = el.getAttribute('href')
			if (href === null || !isSafeUrl(href)) return
			el.setAttribute('target', '_blank')
			el.setAttribute('rel', 'noopener noreferrer')
		},
	})

export async function renderMarkdown(input: string): Promise<string> {
	const html = Bun.markdown.html(input, { noHtmlBlocks: true, noHtmlSpans: true })
	return await sanitize.transform(new Response(html)).text()
}
