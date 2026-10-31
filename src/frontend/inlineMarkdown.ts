const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

export function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch)
}

export function isSafeUrl(url: string): boolean {
	const trimmed = url.trim()
	if (/^(https?:|mailto:)/i.test(trimmed)) return true
	if (/^[/?#]/.test(trimmed)) return true
	if (/^\.\.?\//.test(trimmed)) return true
	if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true
	return false
}

export function renderInlineMarkdown(text: string): string {
	const codes: string[] = []
	let out = text.replace(/`([^`]+)`/g, (_m, code: string) => {
		codes.push(code)
		return `\uE000${codes.length - 1}\uE001`
	})
	out = escapeHtml(out)
	out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
	out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
	out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
		if (!isSafeUrl(url)) return label
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
	})
	out = out.replace(/\uE000(\d+)\uE001/g, (_m, i: string) => `<code>${codes[Number(i)] ?? ''}</code>`)
	return out
}

export function renderText(text: string, markdown: boolean): string {
	if (markdown === false) return escapeHtml(text)
	return renderInlineMarkdown(text)
}
