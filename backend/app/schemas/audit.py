from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, Field


class AuditCategory(StrEnum):
    QUERY = "query"
    VERIFICATION = "verification"
    INGESTION = "ingestion"
    SUPERSESSION = "supersession"
    SYSTEM = "system"


class AuditSeverity(StrEnum):
    VERIFIED = "verified"
    FLAGGED = "flagged"
    SUPERSEDED = "superseded"
    INFO = "info"


class AuditEventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    category: AuditCategory
    severity: AuditSeverity = AuditSeverity.VERIFIED
    authority: str | None = None
    query_text: str | None = None
    document_id: str | None = None
    document_title: str | None = None
    confidence_score: float | None = Field(default=None, ge=0, le=1)
    passage_text: str | None = None
    section: str | None = None
    execution_time_ms: int | None = Field(default=None, ge=0)
    details: str | None = None


class AuditEvent(AuditEventCreate):
    id: str
    timestamp: datetime
    verification_hash: str
    actor: str = "Alex Morgan (Compliance Officer)"


class AuditStats(BaseModel):
    total_events: int
    verified_count: int
    flagged_count: int
    superseded_count: int
    average_confidence: float
