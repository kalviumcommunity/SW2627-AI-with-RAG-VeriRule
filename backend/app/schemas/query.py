from datetime import datetime

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)


class SourceReference(BaseModel):
    document_id: str
    title: str
    document_type: str
    section: str | None = None
    page: int | None = Field(default=None, ge=1)
    status: str
    effective_date: datetime | None = None
    passage: str


class QueryResponse(BaseModel):
    query_id: str
    question: str
    answer: str
    status: str
    sources: list[SourceReference] = Field(default_factory=list)
    confidence: float | None = Field(default=None, ge=0, le=1)
    historical_context: str | None = None
