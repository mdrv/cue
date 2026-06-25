#!/usr/bin/env nu
# Validates v{YY}{M}.{MINOR}.{COMMIT} prefix, ensures the version is higher than
# (or equal to, for amend) the PREVIOUS COMMIT, then syncs package files to the
# message version and stages them. Allows fixup!/squash! for `rebase --autosquash`.
#
# The baseline is HEAD (the previous commit), NOT package.json — which may already
# carry a staged/appended version. Only pre-commit could stage into the current
# commit, but it has no access to the message.
#
# NOTE: git locks the commit tree BEFORE commit-msg runs, so the sync lands in the
# NEXT commit (off-by-one: commit N's tree holds pkg@(N-1)). Unavoidable with hooks.
#
# Package paths: .lefthook/version-files.jsonc (default: ["package.json"])

def pkg_files [] {
  try {
    let files = (open --raw .lefthook/version-files.jsonc | from json)
    if ($files | length) > 0 { $files } else { ['package.json'] }
  } catch {
    ['package.json']
  }
}

# Compare dotted versions: true if a > b (element-wise on integer parts).
def higher [a: string b: string] {
  ($a | split row '.' | each { into int }) > ($b | split row '.' | each { into int })
}

def main [input_file: string] {
  if ($input_file | str length) == 0 {
    print '❌ No input file provided'
    exit 1
  }

  let first_line = (open --raw $input_file | lines | first)
  let files = (pkg_files)

  # Allow fixup!/squash! commits (used by `git rebase --autosquash`).
  if ($first_line =~ '^(fixup|squash)!') {
    exit 0
  }

  # Previous commit's version is the baseline (not package.json).
  let head_version = (try {
    git log -1 --pretty=%s | parse --regex '^v(?P<v>\d+\.\d+\.\d+) - ' | get v.0
  } catch { null })

  # Regex: v{digits.digits.digits} - {type}: {description}
  # Types match conventional commits spec
  if not ($first_line =~ '^v(\d+\.\d+\.\d+) - (feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert): .+') {
    print ''
    print '❌ Invalid commit message format.'
    print ''
    print 'Expected: v{YY}{M}.{MINOR}.{COMMIT} - {type}: {description}'
    print ''
    print 'Valid types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert'
    print ''
    if ($head_version != null) {
      print ('  Must be higher than: v' + $head_version)
    }
    print ''
    exit 1
  }

  # Extract version from commit message
  let version = ($first_line | parse --regex '^v(?P<v>\d+\.\d+\.\d+) - ' | get v.0)

  # Enforce forward progress: reject regressions.
  # Equal is allowed (amend); higher is the normal case.
  if ($head_version != null) {
    if (higher $head_version $version) {
      print ''
      print '❌ Version regression.'
      print ''
      print ('   Previous commit: v' + $head_version)
      print ('   This commit:     v' + $version)
      print ''
      print '   Version must not be lower than the previous commit.'
      print ''
      exit 1
    }
  }

  # Sync all listed package files to the message version, preserving formatting.
  # `git add` stages the change so it lands in the next commit (clean status).
  mut synced = 0
  for f in $files {
    if not ($f | path exists) {
      print ('⚠️  skip ' + $f + ' (not found)')
      continue
    }
    let content = (open --raw $f)
    let updated = ($content | str replace --regex '("version"\s*:\s*")[^"]*(")' $"${1}($version)${2}")
    if ($updated != $content) {
      $updated | save --raw $f --force
      git add $f
      $synced = $synced + 1
      print ('[version] ' + $f + ' → v' + $version)
    }
  }

  if $synced == 0 {
    print ('✅ v' + $version + ' (package files already at this version)')
  } else {
    print ('✅ v' + $version + ' — ' + ($synced | into string) + ' file(s) synced & staged for next commit')
  }
  exit 0
}
