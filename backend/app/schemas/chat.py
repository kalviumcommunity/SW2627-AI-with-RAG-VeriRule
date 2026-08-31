"""Pydantic schemas for the Compliance Chat Assistant endpoint."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ChatSource(BaseModel):
    """A retrieved source document chunk used to ground an answer."""

    document_id: str
    title: str
    document_type: str
    authority: str | None = None
    section: str | None = None
    status: str  # "active" | "superseded"
    effective_date: str | None = None
    passage: str
    confidence: float = Field(ge=0.0, le=1.0, description="Similarity-based confidence score")


class ChatMessage(BaseModel):
    """A single turn in the conversation (user or assistant)."""

    role: Literal["user", "assistant"]
    content: str
    sources: list[ChatSource] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.utcnow())


class ChatRequest(BaseModel):
    """Request body for the streaming chat endpoint."""

    session_id: str = Field(min_length=1, max_length=128)
    history: list[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation turns for multi-turn context (max last 6).",
    )
    question: str = Field(min_length=3, max_length=2000)


class ChatStreamChunk(BaseModel):
    """A single SSE data chunk yielded during streaming."""

    type: Literal["token", "sources", "done", "error"]
    data: str  # For 'token': text fragment. For 'sources': JSON list. For 'done'/'error': message.
