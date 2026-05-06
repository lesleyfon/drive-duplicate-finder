#!/usr/bin/env bash
# Run this from the repo root after authenticating with: gh auth login
# Usage: bash specs/create-github-issues.sh

set -e

REPO="lesleyfon/drive-duplicate-finder"

echo "Creating GitHub issues for feature specs..."

gh issue create \
  --repo "$REPO" \
  --title "feat: Folder-scoped scanning" \
  --label "enhancement" \
  --body "$(cat specs/01-folder-scoped-scanning.md)"

echo "✓ Issue 1 created: Folder-scoped scanning"

gh issue create \
  --repo "$REPO" \
  --title "feat: Incremental / cached scans" \
  --label "enhancement" \
  --body "$(cat specs/02-incremental-cached-scans.md)"

echo "✓ Issue 2 created: Incremental / cached scans"

gh issue create \
  --repo "$REPO" \
  --title "feat: Export scan results to CSV" \
  --label "enhancement" \
  --body "$(cat specs/03-export-to-csv.md)"

echo "✓ Issue 3 created: Export to CSV"

gh issue create \
  --repo "$REPO" \
  --title "feat: In-app restore (Recently Deleted view)" \
  --label "enhancement" \
  --body "$(cat specs/04-in-app-restore.md)"

echo "✓ Issue 4 created: In-app restore"

echo ""
echo "All 4 issues created. View them at: https://github.com/$REPO/issues"
