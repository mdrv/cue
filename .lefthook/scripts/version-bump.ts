#!/usr/bin/env bun
// Set package.json version to (HEAD commit version + 1).
// The commit message is the source of truth — amend keeps the same version,
// so pkg stays consistent without amend detection.
// Package paths: .lefthook/version-files.jsonc (default: ["package.json"])
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

function getVersionFiles(): string[] {
	try {
		const files = Bun.JSONC.parse(readFileSync('.lefthook/version-files.jsonc', 'utf-8'))
		if (Array.isArray(files) && files.length > 0) return files
	} catch {}
	return ['package.json']
}

function bumpVersion(version: string): string {
	const [yym, minor, commit] = version.split('.').map(Number)
	return `${yym}.${minor}.${commit + 1}`
}

const files = getVersionFiles()

// Derive the committed version from HEAD's subject (ground truth).
const committedVersion: string = (() => {
	try {
		const subject = execSync('git log -1 --pretty=%s', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
		const match = subject.match(/^v(\d+\.\d+\.\d+)/)
		if (match) return match[1]
	} catch {}
	return JSON.parse(readFileSync(files[0], 'utf-8')).version
})()

const nextVersion = bumpVersion(committedVersion)

let updated = 0
for (const filePath of files) {
	if (!existsSync(filePath)) {
		console.warn(`[version] skip ${filePath} (not found)`)
		continue
	}
	const pkg = JSON.parse(readFileSync(filePath, 'utf-8'))
	pkg.version = nextVersion
	writeFileSync(filePath, JSON.stringify(pkg, null, '\t') + '\n', 'utf-8')
	updated++
}
console.log(`[version] v${committedVersion} → ${nextVersion} (${updated}/${files.length} files)`)
