#!/usr/bin/env python3
"""
Index Bhagavad Gita text from PDF (or plain text) into a local vector index.

Embeddings come from either:
  - Ollama (free, local) — set LLM_PROVIDER=ollama and run `ollama serve`
  - OpenAI — set LLM_PROVIDER=openai and OPENAI_API_KEY
  - Gemini — set LLM_PROVIDER=gemini and GEMINI_API_KEY

Usage:
  cd backend && source .venv/bin/activate
  # data/bhagavad_gita.pdf OR data/bhagavad_gita.txt
  python ingest.py

Gemini free tier allows ~1000 embedding requests/day. If ingest stops on quota,
run the same command again later — progress is saved automatically.
"""

from __future__ import annotations

import hashlib
import os
import pickle
import re
import sys

import httpx
from openai import AuthenticationError as OpenAIAuthError
from openai import RateLimitError as OpenAIRateLimitError
from pypdf import PdfReader

from app.config import settings
from app.gemini_client import GeminiDailyQuotaError, gemini_embed_many
from app.ollama_client import ollama_ping
from app.rag_service import embed_texts_batch, save_index, stable_id


def load_text() -> list[tuple[str, int | None, str]]:
    pdf_path = settings.pdf_path
    txt_path = os.path.join(os.path.dirname(pdf_path), "bhagavad_gita.txt")

    if os.path.isfile(pdf_path):
        reader = PdfReader(pdf_path)
        out: list[tuple[str, int | None, str]] = []
        for i, page in enumerate(reader.pages):
            t = page.extract_text() or ""
            out.append((t, i + 1, os.path.basename(pdf_path)))
        return out

    if os.path.isfile(txt_path):
        with open(txt_path, encoding="utf-8") as f:
            raw = f.read()
        return [(raw, None, os.path.basename(txt_path))]

    print(
        "No corpus found. Add one of:\n"
        f"  - {pdf_path}\n"
        f"  - {txt_path}\n",
        file=sys.stderr,
    )
    sys.exit(1)


def chunk_text(text: str, page: int | None, source: str) -> list[dict]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []

    size = settings.chunk_size
    overlap = settings.chunk_overlap
    chunks: list[dict] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + size, n)
        piece = text[start:end].strip()
        if piece:
            cid = stable_id(piece, page)
            chunks.append(
                {
                    "id": cid,
                    "text": piece,
                    "page": page,
                    "source": source,
                }
            )
        if end >= n:
            break
        start = end - overlap
    return chunks


def _checkpoint_path() -> str:
    os.makedirs(settings.rag_store_dir, exist_ok=True)
    return os.path.join(settings.rag_store_dir, ".ingest_checkpoint.pkl")


def _corpus_fingerprint(chunks: list[dict]) -> str:
    raw = "|".join(c["id"] for c in chunks)
    return hashlib.sha256(raw.encode()).hexdigest()[:24]


def _load_checkpoint(fingerprint: str) -> tuple[list[list[float]], int] | None:
    path = _checkpoint_path()
    if not os.path.isfile(path):
        return None
    with open(path, "rb") as f:
        data = pickle.load(f)
    if not isinstance(data, dict):
        return None
    if data.get("fingerprint") != fingerprint:
        return None
    if data.get("provider") != settings.llm_provider:
        return None
    if data.get("embed_model") != _embed_model_name():
        return None
    embeddings = data.get("embeddings")
    if not isinstance(embeddings, list):
        return None
    return embeddings, len(embeddings)


def _save_checkpoint(fingerprint: str, embeddings: list[list[float]]) -> None:
    with open(_checkpoint_path(), "wb") as f:
        pickle.dump(
            {
                "fingerprint": fingerprint,
                "provider": settings.llm_provider,
                "embed_model": _embed_model_name(),
                "embeddings": embeddings,
            },
            f,
            protocol=pickle.HIGHEST_PROTOCOL,
        )


def _clear_checkpoint() -> None:
    path = _checkpoint_path()
    if os.path.isfile(path):
        os.remove(path)


def _embed_model_name() -> str:
    if settings.llm_provider == "ollama":
        return settings.ollama_embed_model
    if settings.llm_provider == "gemini":
        return settings.gemini_embed_model
    return settings.openai_embed_model


def _embed_for_ingest(texts: list[str], fingerprint: str) -> list[list[float]]:
    if settings.llm_provider != "gemini":
        return embed_texts_batch(texts)

    resume = _load_checkpoint(fingerprint)
    start = 0
    existing: list[list[float]] = []
    if resume:
        existing, start = resume
        print(f"Resuming Gemini ingest at chunk {start}/{len(texts)}…")

    def on_batch(embeddings: list[list[float]], done: int, total: int) -> None:
        _save_checkpoint(fingerprint, embeddings)
        print(f"  embedded {done}/{total} chunks…", flush=True)

    try:
        result = gemini_embed_many(
            texts,
            start_index=start,
            existing=existing,
            on_batch=on_batch,
        )
    except GeminiDailyQuotaError as e:
        partial = e.partial
        if partial:
            _save_checkpoint(fingerprint, partial)
            print(
                f"\nSaved progress: {len(partial)}/{len(texts)} chunks embedded.\n"
                f"{e}\n",
                file=sys.stderr,
            )
        else:
            print(f"\n{e}\n", file=sys.stderr)
        sys.exit(1)

    _clear_checkpoint()
    return result


def main() -> None:
    if settings.llm_provider == "openai" and not settings.openai_api_key:
        print(
            "LLM_PROVIDER=openai requires OPENAI_API_KEY in backend/.env.\n"
            "For free local models, set LLM_PROVIDER=ollama and install Ollama.",
            file=sys.stderr,
        )
        sys.exit(1)

    if settings.llm_provider == "gemini" and not settings.gemini_api_key:
        print(
            "LLM_PROVIDER=gemini requires GEMINI_API_KEY in backend/.env.\n"
            "Get a key at https://aistudio.google.com/apikey",
            file=sys.stderr,
        )
        sys.exit(1)

    if settings.llm_provider == "ollama":
        if not ollama_ping():
            print(
                f"Cannot reach Ollama at {settings.ollama_base_url}.\n"
                "  • Install from https://ollama.com\n"
                "  • Run `ollama serve` (or start the Ollama app)\n"
                f"  • Pull models: ollama pull {settings.ollama_embed_model} && ollama pull {settings.ollama_chat_model}",
                file=sys.stderr,
            )
            sys.exit(1)

    parts = load_text()
    all_chunks: list[dict] = []
    for blob, page, source in parts:
        all_chunks.extend(chunk_text(blob, page, source))

    if not all_chunks:
        print("No text extracted from file.", file=sys.stderr)
        sys.exit(1)

    texts = [c["text"] for c in all_chunks]
    fingerprint = _corpus_fingerprint(all_chunks)

    if settings.llm_provider == "gemini":
        print(
            f"Embedding {len(texts)} chunks with Gemini "
            f"(free tier ≈1000 requests/day — ingest may resume over multiple days)…"
        )

    try:
        embeddings = _embed_for_ingest(texts, fingerprint)
    except OpenAIAuthError:
        print(
            "OpenAI rejected your API key (401). Check OPENAI_API_KEY in backend/.env.",
            file=sys.stderr,
        )
        raise
    except OpenAIRateLimitError as e:
        err = getattr(e, "body", None) or str(e)
        if "insufficient_quota" in str(err) or "insufficient_quota" in str(e):
            print(
                "OpenAI 429 insufficient_quota — add billing/credits, or set LLM_PROVIDER=ollama for free local models.",
                file=sys.stderr,
            )
        else:
            print("OpenAI rate limit (429). Wait and retry.", file=sys.stderr)
        raise
    except httpx.HTTPError as e:
        print(
            f"HTTP error while calling the embedding backend ({settings.llm_provider}): {e}\n"
            "If using Ollama, confirm `ollama serve` is running and models are pulled.",
            file=sys.stderr,
        )
        raise

    save_index(embeddings, all_chunks)
    print(
        f"Indexed {len(all_chunks)} chunks into {settings.rag_store_dir} "
        f"(provider={settings.llm_provider})."
    )


if __name__ == "__main__":
    main()
