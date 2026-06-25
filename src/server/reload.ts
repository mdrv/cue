import { getLogger } from '../log/logger.ts'

const log = getLogger(['cue', 'server'])

type ReloadListener = (payload: unknown) => void

export class ReloadHub {
	private readonly listeners = new Set<ReloadListener>()
	private count = 0

	subscribe(fn: ReloadListener): () => void {
		this.listeners.add(fn)
		this.count++
		log.debug('SSE client subscribed ({total} total)', { total: this.count })
		return () => {
			this.listeners.delete(fn)
			this.count = Math.max(0, this.count - 1)
			log.debug('SSE client unsubscribed ({total} total)', { total: this.count })
		}
	}

	broadcast(payload: unknown): void {
		for (const fn of this.listeners) fn(payload)
	}

	get size(): number {
		return this.count
	}
}

export function sseResponse(hub: ReloadHub): Response {
	let streamCancel: (() => void) | undefined
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const enc = new TextEncoder()
			const send = (event: string, data: unknown) => {
				controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
			}
			send('hello', { ts: Date.now() })
			const off = hub.subscribe((payload) => send('reload', payload))
			const keep = setInterval(() => {
				try {
					controller.enqueue(enc.encode(`: ping\n\n`))
				} catch {
					// controller closed
				}
			}, 15_000)
			streamCancel = () => {
				clearInterval(keep)
				off()
			}
		},
		cancel() {
			streamCancel?.()
		},
	})
	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-store',
			connection: 'keep-alive',
		},
	})
}
