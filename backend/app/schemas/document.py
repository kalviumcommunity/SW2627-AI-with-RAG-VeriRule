from enum import StrEnum

from pydantic import BaseModel


class DocumentStatus(StrEnum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    ARCHIVED = "archived"
    DRAFT = "draft"


class DocumentCategory(StrEnum):
    MASTER_DIRECTION = "Master Direction"
    CIRCULAR = "Circular"
    INTERNAL_AUDIT = "Internal Audit Report"
    REGULATORY_UPDATE = "Regulatory Update"


class DocumentSummary(BaseModel):
    document_id: str
    title: str
    document_type: str
    status: DocumentStatus = DocumentStatus.ACTIVE
    category: str = "Master Direction"
    authority: str | None = None
    issue_date: str | None = None
    effective_date: str | None = None
    version: str | None = None
    chunk_count: int = 1
    supersedes_id: str | None = None
    rules_count: int = 2


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str
    summary: DocumentSummary | None = None


class DocumentChunkReference(BaseModel):
    chunk_id: str
    passage: str
    section: str | None = None
    page: int | None = None
    status: str
    effective_date: str | None = None
