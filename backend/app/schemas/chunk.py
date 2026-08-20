from datetime import datetime

from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    text: str = Field(min_length=1)
    title: str
    document_type: str
    section: str | None = None
    page: int | None = Field(default=None, ge=1)
    issue_date: datetime | None = None
    effective_date: datetime | None = None
    status: str
    version: str | None = None
    authority: str | None = None
    supersedes: str | None = None
    superseded_by: str | None = None