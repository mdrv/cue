// Ensures package.json version matches docs/releases/ latest release file.
const pkg = await Bun.file('package.json').json()
const version: string = pkg.version
const glob = new Bun.Glob('docs/releases/v*.md')
const releases = await glob.scan()
const latest = releases
	.map((p) => p.match(/v([\d.]+)\.md$/)?.[1] ?? '0.0.0')
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
	.at(-1)
if (!latest) process.exit(0)
if (latest !== version) {
	console.error(
		`cue/lefthook: version mismatch — package.json=${version} but latest docs/releases/ is v${latest}`,
	)
	process.exit(1)
}
process.exit(0)
