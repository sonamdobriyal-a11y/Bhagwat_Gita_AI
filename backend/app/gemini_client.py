"""Google Gemini API client (chat + embeddings via google-genai SDK)."""

from __future__ import annotations

import time
from typing import Callable, Iterator

from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.config import settings

# Free tier: ~100 embed requests/min; each input text may count as one request.
_GEMINI_EMBED_BATCH = 50
_GEMINI_EMBED_PAUSE_SEC = 62


class GeminiDailyQuotaError(Exception):
    """Raised when Gemini free-tier daily embedding quota is exhausted."""

    def __init__(self, message: str, partial: list[list[float]] | None = None):
        super().__init__(message)
        self.partial = partial or []


def _client() -> genai.Client:
    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set (get one at https://aistudio.google.com/apikey)."
        )
    return genai.Client(api_key=settings.gemini_api_key)


def _extract_vectors(response: object) -> list[list[float]]:
    embeddings = getattr(response, "embeddings", None)
    if embeddings:
        out: list[list[float]] = []
        for item in embeddings:
            values = getattr(item, "values", None)
            if values is not None:
                out.append([float(x) for x in values])
        if out:
            return out

    single = getattr(response, "embedding", None)
    if single is not None:
        values = getattr(single, "values", None)
        if values is not None:
            return [[float(x) for x in values]]

    raise RuntimeError("Gemini embed response missing embedding vectors")


def _is_daily_quota_error(err: ClientError) -> bool:
    msg = str(err)
    return "PerDay" in msg or "EmbedContentRequestsPerDay" in msg


def _embed_batch_with_retry(client: genai.Client, texts: list[str]) -> list[list[float]]:
    for attempt in range(6):
        try:
            response = client.models.embed_content(
                model=settings.gemini_embed_model,
                contents=texts,
            )
            return _extract_vectors(response)
        except ClientError as e:
            if getattr(e, "status_code", None) != 429:
                raise
            if _is_daily_quota_error(e):
                raise GeminiDailyQuotaError(
                    "Gemini free-tier daily embedding quota exhausted "
                    f"({len(texts)} texts in this batch). "
                    "Run `python ingest.py` again after the quota resets (usually midnight Pacific), "
                    "or enable billing at https://aistudio.google.com/"
                ) from e
            if attempt < 5:
                time.sleep(_GEMINI_EMBED_PAUSE_SEC)
                continue
            raise
    raise RuntimeError("unreachable")


def gemini_embed_one(text: str) -> list[float]:
    return _embed_batch_with_retry(_client(), [text])[0]


def gemini_embed_many(
    texts: list[str],
    *,
    start_index: int = 0,
    existing: list[list[float]] | None = None,
    on_batch: Callable[[list[list[float]], int, int], None] | None = None,
) -> list[list[float]]:
    if not texts:
        return []
    if start_index < 0 or start_index > len(texts):
        raise ValueError("start_index out of range")
    out: list[list[float]] = list(existing or [])
    if len(out) != start_index:
        raise ValueError("existing embeddings length must match start_index")

    client = _client()
    batch = _GEMINI_EMBED_BATCH
    i = start_index
    while i < len(texts):
        chunk = texts[i : i + batch]
        try:
            vectors = _embed_batch_with_retry(client, chunk)
        except GeminiDailyQuotaError as e:
            raise GeminiDailyQuotaError(str(e), partial=out) from e
        out.extend(vectors)
        i += len(chunk)
        if on_batch:
            on_batch(out, i, len(texts))
        if i < len(texts):
            time.sleep(_GEMINI_EMBED_PAUSE_SEC)

    if len(out) != len(texts):
        raise RuntimeError(
            f"Gemini returned {len(out)} embeddings for {len(texts)} inputs."
        )
    return out


def gemini_chat_stream(messages: list[dict]) -> Iterator[str]:
    """Accept a fully-assembled messages list (system + history + current user turn)."""
    system = next((m["content"] for m in messages if m["role"] == "system"), None)
    turns = [m for m in messages if m["role"] != "system"]

    contents: list[types.Content] = []
    for msg in turns:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=msg["content"])])
        )

    client = _client()
    stream = client.models.generate_content_stream(
        model=settings.gemini_chat_model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.6,
            max_output_tokens=600,
        ),
    )
    for chunk in stream:
        # Extract text safely — chunk.text may raise if finish_reason is not STOP
        try:
            text = chunk.text
        except Exception:
            text = None

        if text:
            yield text
            continue

        # Check for non-STOP finish reasons and surface them
        try:
            candidates = getattr(chunk, "candidates", None) or []
            for cand in candidates:
                finish = getattr(cand, "finish_reason", None)
                if finish and str(finish) not in ("FinishReason.STOP", "STOP", "1"):
                    yield f"\n\n[Response stopped early: {finish}]"
        except Exception:
            pass
