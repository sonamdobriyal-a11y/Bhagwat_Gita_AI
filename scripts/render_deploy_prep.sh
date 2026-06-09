#!/usr/bin/env bash
# One-command deploy prep: verify, stage deploy files, show git status.
# Usage: bash scripts/render_deploy_prep.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Running preflight checks…"
echo ""
bash scripts/render_preflight.sh
preflight=$?

echo ""
echo "Staging recommended deploy files…"
echo ""

git add render.yaml DEPLOY_RENDER.md README.md .gitignore 2>/dev/null || true
git add backend/runtime.txt backend/scripts/ backend/Dockerfile backend/Dockerfile 2>/dev/null || true
git add backend/scripts/render_build.sh backend/scripts/render_start.sh 2>/dev/null || true
git add frontend/.node-version 2>/dev/null || true

if [[ -f backend/data/bhagavad_gita.pdf ]]; then
  git add backend/data/bhagavad_gita.pdf
fi
if [[ -f backend/data/bhagavad_gita.txt ]]; then
  git add backend/data/bhagavad_gita.txt
fi
if [[ -f backend/data/rag_store/bhagavad_gita.emb.pkl ]]; then
  git add backend/data/rag_store/bhagavad_gita.emb.pkl
fi
if [[ -f backend/data/rag_store/bhagavad_gita.meta.json ]]; then
  git add backend/data/rag_store/bhagavad_gita.meta.json
fi

git add scripts/render_preflight.sh scripts/render_deploy_prep.sh 2>/dev/null || true

echo "Git status:"
echo "-----------"
git status --short 2>/dev/null || echo "(not a git repo)"

echo ""
echo "Next steps:"
echo "  1. git commit -m \"Prepare Render deployment\""
echo "  2. git push -u origin main"
echo "  3. Render Dashboard → New → Blueprint → connect repo"
echo "  4. Set GEMINI_API_KEY, then CORS + NEXT_PUBLIC_API_URL after URLs are known"
echo ""
echo "Full guide: DEPLOY_RENDER.md"

exit $preflight
