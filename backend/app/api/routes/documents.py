from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.schemas.document import DocumentSummary, DocumentUploadResponse
from app.services.document_service import DocumentService

router = APIRouter()


def get_document_service() -> DocumentService:
    return DocumentService()


@router.get("", response_model=list[DocumentSummary])
def list_documents(
    search: Optional[str] = Query(None, description="Search term"),
    authority: Optional[str] = Query(None, description="Authority filter"),
    service: DocumentService = Depends(get_document_service),
) -> list[DocumentSummary]:
    return service.list_documents(search=search, authority=authority)


@router.post("/upload", response_model=DocumentUploadResponse, status_code=202)
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
) -> DocumentUploadResponse:
    return await service.ingest(file)


@router.delete("/{document_id}", status_code=200)
def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> dict:
    success = service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return {"status": "success", "message": f"Document '{document_id}' deleted successfully."}
