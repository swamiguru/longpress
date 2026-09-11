#!/usr/bin/env bash
# Bridge until the daily pipeline writes to Long Press directly.
#
# The roundup runner still commits to the builtbyswami repo each morning.
# This pulls that, re-imports into Long Press, and publishes. Idempotent -
# safe to run twice, and a no-op if there is nothing new.
#
#   ./scripts/sync-daily.sh [path-to-builtbyswami-repo]

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
