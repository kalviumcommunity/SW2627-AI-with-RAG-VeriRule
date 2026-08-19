from uuid import uuid4

from app.schemas.query import QueryRequest, QueryResponse


class QueryService:
    """Application boundary for retrieval, rule resolution, and grounded generation."""

    def answer(self, request: QueryRequest) -> QueryResponse:
        return QueryResponse(
            query_id=str(uuid4()),
            question=request.question,
            answer=(
                "The available compliance documents do not provide sufficient evidence "
                "to determine the current requirement."
            ),
            status="insufficient_evidence",
        )
