from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import Settings
from memory import SessionStore
from providers.base import ChatResult
from providers.groq import GroqChatProvider
from tools import ToolRegistry
from shared.database import get_events, get_volunteer_opportunities
from shared.prayer_times import get_prayer_times

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = Settings()
tool_registry = ToolRegistry(allowed_sql_operations=settings.allowed_sql_operations)
session_store = SessionStore(history_limit=settings.max_history_messages)

if settings.ai_provider != "groq":
    logger.warning(
        "AI_PROVIDER is set to %s but only the Groq provider is currently wired."
        " Defaulting to groq.",
        settings.ai_provider,
    )

try:
    chat_provider = GroqChatProvider(settings, session_store, tool_registry)
except Exception as exc:  # noqa: BLE001
    logger.error(f"Unable to initialize Groq provider: {exc}")
    chat_provider = None

app = FastAPI(title="MAS Queens AI Assistant", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    context: Dict[str, Any]
    sources: List[str]
    tools_used: List[str]


@app.get("/")
async def root() -> Dict[str, Any]:
    return {
        "message": "MAS Queens AI Assistant is ready",
        "model": settings.groq_model,
        "provider": "groq",
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    if not chat_provider:
        raise HTTPException(status_code=500, detail="Groq provider unavailable")
    return {
        "status": "healthy",
        "model": settings.groq_model,
        "active_sessions": session_store.active_sessions(),
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage) -> ChatResponse:
    if not chat_provider:
        raise HTTPException(status_code=500, detail="AI provider not available")

    session_id = chat_message.session_id or "default"

    # Set context for tool execution (user info, etc.)
    if chat_message.context:
        tool_registry.set_context(chat_message.context)

    try:
        result: ChatResult = chat_provider.generate(chat_message.message, session_id)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Chat processing error: {exc}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

    return ChatResponse(
        response=result.message,
        context={
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
        },
        sources=["MAS Queens AI Assistant"],
        tools_used=result.used_tools,
    )


@app.get("/prayer-times")
async def prayer_times(date: Optional[str] = None) -> Dict[str, Any]:
    return get_prayer_times(date)


@app.get("/events")
async def events(limit: int = 10, query: Optional[str] = None) -> Dict[str, Any]:
    events_list = get_events(limit=limit, user_query=query or "")
    return {"events": events_list, "count": len(events_list)}


@app.get("/volunteer-opportunities")
async def volunteer_opportunities() -> Dict[str, Any]:
    opportunities = get_volunteer_opportunities()
    return {"opportunities": opportunities, "count": len(opportunities)}


@app.delete("/sessions/{session_id}")
async def reset_session(session_id: str) -> Dict[str, str]:
    session_store.reset(session_id)
    return {"status": "cleared"}
