from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.schemas.document import DocumentChunkReference, DocumentSummary, DocumentUploadResponse
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


@router.get("/{document_id:path}/chunks", response_model=list[DocumentChunkReference])
def list_document_chunks(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> list[DocumentChunkReference]:
    if not any(document.document_id == document_id for document in service.list_documents()):
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return service.list_chunks(document_id)


@router.delete("/{document_id:path}", status_code=200)
def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> dict:
    success = service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return {"status": "success", "message": f"Document '{document_id}' deleted successfully."}
