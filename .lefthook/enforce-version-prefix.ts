// Conventional Commits prefix enforcement for @mdrv/cue.
// Accepts: feat:, fix:, docs:, refactor:, perf:, test:, style:, build:, ci:, chore:, revert:, release:
// Bare releases (e.g. "v0.0.1") and merge commits are also allowed.
const PATTERN = /^(feat|fix|docs|refactor|perf|test|style|build|ci|chore|revert|release)(\(.+\))?!?: .{1,}/
const msgFile = process.argv[2]
if (!msgFile) {
	console.error('cue/lefthook: missing commit message file argument')
	process.exit(1)
}
const raw = await Bun.file(msgFile).text()
const firstLine = raw.split('\n')[0] ?? ''
if (firstLine.startsWith('Merge ') || /^v\d+\.\d+\.\d+/.test(firstLine)) process.exit(0)
if (!PATTERN.test(firstLine)) {
	console.error(
		`cue/lefthook: commit message must use Conventional Commits prefix.\n`
			+ `  got: "${firstLine}"\n`
			+ `  expected: feat: ... | fix(scope): ... | docs: ... | refactor: ... | chore: ... | etc.`,
	)
	process.exit(1)
}
process.exit(0)
