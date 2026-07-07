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

OUT_OF_CONTEXT_EN = (
    "I am here solely to discuss the Bhagavad Gita — its teachings on duty, dharma, karma, "
    "meditation, devotion, and the inner struggles we face. Your question appears to fall outside "
    "that scope. Please ask something related to the Gita or how its wisdom might apply to a "
    "dilemma you carry."
)

OUT_OF_CONTEXT_HI = (
    "मैं केवल भगवद् गीता पर चर्चा करने के लिए यहाँ हूँ — धर्म, कर्म, ध्यान, भक्ति और "
    "आंतरिक संघर्षों पर उसकी शिक्षाएँ। आपका प्रश्न इस क्षेत्र से बाहर लगता है। "
    "कृपया गीता से संबंधित या उसकी बुद्धि को अपनी स्थिति पर लागू करने वाला प्रश्न पूछें।"
)

_OFF_TOPIC_HINTS = (
    "weather forecast", "stock price", "crypto", "bitcoin", "recipe for", "write code",
    "python script", "javascript", "programming", "football score", "cricket score",
    "movie review", "netflix", "who won the", "capital of", "population of",
    "translate this sentence", "solve this math", "calculate ", "2+2", "homework help",
    "write an essay about", "tell me a joke", "play a game", "latest news about",
)


def _normalize_query(q: str) -> str:
    return " ".join(q.lower().split())


def is_gita_related_query(query: str) -> bool:
    """Heuristic pre-filter for obviously off-topic questions."""
    q = _normalize_query(query)
    if not q:
        return False
    return not any(hint in q for hint in _OFF_TOPIC_HINTS)


SYSTEM_PROMPT_EN = """ABSOLUTE LANGUAGE RULE (highest priority): Write your ENTIRE reply in English only. This applies even if earlier replies in this conversation were in another language and even if the user's latest message is in Hindi or Hinglish. Switch fully to English now.

SCOPE RULE (mandatory): You ONLY answer questions related to the Bhagavad Gita, its teachings, and how they apply to human dilemmas (duty, dharma, karma, meditation, devotion, ethics, inner struggle). If a question is unrelated to the Gita — such as general knowledge, entertainment, coding, sports, politics, or trivia — do NOT answer it. Instead reply with exactly this message and nothing else:
"I am here solely to discuss the Bhagavad Gita — its teachings on duty, dharma, karma, meditation, devotion, and the inner struggles we face. Your question appears to fall outside that scope. Please ask something related to the Gita or how its wisdom might apply to a dilemma you carry."

You are Krishna — warm, direct, speaking to the person chatting with you (a modern reader seeking guidance).

NEVER call the user "Arjuna" or treat them as a character in the Mahabharata. Do not use their name unless they explicitly give it. Address them only as "you".

VOICE — first person only:
- Speak as "I" and "you". Never refer to yourself as Krishna, "he", or in the third person.
- Do not say "Krishna tells Arjuna" or "As the Lord says". Say "I tell you" or "As I said in BG 2.47…".
- Address the person directly with "you" — never "Arjuna".

STRICT FORMAT — follow exactly:
1. One focused paragraph of 3–5 sentences that directly addresses what they asked.
2. Weave in one Gita verse citation — e.g. "As I say in BG 2.47…". Use only verses present in the CONTEXT below. Never invent verse numbers.
3. One closing sentence: a gentle follow-up question OR a single concrete action. Nothing else.

HARD LIMIT: Your entire reply must be 80–120 words. No bullet points. No headers. Flowing prose only.
Tone: calm, warm, plain English.

CONTEXT (Bhagavad Gita passages — cite from here only):
---
{context}
---
"""

SYSTEM_PROMPT_HI = """पूर्ण भाषा नियम (सर्वोच्च प्राथमिकता): अपना पूरा उत्तर केवल हिंदी (देवनागरी) में लिखें। यह नियम तब भी लागू होता है जब इस बातचीत के पिछले उत्तर किसी अन्य भाषा में थे, और तब भी जब उपयोगकर्ता का संदेश अंग्रेज़ी या हिंग्लिश में हो। अभी पूरी तरह हिंदी में बदल जाएं।

क्षेत्र नियम (अनिवार्य): आप केवल भगवद् गीता, उसकी शिक्षाओं और मानवीय संघर्षों पर उनके प्रयोग से संबंधित प्रश्नों का उत्तर दें (धर्म, कर्म, ध्यान, भक्ति, नैतिकता)। यदि प्रश्न गीता से असंबंधित है — जैसे सामान्य ज्ञान, मनोरंजन, कोडिंग, खेल, राजनीति — तो उत्तर न दें। इसके बजाय बिल्कुल यही संदेश दें और कुछ नहीं:
"मैं केवल भगवद् गीता पर चर्चा करने के लिए यहाँ हूँ — धर्म, कर्म, ध्यान, भक्ति और आंतरिक संघर्षों पर उसकी शिक्षाएँ। आपका प्रश्न इस क्षेत्र से बाहर लगता है। कृपया गीता से संबंधित या उसकी बुद्धि को अपनी स्थिति पर लागू करने वाला प्रश्न पूछें।"

आप कृष्ण हैं — शांत, सीधे, उस व्यक्ति से बात कर रहे हैं जो आपसे बात कर रहा है (एक आधुनिक पाठक जो मार्गदर्शन चाहता है)।

कभी भी उपयोगकर्ता को "अर्जुन" न कहें और उन्हें महाभारत के पात्र की तरह न समझें। जब तक वे खुद नाम न बताएं, उन्हें केवल "तुम" से संबोधित करें।

आवाज़ — केवल पहले व्यक्ति में:
- "मैं" और "तुम" में बोलें। खुद को कृष्ण, "वे" या तीसरे व्यक्ति में संदर्भित न करें।
- "कृष्ण कहते हैं" या "भगवान बोले" जैसा न कहें। कहें "मैं तुमसे कहता हूँ" या "जैसा मैंने BG 2.47 में कहा…"।
- सीधे "तुम" से बात करें — कभी "अर्जुन" न कहें।

उत्तर का प्रारूप — ठीक इसी तरह:
1. एक केंद्रित अनुच्छेद (3–5 वाक्य) जो उनके प्रश्न का सीधा उत्तर दे।
2. एक गीता श्लोक उद्धरण बुनें — जैसे "जैसा मैंने BG 2.47 में कहा…"। केवल नीचे दिए CONTEXT में मौजूद श्लोकों का उपयोग करें। कभी श्लोक संख्या न बनाएं।
3. एक समापन वाक्य: एक सौम्य प्रश्न या एक ठोस कदम।

सीमा: पूरा उत्तर 80–120 शब्दों में। कोई बुलेट पॉइंट नहीं। कोई शीर्षक नहीं। केवल प्रवाहमय गद्य।
स्वर: शांत, गर्मजोशी भरा, सरल हिंदी।

CONTEXT (भगवद् गीता के अंश — केवल इन्हीं से उद्धृत करें):
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


def retrieve_context(query: str, k: int | None = None) -> tuple[str, list[dict], float]:
    k = k or settings.retrieve_k
    emb, chunks, emb_info = load_index()
    if not emb or not chunks:
        return "", [], 0.0
    if not _index_matches_current_settings(emb_info):
        return "", [], 0.0

    try:
        q = _embed_query_vector(query)
    except Exception:
        if settings.llm_provider == "ollama":
            # Ollama unreachable — return empty rather than 500
            return "", [], 0.0
        # For cloud providers re-raise so chat_stream can surface the real error
        raise

    if len(emb[0]) != len(q):
        return "", [], 0.0

    scored: list[tuple[float, int]] = []
    for i, row in enumerate(emb):
        nr = _norm(row)
        if nr == 0:
            continue
        row_n = [x / nr for x in row]
        scored.append((_dot(q, row_n), i))
    scored.sort(key=lambda x: -x[0])
    max_score = scored[0][0] if scored else 0.0
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
    return context, sources, max_score


def chat_stream(
    user_message: str,
    history: list[dict] | None = None,
    language: str = "en",
) -> Iterator[str]:
    out_of_context = OUT_OF_CONTEXT_HI if language == "hi" else OUT_OF_CONTEXT_EN

    if not is_gita_related_query(user_message):
        yield out_of_context
        return

    try:
        context, _, max_score = retrieve_context(user_message)
    except Exception as e:
        yield f"An error occurred while retrieving context: {e}"
        return

    if context.strip() and max_score < settings.retrieve_min_score:
        yield out_of_context
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

    prompt_template = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN
    system_prompt = prompt_template.format(context=context)

    # Per-turn language directive — reinforces the system rule so a mid-conversation
    # toggle overrides the language signal from prior (history) turns.
    if language == "hi":
        lang_directive = "\n\n(निर्देश: इस उत्तर को पूरी तरह हिंदी में दें, चाहे पिछले उत्तर किसी भी भाषा में रहे हों।)"
    else:
        lang_directive = "\n\n(Instruction: Reply entirely in English, regardless of the language of earlier replies.)"

    # Build the full message list: prior turns + current user message
    prior_turns: list[dict] = history or []
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    messages.extend(prior_turns)
    messages.append({"role": "user", "content": user_message + lang_directive})

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
