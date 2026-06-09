# Bhagavad Gita AI (RAG web app)

Professional chat UI (Next.js) + **RAG API** (FastAPI) that answers from **your** Bhagavad Gita PDF or plain-text file.

## LLM options (choose one)

### Free local (default): [Ollama](https://ollama.com)

No API key. Install Ollama, pull models, run ingest.

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

Set in `backend/.env`:

```env
LLM_PROVIDER=ollama
OLLAMA_CHAT_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text
```

### Cloud: OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### Cloud: Google Gemini

Get an API key at [Google AI Studio](https://aistudio.google.com/apikey).

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_EMBED_MODEL=gemini-embedding-001
```

Re-run **`python ingest.py`** whenever you switch `LLM_PROVIDER` or embedding/chat model names (vector dimensions differ).

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind — streaming chat, optional “retrieval” panel.
- **Backend**: FastAPI, SSE streaming, RAG over a local index (`backend/data/rag_store/`).

## Prerequisites

- Python 3.11+
- Node.js 20+
- **Either** Ollama, **or** an OpenAI API key, **or** a Gemini API key

## 1. Corpus

Place **either** `backend/data/bhagavad_gita.pdf` or `backend/data/bhagavad_gita.txt` (if no PDF).

## 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env (Ollama defaults or OpenAI)
python ingest.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**.

## Docker

Running Ollama inside Docker Compose is possible but not included here; run Ollama on the host and point `OLLAMA_BASE_URL` at `http://host.docker.internal:11434` (macOS/Windows) if the API runs in a container.

## Deploy on Render

See **[DEPLOY_RENDER.md](./DEPLOY_RENDER.md)** for a step-by-step guide (Blueprint + manual setup).

Quick summary: deploy **two Web Services** (API + frontend), use **Gemini or OpenAI** (not Ollama), commit the **corpus + pre-built RAG index**, set `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS`, then redeploy the frontend.

## Environment (backend)

| Variable | Purpose |
|----------|---------|
| `LLM_PROVIDER` | `ollama` (default), `openai`, or `gemini` |
| `OLLAMA_BASE_URL` | Default `http://127.0.0.1:11434` |
| `OLLAMA_CHAT_MODEL` / `OLLAMA_EMBED_MODEL` | Local model names |
| `OPENAI_API_KEY` | Required when `LLM_PROVIDER=openai` |
| `GEMINI_API_KEY` | Required when `LLM_PROVIDER=gemini` |
| `GEMINI_CHAT_MODEL` / `GEMINI_EMBED_MODEL` | Default `gemini-2.0-flash` / `gemini-embedding-001` |
| `RAG_STORE_DIR` | Index directory |
| `PDF_PATH` | Primary PDF path |
| `NEXT_PUBLIC_API_URL` | API URL for the browser (frontend) |

## Notes

- Not legal or medical advice.
- Re-run `python ingest.py` after changing the PDF/TXT, chunk settings, or embedding provider/model.
