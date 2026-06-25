const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

function escapeHtml(input: string): string {
	return input.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)
}

function isSafeUrl(url: string): boolean {
	const trimmed = url.trim()
	if (/^(https?:|mailto:)/i.test(trimmed)) return true
	if (/^[/?#]/.test(trimmed)) return true
	if (/^\.\.?\//.test(trimmed)) return true
	if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true
	return false
}

export function renderInlineMarkdown(input: string): string {
	const codeSpans: string[] = []
	let s = escapeHtml(input)
	s = s.replace(/`([^`]+)`/g, (_, content: string) => {
		codeSpans.push(content)
		return `\uE000${codeSpans.length - 1}\uE001`
	})
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
		if (!isSafeUrl(url)) return text
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
	})
	s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
	s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
	s = s.replace(/\uE000(\d+)\uE001/g, (_m, i: string) => `<code>${codeSpans[Number(i)] ?? ''}</code>`)
	return s
}
