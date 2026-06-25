import { type BunFile } from 'bun'

const openers: Record<string, string[]> = {
	darwin: ['open'],
	linux: ['xdg-open', 'gio', 'wslview'],
	win32: ['cmd', '/c', 'start'],
}

export async function openBrowser(url: string): Promise<boolean> {
	const args = openers[process.platform]
	if (!args) return false
	for (const bin of process.platform === 'win32' ? [args[0]!] : args) {
		const argv = process.platform === 'win32' ? [...args, url] : [bin, url]
		try {
			const proc = Bun.spawn({ cmd: argv, stdout: 'ignore', stderr: 'ignore' })
			const code = await proc.exited
			if (code === 0) return true
		} catch {
			// try next opener
		}
	}
	return false
}

export function htmlResponse(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: { 'content-type': 'text/html; charset=utf-8' },
	})
}

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	})
}

export function fileResponse(file: BunFile): Response {
	return new Response(file)
}
