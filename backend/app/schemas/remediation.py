from datetime import datetime
from pydantic import BaseModel, Field


class CAPATask(BaseModel):
    capa_id: str
    breach_id: str
    title: str
    circular_id: str
    department: str
    assignee: str
    status: str  # open, in_progress, under_review, closed
    risk_level: str  # critical, high, medium, low
    created_at: datetime
    due_date: datetime
    description: str
    corrective_action: str
    evidence_proof: str | None = None
    signed_off_by: str | None = None
    signed_off_at: datetime | None = None


class CAPACreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    circular_id: str
    department: str
    assignee: str
    risk_level: str = Field(pattern='^(low|medium|high|critical)$')
    description: str
    corrective_action: str
    due_days: int = Field(default=14, ge=1, le=180)


class CAPASignoffRequest(BaseModel):
    capa_id: str
    signed_off_by: str
    evidence_proof: str


class RemediationSummary(BaseModel):
    total_breaches: int
    open_capas: int
    in_progress: int
    under_review: int
    closed_and_certified: int
    overdue_count: int
    audit_readiness_score: float
