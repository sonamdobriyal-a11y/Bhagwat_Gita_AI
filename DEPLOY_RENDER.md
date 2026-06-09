# Deploy on Render

This project runs as **two Render Web Services**: a Python API (`backend/`) and a Next.js frontend (`frontend/`).

**Ollama does not work on Render** (no local model daemon). Use **Gemini** or **OpenAI** with an API key.

---

## 1. Prepare the repository

### 1.1 Commit the corpus

The API needs the Gita text at build/runtime:

```bash
git add backend/data/bhagavad_gita.pdf   # or bhagavad_gita.txt
git commit -m "Add Gita corpus for deployment"
```

### 1.2 Commit a pre-built RAG index (recommended)

Gemini free tier allows ~1000 embedding requests/day; a full ingest can take multiple days. **Build the index locally once**, then commit it:

```bash
cd backend
source .venv/bin/activate
# Ensure backend/.env has LLM_PROVIDER=gemini and GEMINI_API_KEY
python ingest.py
cd ..

git add backend/data/rag_store/bhagavad_gita.emb.pkl
git add backend/data/rag_store/bhagavad_gita.meta.json
git commit -m "Add pre-built RAG index for Render"
```

On Render, set `SKIP_INGEST=1` (default in `render.yaml`) so deploys skip ingest and use this index.

To rebuild the index on Render instead, set `SKIP_INGEST=0` and `FORCE_INGEST=1` (slow; may hit Gemini quotas).

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## 2. Create services on Render

### Option A — Blueprint (fastest)

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo.
3. Render reads `render.yaml` and creates **bhagavad-gita-api** and **bhagavad-gita-web**.
4. When prompted, enter secret env vars:
   - **API:** `GEMINI_API_KEY`, `CORS_ORIGINS` (set CORS after you know the frontend URL)
   - **Web:** `NEXT_PUBLIC_API_URL`, Firebase vars (if used), `ADMIN_PANEL_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`

### Option B — Manual (two Web Services)

#### API service

| Field | Value |
|-------|--------|
| Name | `bhagavad-gita-api` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `bash scripts/render_build.sh` |
| Start Command | `bash scripts/render_start.sh` |
| Health Check Path | `/health` |

**Environment variables:**

| Key | Value |
|-----|--------|
| `LLM_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | your key |
| `GEMINI_CHAT_MODEL` | `gemini-2.0-flash` |
| `GEMINI_EMBED_MODEL` | `gemini-embedding-001` |
| `SKIP_INGEST` | `1` |
| `RAG_STORE_DIR` | `./data/rag_store` |
| `PDF_PATH` | `./data/bhagavad_gita.pdf` |
| `CORS_ORIGINS` | `https://YOUR-FRONTEND.onrender.com` |

#### Frontend service

| Field | Value |
|-------|--------|
| Name | `bhagavad-gita-web` |
| Root Directory | `frontend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

**Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_VERSION` | `20` |
| `NEXT_PUBLIC_API_URL` | `https://bhagavad-gita-api.onrender.com` |
| `NEXT_PUBLIC_FIREBASE_*` | from Firebase Console (optional) |
| `ADMIN_PANEL_SECRET` | long random string (optional, for `/admin`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | minified JSON one line (optional, for `/admin`) |

---

## 3. Wire the two services together

1. Deploy the **API** first. Note its URL, e.g. `https://bhagavad-gita-api.onrender.com`.
2. Verify: open `https://bhagavad-gita-api.onrender.com/health`.
3. On the **API** service, set:
   ```env
   CORS_ORIGINS=https://bhagavad-gita-web.onrender.com
   ```
   (Use your actual frontend hostname.)
4. On the **Web** service, set:
   ```env
   NEXT_PUBLIC_API_URL=https://bhagavad-gita-api.onrender.com
   ```
5. **Redeploy the frontend** (Manual Deploy → Clear build cache & deploy) so `NEXT_PUBLIC_API_URL` is baked into the build.

---

## 4. Firebase (optional)

If you use Google sign-in or the admin panel:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains** → add `YOUR-FRONTEND.onrender.com`.
2. Put all `NEXT_PUBLIC_FIREBASE_*` variables on the **frontend** service only.
3. Put `ADMIN_PANEL_SECRET` and `FIREBASE_SERVICE_ACCOUNT_JSON` on the **frontend** service (server routes).

---

## 5. Smoke test

1. Open the frontend URL.
2. Go to **Dialogue** and send a message.
3. If chat works but sources are empty, the RAG index is missing — re-check step 1.2.
4. If the browser shows CORS errors, fix `CORS_ORIGINS` on the API.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails: missing corpus | Commit `backend/data/bhagavad_gita.pdf` |
| Build fails: missing index with `SKIP_INGEST=1` | Commit `.emb.pkl` and `.meta.json` (step 1.2) |
| Chat says knowledge base empty | Index not in repo or wrong `RAG_STORE_DIR` |
| Frontend calls `localhost:8000` | Set `NEXT_PUBLIC_API_URL` and redeploy frontend with cache clear |
| CORS error | Set `CORS_ORIGINS` on API to exact frontend URL (https) |
| Cold start / slow first request | Normal on Render free tier after idle |
| Gemini ingest timeout on Render build | Use committed index + `SKIP_INGEST=1` |

---

## Files added for Render

| File | Purpose |
|------|---------|
| `render.yaml` | Blueprint for both services |
| `backend/scripts/render_build.sh` | Install deps + optional ingest |
| `backend/scripts/render_start.sh` | Uvicorn on `$PORT` |
| `backend/runtime.txt` | Python version |
| `frontend/.node-version` | Node version |
