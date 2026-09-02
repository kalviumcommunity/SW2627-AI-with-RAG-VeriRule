import time
from datetime import datetime
from uuid import uuid4

from app.core.config import get_settings
from app.schemas.audit import AuditCategory, AuditEventCreate, AuditSeverity
from app.schemas.query import QueryRequest, QueryResponse, SourceReference
from app.services.audit_service import get_audit_service
from app.vectorstore.chroma import get_vector_store


class QueryService:
    """Application boundary for retrieval, rule resolution, and grounded generation."""

    @staticmethod
    def _risk_level_for_question(question: str, passage: str) -> str:
        combined = f"{question} {passage}".lower()
        high_risk_terms = [
            "payment", "fund transfer", "wire", "beneficiary", "customer onboarding",
            "kyc", "aml", "fraud", "cyber", "soc", "mfa", "breach", "incident",
        ]
        critical_terms = ["sanctions", "terror", "money laundering", "customer due diligence"]

        if any(term in combined for term in critical_terms):
            return "critical"
        if any(term in combined for term in high_risk_terms):
            return "high"
        if "audit" in combined or "log" in combined or "documentation" in combined:
            return "medium"
        return "low"

    @staticmethod
    def _recommendation_for_source(primary_source: SourceReference, risk_level: str) -> str:
        mandatory = primary_source.passage
        if risk_level == "critical":
            return (
                "Immediate compliance action is required: verify the control owner, confirm supervisory approval, "
                f"and document the control implementation before proceeding with the transaction or process. Evidence: {primary_source.document_id}."
            )
        if risk_level == "high":
            return (
                "Escalate this to the control owner for implementation verification and retain evidence that the "
                f"required safeguards are operational. Apply the current rule from {primary_source.document_id} before approval."
            )
        if risk_level == "medium":
            return (
                "Review the operating control gap against the stated requirement and ensure it is implemented with proof "
                f"of monitoring and retention. Reference {primary_source.document_id} for the governing requirement."
            )
        return (
            "Continue with standard operating controls and keep a record showing compliance with the referenced rule "
            f"from {primary_source.document_id}."
        )

    def answer(self, request: QueryRequest) -> QueryResponse:
        start_time = time.time()
        query_id = str(uuid4())

        retrieved = self._retrieve(request.question)
        sources = [self._source_from_result(result) for result in retrieved]

        if not sources:
            answer = (
                "The available compliance documents do not provide sufficient evidence "
                "to determine the current requirement."
            )
            confidence = None
            status = "insufficient_evidence"
            severity = AuditSeverity.FLAGGED
            authority = None
            risk_level = None
            recommendation = (
                "Upload or index relevant circulars and retry the question so the system can compare the active "
                "rule against the available evidence."
            )
        else:
            primary_source = sources[0]
            answer = f"The retrieved current rule states: {primary_source.passage}"
            confidence = max(0.0, min(1.0, 1 - retrieved[0]["distance"]))
            status = "active_rule_verified"
            severity = AuditSeverity.VERIFIED
            authority = primary_source.authority
            risk_level = self._risk_level_for_question(request.question, primary_source.passage)
            recommendation = self._recommendation_for_source(primary_source, risk_level)

        duration_ms = int((time.time() - start_time) * 1000)

        # Record event in Audit Service
        audit_service = get_audit_service()
        audit_service.log_event(
            AuditEventCreate(
                title=f"Compliance Query: {request.question[:60]}...",
                category=AuditCategory.QUERY,
                severity=severity,
                authority=authority,
                query_text=request.question,
                document_id=sources[0].document_id if sources else None,
                document_title=sources[0].title if sources else None,
                confidence_score=confidence,
                passage_text=sources[0].passage if sources else None,
                section=sources[0].section if sources else None,
                execution_time_ms=duration_ms,
                details=f"Query evaluated with status '{status}' across indexed circular database.",
            )
        )

        return QueryResponse(
            query_id=query_id,
            question=request.question,
            answer=answer,
            status=status,
            sources=sources,
            confidence=confidence,
            authority=authority,
            risk_level=risk_level,
            recommendation=recommendation,
        )

    @staticmethod
    def _retrieve(question: str) -> list[dict[str, object]]:
        try:
            results = get_vector_store().search(question, n_results=5, where={"status": "active"})
            threshold = get_settings().retrieval_distance_threshold
            return [result for result in results if float(result["distance"]) <= threshold]
        except Exception:
            return []

    @staticmethod
    def _source_from_result(result: dict[str, object]) -> SourceReference:
        metadata = result["metadata"]
        effective_date = metadata.get("effective_date")
        return SourceReference(
            document_id=str(metadata["document_id"]),
            title=str(metadata["title"]),
            document_type=str(metadata["document_type"]),
            authority=str(metadata["authority"]) if metadata.get("authority") else None,
            section=str(metadata["section"]) if metadata.get("section") else None,
            page=int(metadata["page"]) if metadata.get("page") else None,
            status=str(metadata["status"]),
            effective_date=datetime.fromisoformat(str(effective_date)) if effective_date else None,
            passage=str(result["text"]),
        )

