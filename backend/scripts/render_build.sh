#!/usr/bin/env bash
# Render build step for the FastAPI API service.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing Python dependencies…"
pip install -r requirements.txt

INDEX="data/rag_store/bhagavad_gita.emb.pkl"
META="data/rag_store/bhagavad_gita.meta.json"
PDF="data/bhagavad_gita.pdf"
TXT="data/bhagavad_gita.txt"

if [[ ! -f "$PDF" && ! -f "$TXT" ]]; then
  echo "ERROR: Missing corpus. Commit backend/data/bhagavad_gita.pdf (or .txt) to the repo."
  exit 1
fi

if [[ "${SKIP_INGEST:-0}" == "1" ]]; then
  if [[ ! -f "$INDEX" || ! -f "$META" ]]; then
    echo "ERROR: SKIP_INGEST=1 but RAG index is missing."
    echo "Run ingest locally, then commit:"
    echo "  backend/data/rag_store/bhagavad_gita.emb.pkl"
    echo "  backend/data/rag_store/bhagavad_gita.meta.json"
    exit 1
  fi
  echo "SKIP_INGEST=1 — using committed RAG index."
  exit 0
fi

if [[ "${FORCE_INGEST:-0}" != "1" && -f "$INDEX" && -f "$META" ]]; then
  echo "RAG index found — skipping ingest (set FORCE_INGEST=1 to rebuild)."
  exit 0
fi

echo "Running ingest (may take a while on Gemini free tier)…"
python ingest.py
