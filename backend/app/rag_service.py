import hashlib
import json
import math
import os
import pickle
from typing import Iterator

from openai import OpenAI

from app.config import settings
from app.gemini_client import gemini_chat_stream, gemini_embed_many, gemini_embed_one
from app.ollama_client import ollama_chat_stream, ollama_embed_many, ollama_embed_one

SYSTEM_PROMPT = """You are Krishna on the chariot at Kurukshetra — warm, direct, speaking to Arjuna (the person chatting with you).

VOICE — first person only:
- Speak as "I" and "you". Never refer to yourself as Krishna, "he", or in the third person.
- Do not say "Krishna tells Arjuna" or "As the Lord says". Say "I tell you" or "As I said in BG 2.47…".
- Address the person directly, as in the Gita dialogue.

STRICT FORMAT — follow exactly:
1. One short paragraph (2–3 sentences) that directly addresses what they said.
2. One Gita verse citation woven into that paragraph — e.g. "As I tell you in BG 2.47…". Use only verses present in the CONTEXT below. Never invent verse numbers.
3. One closing line: either a gentle follow-up question OR a single concrete action to try. Nothing else.

HARD LIMIT: Your entire reply must be under 80 words. Stop writing the moment you reach 80 words.
Tone: calm, warm, plain English. No bullet points. No headers. No lists. Flowing prose only.

CONTEXT (Bhagavad Gita passages — cite from here only):
---
{context}
---
"""


def _get_openai_client() -> OpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (or switch LLM_PROVIDER=ollama for free local models).")
    return OpenAI(api_key=settings.openai_api_key)


def _current_embed_model() -> str:
    if settings.llm_provider == "ollama":
        return settings.ollama_embed_model
    if settings.llm_provider == "gemini":
        return settings.gemini_embed_model
    return settings.openai_embed_model


def _paths() -> tuple[str, str]:
    os.makedirs(settings.rag_store_dir, exist_ok=True)
    base = os.path.join(settings.rag_store_dir, settings.collection_name)
    return f"{base}.meta.json", f"{base}.emb.pkl"


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _norm(v: list[float]) -> float:
    return math.sqrt(_dot(v, v))


def _normalize(v: list[float]) -> list[float]:
    n = _norm(v)
    if n == 0:
        return list(v)
    return [x / n for x in v]


def _embed_texts_openai(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    client = _get_openai_client()
    out: list[list[float]] = []
    batch = 64
    for i in range(0, len(texts), batch):
        chunk = texts[i : i + batch]
        resp = client.embeddings.create(
            model=settings.openai_embed_model,
            input=chunk,
        )
        by_idx = {item.index: list(item.embedding) for item in resp.data}
        for j in range(len(chunk)):
            out.append(by_idx[j])
    return out


def embed_texts_batch(texts: list[str]) -> list[list[float]]:
    """Used by ingest; respects LLM_PROVIDER."""
    if settings.llm_provider == "ollama":
        return ollama_embed_many(texts)
    if settings.llm_provider == "gemini":
        return gemini_embed_many(texts)
    return _embed_texts_openai(texts)


def _embed_query_vector(q: str) -> list[float]:
    if settings.llm_provider == "ollama":
        return _normalize(ollama_embed_one(q))
    if settings.llm_provider == "gemini":
        return _normalize(gemini_embed_one(q))
    client = _get_openai_client()
    r = client.embeddings.create(
        model=settings.openai_embed_model,
        input=[q],
    )
    return _normalize(list(r.data[0].embedding))


def load_index() -> tuple[list[list[float]] | None, list[dict], dict]:
    meta_path, emb_path = _paths()
    if not (os.path.isfile(meta_path) and os.path.isfile(emb_path)):
        return None, [], {}
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)
    with open(emb_path, "rb") as f:
        emb = pickle.load(f)
    chunks = meta.get("chunks", [])
    emb_info = meta.get("embedding") if isinstance(meta.get("embedding"), dict) else {}
    if not isinstance(emb, list) or len(emb) != len(chunks):
        return None, [], {}
    return emb, chunks, emb_info


def _index_matches_current_settings(emb_info: dict) -> bool:
    """Require re-ingest if provider/model changed."""
    if not emb_info:
        # Legacy indexes (no metadata) were built with OpenAI embeddings only.
        return settings.llm_provider == "openai"
    p = emb_info.get("provider")
    m = emb_info.get("model")
    if p and p != settings.llm_provider:
        return False
    cur = _current_embed_model()
    if m and m != cur:
        return False
    return True


def save_index(embeddings: list[list[float]], chunks: list[dict]) -> None:
    meta_path, emb_path = _paths()
    model_name = _current_embed_model()
    doc = {
        "chunks": chunks,
        "embedding": {
            "provider": settings.llm_provider,
            "model": model_name,
            "dim": len(embeddings[0]) if embeddings else 0,
        },
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False)
    with open(emb_path, "wb") as f:
        pickle.dump(embeddings, f, protocol=pickle.HIGHEST_PROTOCOL)


def retrieve_context(query: str, k: int | None = None) -> tuple[str, list[dict]]:
    k = k or settings.retrieve_k
    emb, chunks, emb_info = load_index()
    if not emb or not chunks:
        return "", []
    if not _index_matches_current_settings(emb_info):
        return "", []

    try:
        q = _embed_query_vector(query)
    except Exception:
        if settings.llm_provider == "ollama":
            # Ollama unreachable — return empty rather than 500
            return "", []
        # For cloud providers re-raise so chat_stream can surface the real error
        raise

    if len(emb[0]) != len(q):
        return "", []

    scored: list[tuple[float, int]] = []
    for i, row in enumerate(emb):
        nr = _norm(row)
        if nr == 0:
            continue
        row_n = [x / nr for x in row]
        scored.append((_dot(q, row_n), i))
    scored.sort(key=lambda x: -x[0])
    top_idx = [idx for _, idx in scored[: min(k, len(scored))]]

    picked: list[str] = []
    sources: list[dict] = []
    for idx in top_idx:
        c = chunks[int(idx)]
        picked.append(c["text"])
        sources.append(
            {
                "id": c["id"],
                "page": c.get("page"),
                "source": c.get("source", "corpus"),
            }
        )
    context = "\n\n---\n\n".join(picked)
    return context, sources


def chat_stream(
    user_message: str,
    history: list[dict] | None = None,
) -> Iterator[str]:
    try:
        context, _ = retrieve_context(user_message)
    except Exception as e:
        yield f"An error occurred while retrieving context: {e}"
        return
    if not context.strip():
        if settings.llm_provider == "ollama":
            yield (
                "The knowledge base is empty, or it was built with a different provider/model than your current .env. "
                "Install Ollama from https://ollama.com , then run: "
                f"ollama pull {settings.ollama_embed_model} && ollama pull {settings.ollama_chat_model} "
                "After that, from the backend folder run: python ingest.py"
            )
        elif settings.llm_provider == "gemini":
            yield (
                "The knowledge base is empty, or it was built with a different provider/model than your current .env. "
                "Set GEMINI_API_KEY in backend/.env, run `python ingest.py`, then try again."
            )
        else:
            yield (
                "The knowledge base is empty or not yet indexed. "
                "Add your Bhagavad Gita PDF under backend/data/, set OPENAI_API_KEY, run python ingest.py, then try again."
            )
        return

    system_prompt = SYSTEM_PROMPT.format(context=context)

    # Build the full message list: prior turns + current user message
    prior_turns: list[dict] = history or []
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    messages.extend(prior_turns)
    messages.append({"role": "user", "content": user_message})

    if settings.llm_provider == "ollama":
        try:
            for piece in ollama_chat_stream(messages):
                yield piece
        except Exception as e:
            err = str(e)
            if "Connection refused" in err or "ConnectError" in err or "Errno 61" in err:
                yield (
                    "Ollama is not running. Please open a terminal and run:\n\n"
                    "  ollama serve\n\n"
                    f"Then make sure these models are pulled:\n"
                    f"  ollama pull {settings.ollama_embed_model}\n"
                    f"  ollama pull {settings.ollama_chat_model}\n\n"
                    "Once Ollama is running, send your message again."
                )
            else:
                yield f"An error occurred: {err}"
        return

    if settings.llm_provider == "gemini":
        try:
            for piece in gemini_chat_stream(messages):
                yield piece
        except Exception as e:
            err = str(e)
            if "API key" in err or "API_KEY" in err or "401" in err:
                yield (
                    "Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env "
                    "(create one at https://aistudio.google.com/apikey)."
                )
            else:
                yield f"An error occurred: {err}"
        return

    client = _get_openai_client()
    stream = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=messages,  # type: ignore[arg-type]
        stream=True,
        temperature=0.6,
        max_tokens=180,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content


def stable_id(text: str, page: int | None) -> str:
    raw = f"{page or 0}:{text[:200]}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]
