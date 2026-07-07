import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.rag_service import chat_stream, retrieve_context


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="Bhagavad Gita AI API", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    history: list[HistoryMessage] = Field(default_factory=list)
    language: str = Field(default="en", pattern="^(en|hi)$")


@app.get("/health")
def health():
    from app.ollama_client import ollama_ping

    out: dict = {"status": "ok", "llm_provider": settings.llm_provider}
    if settings.llm_provider == "ollama":
        out["ollama_reachable"] = ollama_ping()
        out["ollama_chat_model"] = settings.ollama_chat_model
        out["ollama_embed_model"] = settings.ollama_embed_model
    elif settings.llm_provider == "gemini":
        out["gemini_api_key_set"] = bool(settings.gemini_api_key)
        out["gemini_chat_model"] = settings.gemini_chat_model
        out["gemini_embed_model"] = settings.gemini_embed_model
    else:
        out["openai_chat_model"] = settings.openai_chat_model
        out["openai_embed_model"] = settings.openai_embed_model
    return out


@app.post("/chat/sources")
def chat_sources(body: ChatRequest):
    """Return retrieved chunks for explainability (optional UI)."""
    try:
        context, sources, score = retrieve_context(body.message)
    except Exception:
        # Gracefully degrade — sources are optional; don't crash the UI
        return {"context_present": False, "sources": [], "relevance_score": 0.0}
    return {"context_present": bool(context.strip()), "sources": sources, "relevance_score": score}


def _sse_stream(user_message: str, history: list[dict], language: str = "en"):
    def gen():
        try:
            for piece in chat_stream(user_message, history=history, language=language):
                yield f"data: {json.dumps({'text': piece})}\n\n"
            yield "data: [DONE]\n\n"
        except RuntimeError as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return gen()


@app.post("/chat/stream")
def chat_stream_endpoint(body: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in body.history]
    return StreamingResponse(
        _sse_stream(body.message, history, language=body.language),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
