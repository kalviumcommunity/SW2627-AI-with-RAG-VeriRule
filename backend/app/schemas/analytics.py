"""Analytics schema for compliance metrics and reporting."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ComplianceKPI(BaseModel):
    """Compliance Key Performance Indicator."""

    metric_name: str
    value: float
    unit: str
    target: Optional[float] = None
    status: str  # "green", "yellow", "red"
    trend: Optional[str] = None  # "up", "down", "stable"


class QueryMetric(BaseModel):
    """Query execution metric."""

    total_queries: int
    successful_queries: int
    failed_queries: int
    average_confidence: float
    insufficient_evidence_count: int
    success_rate: float


class DocumentMetric(BaseModel):
    """Document repository metric."""

    total_documents: int
    total_chunks: int
    document_upload_count: int
    authority_distribution: dict[str, int]  # authority -> count
    upload_trend: dict[str, int]  # date -> count


class RiskAreaMetric(BaseModel):
    """Risk area assessment."""

    area_name: str
    active_rules: int
    superseded_rules: int
    risk_level: str  # "low", "medium", "high"
    last_updated: datetime
    compliance_score: float  # 0-100


class ComplianceScorecard(BaseModel):
    """Overall compliance scorecard."""

    overall_score: float  # 0-100
    score_date: datetime
    categories: dict[str, float]  # category -> score
    status: str  # "compliant", "at_risk", "critical"
    key_findings: list[str]
    improvement_areas: list[str]


class AnalyticsDashboard(BaseModel):
    """Complete analytics dashboard data."""

    dashboard_date: datetime
    kpis: list[ComplianceKPI]
    query_metrics: QueryMetric
    document_metrics: DocumentMetric
    risk_areas: list[RiskAreaMetric]
    scorecard: ComplianceScorecard
    compliance_trend: dict[str, float]  # date -> compliance_score
    top_queries: list[dict[str, str | int]]
    audit_events_summary: dict[str, int]  # category -> count


class AnalyticsReportRequest(BaseModel):
    """Request for analytics report generation."""

    report_type: str  # "compliance_scorecard", "risk_assessment", "executive_summary"
    include_trends: bool = True
    include_recommendations: bool = True
    date_range: Optional[tuple[str, str]] = None  # (start_date, end_date)
    format: str = "json"  # "json", "csv", "pdf"


class AnalyticsReportResponse(BaseModel):
    """Generated analytics report."""

    report_id: str
    report_type: str
    generated_at: datetime
    data: dict
    summary: str
    recommendations: Optional[list[str]] = None
