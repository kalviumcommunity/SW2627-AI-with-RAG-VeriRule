from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class DocumentStatus(StrEnum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    ARCHIVED = "archived"
    DRAFT = "draft"


class DocumentSummary(BaseModel):
    document_id: str
    title: str
    document_type: str
    status: DocumentStatus
    issue_date: datetime | None = None
    effective_date: datetime | None = None
    version: str | None = None
    authority: str | None = None


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str
