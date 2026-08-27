import time
from datetime import datetime
from uuid import uuid4

from app.schemas.audit import AuditCategory, AuditEventCreate, AuditSeverity
from app.schemas.query import QueryRequest, QueryResponse, SourceReference
from app.services.audit_service import get_audit_service
from app.vectorstore.chroma import get_vector_store


class QueryService:
    """Application boundary for retrieval, rule resolution, and grounded generation."""

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
        else:
            primary_source = sources[0]
            answer = f"The retrieved current rule states: {primary_source.passage}"
            confidence = max(0.0, min(1.0, 1 - retrieved[0]["distance"]))
            status = "active_rule_verified"
            severity = AuditSeverity.VERIFIED

        duration_ms = int((time.time() - start_time) * 1000)

        # Record event in Audit Service
        audit_service = get_audit_service()
        audit_service.log_event(
            AuditEventCreate(
                title=f"Compliance Query: {request.question[:60]}...",
                category=AuditCategory.QUERY,
                severity=severity,
                authority=sources[0].authority if sources else None,
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
        )

    @staticmethod
    def _retrieve(question: str) -> list[dict[str, object]]:
        try:
            return get_vector_store().search(question, n_results=5, where={"status": "active"})
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
            section=str(metadata["section"]) if metadata.get("section") else None,
            page=int(metadata["page"]) if metadata.get("page") else None,
            status=str(metadata["status"]),
            effective_date=datetime.fromisoformat(str(effective_date)) if effective_date else None,
            passage=str(result["text"]),
        )

