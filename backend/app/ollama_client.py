"""HTTP client for local Ollama (free, no API key)."""

from __future__ import annotations

import json
from typing import Iterator

import httpx

from app.config import settings


def _base() -> str:
    return settings.ollama_base_url.rstrip("/")


def ollama_embed_one(text: str) -> list[float]:
    url = f"{_base()}/api/embeddings"
    payload = {"model": settings.ollama_embed_model, "prompt": text}
    with httpx.Client(timeout=httpx.Timeout(120.0)) as client:
        r = client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    emb = data.get("embedding")
    if not isinstance(emb, list):
        raise RuntimeError("Ollama embeddings response missing 'embedding' array")
    return [float(x) for x in emb]


def ollama_embed_many(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    return [ollama_embed_one(t) for t in texts]


def ollama_chat_stream(
    messages: list[dict],
) -> Iterator[str]:
    """Accept a fully-assembled messages list (system + history + current user turn)."""
    url = f"{_base()}/api/chat"
    payload = {
        "model": settings.ollama_chat_model,
        "messages": messages,
        "stream": True,
        "options": {"temperature": 0.6, "num_predict": 180},
    }
    with httpx.Client(timeout=httpx.Timeout(300.0)) as client:
        with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = obj.get("message") or {}
                piece = msg.get("content")
                if piece:
                    yield piece


def ollama_ping() -> bool:
    try:
        with httpx.Client(timeout=httpx.Timeout(5.0)) as client:
            r = client.get(f"{_base()}/api/tags")
            return r.status_code == 200
    except Exception:
        return False
