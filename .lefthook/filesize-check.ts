// Rejects files larger than MAX_BYTES to keep the repo lean.
const MAX_BYTES = 512 * 1024 // 512 KiB
const staged = await new Bun.Glob('.').scan({ onlyFiles: false })
let offender = ''
// Use git diff --cached --name-only for the authoritative staged list.
const { stdout } = Bun.spawnSync(['git', 'diff', '--cached', '--name-only'], { stdout: 'pipe' })
const files = stdout.toString().trim().split('\n').filter(Boolean)
for (const f of files) {
	try {
		const stat = await Bun.file(f).stat()
		if (stat && stat.size > MAX_BYTES) {
			offender = `${f} (${(stat.size / 1024).toFixed(0)} KiB)`
			break
		}
	} catch {
		// deleted or binary — ignore
	}
}
void staged
if (offender) {
	console.error(`cue/lefthook: file exceeds ${MAX_BYTES / 1024} KiB limit: ${offender}`)
	process.exit(1)
}
process.exit(0)
