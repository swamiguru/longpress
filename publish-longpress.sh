#!/bin/bash
set -e
echo "== Pushing Builtbyswami =="
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/Builtbyswami"
git push

echo "== Building and pushing longpress =="
cd "$HOME/longpress"
npm run build
git push

echo "== Done. Verify at https://longpress.news/daily/2026-11-15 =="
