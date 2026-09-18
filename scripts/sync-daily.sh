#!/usr/bin/env bash
# The daily publish step. As of 18 Sept this is run directly by the
# "Longpress daily social" task on the Mac, as its own last step right after
# it commits the roundup to the builtbyswami automation clone - not by a
# GitHub Actions cron. (.github/workflows/sync-daily.yml still exists as a
# manual-only backstop - see the comment at the top of that file.)
#
# Pulls the automation clone, re-imports into Long Press, builds, commits and
# pushes. Idempotent - safe to run twice, and a no-op if there is nothing new.
# No `npm ci`/`npm install` here on purpose: it builds with whatever is
# already in node_modules on this machine, so a lockfile edit landing from
# elsewhere (AI Studio has deleted package-lock.json before) can't block this
# path the way it blocks the GitHub Actions one.
#
#   ./scripts/sync-daily.sh [path-to-builtbyswami-repo]
#
# The daily task calls this explicitly as:
#   ./scripts/sync-daily.sh "$HOME/Documents/GitHub/Builtbyswami"
# (the automation clone it just committed to - NOT this script's own
# default below, which points at the Cowork-connected clone instead).

set -euo pipefail
SRC="${1:-$HOME/Builtbyswami-website}"
LP="$(cd "$(dirname "$0")/.." && pwd)"

[ -d "$SRC/src/content/social" ] || { echo "No social content at $SRC" >&2; exit 1; }

# --autostash keeps a dirty working tree (e.g. an in-progress vercel.json
# change) from blocking the pull. A failed pull is a warning, not fatal -
# the import still runs against whatever is on disk.
echo "-> pulling $SRC"
if ! git -C "$SRC" pull --ff-only --autostash; then
  echo "   ! pull failed - continuing with the content already on disk" >&2
fi

echo "-> importing into Long Press"
cd "$LP"
node scripts/import-roundup.mjs "$SRC"

if git diff --quiet -- src/content/daily && \
   [ -z "$(git ls-files --others --exclude-standard -- src/content/daily)" ]; then
  echo "-> nothing new. Done."
  exit 0
fi

NEW=$(git status --porcelain -- src/content/daily | wc -l | tr -d ' ')
echo "-> $NEW brief(s) changed; building"
npm run build

git add -A
git commit -m "Daily sync: $(date +%Y-%m-%d)"
git push
echo "-> published."
