#!/usr/bin/env bash
# Render start command — listens on Render's dynamic PORT.
set -euo pipefail

cd "$(dirname "$0")/.."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
