from fastapi import APIRouter, Depends, File, UploadFile

from app.schemas.document import DocumentSummary, DocumentUploadResponse
from app.services.document_service import DocumentService

router = APIRouter()


def get_document_service() -> DocumentService:
    return DocumentService()


@router.get("", response_model=list[DocumentSummary])
def list_documents() -> list[DocumentSummary]:
    return []


@router.post("/upload", response_model=DocumentUploadResponse, status_code=202)
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
) -> DocumentUploadResponse:
    return await service.ingest(file)
