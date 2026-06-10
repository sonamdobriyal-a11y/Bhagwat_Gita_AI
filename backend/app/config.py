from pathlib import Path

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_root = Path(__file__).resolve().parent.parent
_env_file = _backend_root / ".env"
if _env_file.is_file():
    load_dotenv(_env_file, override=True)


class Settings(BaseSettings):
    """Secrets and options come from the environment and `backend/.env`."""

    model_config = SettingsConfigDict(
        env_file=str(_env_file),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # openai | ollama | gemini — default ollama for free local models (install from https://ollama.com)
    llm_provider: str = "ollama"

    openai_api_key: str = ""
    gemini_api_key: str = ""

    @field_validator("openai_api_key", "gemini_api_key", mode="before")
    @classmethod
    def strip_api_keys(cls, v: object) -> object:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("llm_provider", mode="before")
    @classmethod
    def lower_provider(cls, v: object) -> object:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("llm_provider")
    @classmethod
    def allowed_provider(cls, v: str) -> str:
        if v not in ("openai", "ollama", "gemini"):
            raise ValueError("llm_provider must be 'openai', 'ollama', or 'gemini'")
        return v

    openai_chat_model: str = "gpt-4o-mini"
    openai_embed_model: str = "text-embedding-3-small"

    gemini_chat_model: str = "gemini-2.5-flash"
    gemini_embed_model: str = "gemini-embedding-001"

    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_chat_model: str = "llama3.2"
    ollama_embed_model: str = "nomic-embed-text"

    rag_store_dir: str = "./data/rag_store"
    collection_name: str = "bhagavad_gita"
    pdf_path: str = "./data/bhagavad_gita.pdf"
    chunk_size: int = 900
    chunk_overlap: int = 120
    retrieve_k: int = 6
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    firebase_enabled: bool = True
    firebase_project_id: str = ""
    firebase_storage_bucket: str = ""
    firebase_service_account_json: str = ""
    firebase_service_account_path: str = ""
    firebase_use_application_default: bool = False

    @field_validator(
        "firebase_project_id",
        "firebase_storage_bucket",
        "firebase_service_account_json",
        "firebase_service_account_path",
        mode="before",
    )
    @classmethod
    def strip_firebase_values(cls, v: object) -> object:
        if isinstance(v, str):
            return v.strip()
        return v


settings = Settings()
