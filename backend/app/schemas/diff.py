from pydantic import BaseModel, Field


class ClauseDiff(BaseModel):
    clause_id: str
    section: str
    diff_status: str  # added, removed, modified, unchanged
    old_text: str | None = None
    new_text: str | None = None
    parameter_change: str | None = None
    risk_level: str  # critical, high, medium, low
    affected_departments: list[str] = Field(default_factory=list)
    action_required: str


class DepartmentalDeltaImpact(BaseModel):
    department: str
    changes_count: int
    risk_summary: str
    sla_impact: str


class RegulatoryDiffRequest(BaseModel):
    baseline_doc_id: str
    target_doc_id: str


class RegulatoryDiffResponse(BaseModel):
    comparison_id: str
    baseline_doc_id: str
    baseline_title: str
    target_doc_id: str
    target_title: str
    effective_date: str
    diff_summary: dict[str, int]  # added: X, removed: Y, modified: Z, unchanged: W
    clauses: list[ClauseDiff] = Field(default_factory=list)
    department_impacts: list[DepartmentalDeltaImpact] = Field(default_factory=list)
    hash_certificate: str
