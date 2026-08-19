from fastapi import APIRouter, Depends

from app.schemas.query import QueryRequest, QueryResponse
from app.services.query_service import QueryService

router = APIRouter()


def get_query_service() -> QueryService:
    return QueryService()


@router.post("", response_model=QueryResponse)
def submit_query(
    request: QueryRequest,
    service: QueryService = Depends(get_query_service),
) -> QueryResponse:
    return service.answer(request)
