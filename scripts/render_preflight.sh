#!/usr/bin/env bash
# Pre-flight checks before pushing to GitHub / deploying on Render.
# Usage: bash scripts/render_preflight.sh

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok=0
warn=0
fail=0

pass() { echo -e "${GREEN}✓${NC} $1"; ok=$((ok + 1)); }
note() { echo -e "${YELLOW}!${NC} $1"; warn=$((warn + 1)); }
die()  { echo -e "${RED}✗${NC} $1"; fail=$((fail + 1)); }

echo ""
echo "Bhagavad Gita AI — Render preflight"
echo "==================================="
echo ""

# --- Git ---
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  pass "Git repository detected"
  branch="$(git branch --show-current 2>/dev/null || echo unknown)"
  echo "    branch: $branch"
  if git remote get-url origin >/dev/null 2>&1; then
    pass "Git remote 'origin' configured: $(git remote get-url origin)"
  else
    note "No git remote 'origin' — add GitHub before Render: git remote add origin <url>"
  fi
else
  die "Not a git repo — run: git init && git remote add origin <github-url>"
fi

echo ""
echo "Deploy files"
echo "------------"

for f in render.yaml DEPLOY_RENDER.md backend/runtime.txt frontend/.node-version \
         backend/scripts/render_build.sh backend/scripts/render_start.sh; do
  if [[ -f "$f" ]]; then
    pass "$f"
  else
    die "Missing $f"
  fi
done

if [[ -x backend/scripts/render_build.sh && -x backend/scripts/render_start.sh ]]; then
  pass "Render scripts are executable"
else
  note "Render scripts not executable — run: chmod +x backend/scripts/render_*.sh"
fi

echo ""
echo "Corpus & RAG index (required for SKIP_INGEST=1 on Render)"
echo "---------------------------------------------------------"

PDF="backend/data/bhagavad_gita.pdf"
TXT="backend/data/bhagavad_gita.txt"
INDEX="backend/data/rag_store/bhagavad_gita.emb.pkl"
META="backend/data/rag_store/bhagavad_gita.meta.json"

if [[ -f "$PDF" ]]; then
  pass "Corpus PDF present ($(du -h "$PDF" | cut -f1))"
elif [[ -f "$TXT" ]]; then
  pass "Corpus TXT present ($(du -h "$TXT" | cut -f1))"
else
  die "Missing corpus — add backend/data/bhagavad_gita.pdf or .txt"
fi

if [[ -f "$INDEX" && -f "$META" ]]; then
  pass "RAG index present (emb $(du -h "$INDEX" | cut -f1), meta $(du -h "$META" | cut -f1))"
else
  die "RAG index missing — run: cd backend && python ingest.py"
fi

echo ""
echo "Git tracking (must be committed & pushed for Render)"
echo "----------------------------------------------------"

check_tracked() {
  local path="$1"
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
      pass "Tracked in git: $path"
    elif [[ -f "$path" ]]; then
      note "NOT tracked yet — run: git add $path"
    fi
  fi
}

check_tracked "render.yaml"
check_tracked "backend/data/bhagavad_gita.pdf"
check_tracked "backend/data/bhagavad_gita.txt"
check_tracked "$INDEX"
check_tracked "$META"

echo ""
echo "Secrets (never commit these)"
echo "-----------------------------"

if [[ -f backend/.env ]]; then
  pass "backend/.env exists locally"
  if git ls-files --error-unmatch backend/.env >/dev/null 2>&1; then
    die "backend/.env is tracked in git — remove it immediately (secrets leak risk)"
  else
    pass "backend/.env is not tracked (good)"
  fi
  # Check provider without printing keys
  if grep -q '^LLM_PROVIDER=gemini' backend/.env 2>/dev/null; then
    pass "LLM_PROVIDER=gemini (works on Render)"
  elif grep -q '^LLM_PROVIDER=openai' backend/.env 2>/dev/null; then
    pass "LLM_PROVIDER=openai (works on Render)"
  elif grep -q '^LLM_PROVIDER=ollama' backend/.env 2>/dev/null; then
    note "LLM_PROVIDER=ollama locally — set LLM_PROVIDER=gemini on Render (Ollama won't run there)"
  fi
  if grep -q '^GEMINI_API_KEY=.\+' backend/.env 2>/dev/null; then
    pass "GEMINI_API_KEY is set locally (also add it in Render dashboard)"
  elif grep -q '^LLM_PROVIDER=gemini' backend/.env 2>/dev/null; then
    die "LLM_PROVIDER=gemini but GEMINI_API_KEY is empty in backend/.env"
  fi
else
  note "No backend/.env — create from backend/.env.example for local dev"
fi

if [[ -f frontend/.env.local ]]; then
  if git ls-files --error-unmatch frontend/.env.local >/dev/null 2>&1; then
    die "frontend/.env.local is tracked in git — remove it (secrets leak risk)"
  else
    pass "frontend/.env.local not tracked (good)"
  fi
fi

echo ""
echo "Local build smoke test"
echo "----------------------"

if [[ -f backend/.venv/bin/activate ]]; then
  # shellcheck disable=SC1091
  source backend/.venv/bin/activate
  if SKIP_INGEST=1 bash backend/scripts/render_build.sh >/dev/null 2>&1; then
    pass "API render_build.sh succeeds with SKIP_INGEST=1"
  else
    note "API render_build.sh failed — run: cd backend && SKIP_INGEST=1 bash scripts/render_build.sh"
  fi
else
  note "No backend/.venv — optional: python -m venv .venv && pip install -r requirements.txt"
fi

if [[ -d frontend/node_modules ]]; then
  if (cd frontend && npm run build >/dev/null 2>&1); then
    pass "Frontend npm run build succeeds"
  else
    note "Frontend build failed — run: cd frontend && npm run build"
  fi
else
  note "Frontend node_modules missing — run: cd frontend && npm install"
fi

echo ""
echo "Render env vars to set in dashboard"
echo "-----------------------------------"
echo "  API:  GEMINI_API_KEY, CORS_ORIGINS=https://<your-web>.onrender.com"
echo "  Web:  NEXT_PUBLIC_API_URL=https://<your-api>.onrender.com"
echo "        (+ Firebase / ADMIN_PANEL_SECRET if you use auth/admin)"
echo ""
echo "After web deploy: Manual Deploy → Clear build cache (NEXT_PUBLIC_* is build-time)"
echo ""

echo "Summary: ${GREEN}${ok} passed${NC}, ${YELLOW}${warn} warnings${NC}, ${RED}${fail} failed${NC}"
echo ""

if [[ $fail -gt 0 ]]; then
  echo "Fix failed checks before deploying."
  exit 1
fi

if [[ $warn -gt 0 ]]; then
  echo "Warnings present — review above, then push and connect Render."
  exit 0
fi

echo "All checks passed. Ready to: git push && Render → New → Blueprint"
exit 0
