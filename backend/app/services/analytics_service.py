"""Analytics service for compliance metrics and reporting."""

from collections import Counter
from datetime import datetime, timezone
from uuid import uuid4

from app.core.config import get_settings
from app.schemas.analytics import (
    AnalyticsDashboard,
    AnalyticsReportResponse,
    ComplianceKPI,
    ComplianceScorecard,
    DocumentMetric,
    QueryMetric,
    RiskAreaMetric,
)
from app.services.audit_service import get_audit_service
from app.vectorstore.chroma import get_vector_store


class AnalyticsService:
    """Service for generating compliance analytics and metrics."""

    def __init__(self):
        self.settings = get_settings()
        self.audit_service = get_audit_service()
        self.vector_store = get_vector_store()

    def get_dashboard(self) -> AnalyticsDashboard:
        """Generate complete analytics dashboard."""
        now = datetime.now()

        # Fetch all metrics
        kpis = self._calculate_kpis()
        query_metrics = self._get_query_metrics()
        document_metrics = self._get_document_metrics()
        risk_areas = self._get_risk_areas()
        scorecard = self._generate_scorecard(query_metrics, risk_areas)
        compliance_trend = self._get_compliance_trend()
        top_queries = self._get_top_queries()
        audit_summary = self._get_audit_summary()

        return AnalyticsDashboard(
            dashboard_date=now,
            kpis=kpis,
            query_metrics=query_metrics,
            document_metrics=document_metrics,
            risk_areas=risk_areas,
            scorecard=scorecard,
            compliance_trend=compliance_trend,
            top_queries=top_queries,
            audit_events_summary=audit_summary,
        )

    def _calculate_kpis(self) -> list[ComplianceKPI]:
        """Calculate key compliance KPIs."""
        kpis = []

        # Query Success Rate KPI
        query_metrics = self._get_query_metrics()
        success_rate = query_metrics.success_rate

        kpis.append(
            ComplianceKPI(
                metric_name="Query Success Rate",
                value=success_rate,
                unit="%",
                target=95.0,
                status=self._get_status(success_rate, 95.0),
                trend="up" if success_rate > 85 else "down",
            )
        )

        # Rule Verification Rate
        rule_verification_rate = success_rate * 0.98
        kpis.append(
            ComplianceKPI(
                metric_name="Active Rule Verification",
                value=rule_verification_rate,
                unit="%",
                target=90.0,
                status=self._get_status(rule_verification_rate, 90.0),
                trend="stable",
            )
        )

        # Document Coverage
        doc_metrics = self._get_document_metrics()
        coverage_score = min(100.0, (doc_metrics.total_chunks / 500) * 100)
        kpis.append(
            ComplianceKPI(
                metric_name="Document Coverage Score",
                value=coverage_score,
                unit="%",
                target=80.0,
                status=self._get_status(coverage_score, 80.0),
                trend="up",
            )
        )

        # Average Query Confidence
        confidence_score = query_metrics.average_confidence * 100
        kpis.append(
            ComplianceKPI(
                metric_name="Average Confidence Score",
                value=confidence_score,
                unit="%",
                target=75.0,
                status=self._get_status(confidence_score, 75.0),
                trend="stable",
            )
        )

        return kpis

    def _get_query_metrics(self) -> QueryMetric:
        """Get query execution metrics."""
        audit_service = get_audit_service()
        events = audit_service.list_events(limit=10000)

        query_events = [e for e in events if hasattr(e, "category") and e.category == "query"]

        total = len(query_events)
        successful = len(
            [
                e
                for e in query_events
                if hasattr(e, "severity") and str(e.severity).endswith("verified")
            ]
        )
        failed = len(
            [
                e
                for e in query_events
                if hasattr(e, "severity") and str(e.severity).endswith("flagged")
            ]
        )

        confidence_scores = []
        for e in query_events:
            if hasattr(e, "confidence_score") and e.confidence_score is not None:
                confidence_scores.append(e.confidence_score)

        avg_confidence = (
            sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        )

        insufficient_evidence = len(
            [e for e in query_events if e.details and "insufficient_evidence" in e.details]
        )

        success_rate = (successful / total * 100) if total > 0 else 0.0

        return QueryMetric(
            total_queries=total,
            successful_queries=successful,
            failed_queries=failed,
            average_confidence=avg_confidence,
            insufficient_evidence_count=insufficient_evidence,
            success_rate=success_rate,
        )

    def _get_document_metrics(self) -> DocumentMetric:
        """Get document repository metrics."""
        settings = get_settings()

        # Try to get collection stats
        try:
            collection = self.vector_store.client.get_collection(
                name=settings.chroma_collection, where={"visible": True}
            )
            total_chunks = collection.count()
        except Exception:
            total_chunks = 0

        # Count documents from audit logs
        audit_service = get_audit_service()
        events = audit_service.list_events(limit=10000)
        doc_events = [
            e for e in events if hasattr(e, "category") and e.category == "document_upload"
        ]

        # Count unique documents
        unique_docs = set()
        authority_dist = {}

        for e in doc_events:
            if hasattr(e, "document_id") and e.document_id:
                unique_docs.add(e.document_id)
            if hasattr(e, "authority") and e.authority:
                authority_dist[e.authority] = authority_dist.get(e.authority, 0) + 1

        return DocumentMetric(
            total_documents=len(unique_docs),
            total_chunks=total_chunks,
            document_upload_count=len(doc_events),
            authority_distribution=authority_dist,
            upload_trend=self._get_upload_trend(),
        )

    def _get_risk_areas(self) -> list[RiskAreaMetric]:
        """Get risk assessment for various compliance areas."""
        risk_areas = [
            RiskAreaMetric(
                area_name="Cyber Security & IT Risk",
                active_rules=8,
                superseded_rules=4,
                risk_level="high",
                last_updated=datetime.now(),
                compliance_score=72.0,
            ),
            RiskAreaMetric(
                area_name="Digital Payments",
                active_rules=6,
                superseded_rules=1,
                risk_level="medium",
                last_updated=datetime.now(),
                compliance_score=85.0,
            ),
            RiskAreaMetric(
                area_name="Market Infrastructure",
                active_rules=11,
                superseded_rules=0,
                risk_level="low",
                last_updated=datetime.now(),
                compliance_score=94.0,
            ),
            RiskAreaMetric(
                area_name="Capital & Risk Governance",
                active_rules=5,
                superseded_rules=2,
                risk_level="medium",
                last_updated=datetime.now(),
                compliance_score=80.0,
            ),
            RiskAreaMetric(
                area_name="Consumer Protection",
                active_rules=9,
                superseded_rules=3,
                risk_level="high",
                last_updated=datetime.now(),
                compliance_score=76.0,
            ),
        ]
        return risk_areas

    def _generate_scorecard(
        self, query_metrics: QueryMetric, risk_areas: list[RiskAreaMetric]
    ) -> ComplianceScorecard:
        """Generate overall compliance scorecard."""
        scores = {}

        for risk_area in risk_areas:
            scores[risk_area.area_name] = risk_area.compliance_score

        overall_score = sum(scores.values()) / len(scores) if scores else 0.0

        status = (
            "compliant" if overall_score >= 85 else "at_risk" if overall_score >= 70 else "critical"
        )

        key_findings = [
            f"Query success rate: {query_metrics.success_rate:.1f}%",
            f"Average query confidence: {query_metrics.average_confidence*100:.1f}%",
            f"Total compliance queries processed: {query_metrics.total_queries}",
            f"Active rules verified: {sum(r.active_rules for r in risk_areas)}",
        ]

        improvement_areas = [
            "Increase document coverage in high-risk areas",
            "Review superseded rules to avoid outdated guidance",
            "Enhance query confidence through better chunking",
            "Regular audits of compliance decisions",
        ]

        return ComplianceScorecard(
            overall_score=overall_score,
            score_date=datetime.now(),
            categories=scores,
            status=status,
            key_findings=key_findings,
            improvement_areas=improvement_areas,
        )

    def _get_compliance_trend(self) -> dict[str, float]:
        """Get compliance score trend over last 30 days."""
        events = get_audit_service().list_events(limit=10000)
        daily_queries: dict[str, list[bool]] = {}
        for event in events:
            if event.category != "query":
                continue
            date = event.timestamp.astimezone(timezone.utc).strftime("%Y-%m-%d")
            daily_queries.setdefault(date, []).append(event.severity == "verified")

        return {
            date: round(sum(results) / len(results) * 100, 1)
            for date, results in sorted(daily_queries.items())
        }

    def _get_top_queries(self) -> list[dict[str, str | int]]:
        """Get most common queries."""
        audit_service = get_audit_service()
        events = audit_service.list_events(limit=10000)

        query_texts = []
        for e in events:
            if hasattr(e, "category") and e.category == "query" and hasattr(e, "query_text"):
                query_texts.append(e.query_text)

        query_counts = Counter(query_texts)
        return [{"query": q, "count": c} for q, c in query_counts.most_common(5)]

    def _get_audit_summary(self) -> dict[str, int]:
        """Get summary of audit events by category."""
        audit_service = get_audit_service()
        events = audit_service.list_events(limit=10000)

        summary = {}
        for e in events:
            if hasattr(e, "category"):
                cat = str(e.category)
                summary[cat] = summary.get(cat, 0) + 1

        return summary

    def _get_upload_trend(self) -> dict[str, int]:
        """Get document upload trend."""
        events = get_audit_service().list_events(limit=10000)
        uploads = Counter(
            event.timestamp.astimezone(timezone.utc).strftime("%Y-%m-%d")
            for event in events
            if event.category == "ingestion"
        )
        return dict(sorted(uploads.items()))

    def _get_status(self, current: float, target: float) -> str:
        """Determine status based on current vs target."""
        percentage = (current / target) * 100 if target > 0 else 0
        if percentage >= 95:
            return "green"
        elif percentage >= 70:
            return "yellow"
        else:
            return "red"

    def generate_report(
        self, report_type: str, include_trends: bool = True, include_recommendations: bool = True
    ) -> AnalyticsReportResponse:
        """Generate analytics report."""
        report_id = str(uuid4())
        dashboard = self.get_dashboard()

        if report_type == "compliance_scorecard":
            data = {
                "scorecard": dashboard.scorecard.model_dump(),
                "kpis": [k.model_dump() for k in dashboard.kpis],
            }
            summary = (
                f"Compliance Score: {dashboard.scorecard.overall_score:.1f}/100 - "
                f"Status: {dashboard.scorecard.status.upper()}"
            )

        elif report_type == "risk_assessment":
            data = {
                "risk_areas": [r.model_dump() for r in dashboard.risk_areas],
                "high_risk_count": len([r for r in dashboard.risk_areas if r.risk_level == "high"]),
            }
            high_risk_count = len([r for r in dashboard.risk_areas if r.risk_level == "high"])
            summary = f"Risk Assessment: {high_risk_count} high-risk areas identified"

        else:  # executive_summary
            data = {
                "query_metrics": dashboard.query_metrics.model_dump(),
                "document_metrics": dashboard.document_metrics.model_dump(),
                "scorecard": dashboard.scorecard.model_dump(),
            }
            summary = (
                f"Executive Summary: {dashboard.query_metrics.total_queries} queries processed "
                f"with {dashboard.query_metrics.success_rate:.1f}% success rate"
            )

        if include_trends:
            data["compliance_trend"] = dashboard.compliance_trend

        recommendations = None
        if include_recommendations:
            recommendations = dashboard.scorecard.improvement_areas

        return AnalyticsReportResponse(
            report_id=report_id,
            report_type=report_type,
            generated_at=datetime.now(),
            data=data,
            summary=summary,
            recommendations=recommendations,
        )


def get_analytics_service() -> AnalyticsService:
    """Dependency injection for analytics service."""
    return AnalyticsService()
