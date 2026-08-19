from uuid import uuid4

from fastapi import UploadFile

from app.schemas.document import DocumentUploadResponse


class DocumentService:
    """Application boundary for extraction, chunking, metadata, and embeddings."""

    async def ingest(self, file: UploadFile) -> DocumentUploadResponse:
        return DocumentUploadResponse(
            document_id=str(uuid4()),
            filename=file.filename or "unnamed-document",
            status="queued",
            message="Document ingestion is ready for the extraction pipeline.",
        )
