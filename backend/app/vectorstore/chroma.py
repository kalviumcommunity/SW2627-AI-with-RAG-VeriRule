from functools import lru_cache
from pathlib import Path
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection
from chromadb.api.types import EmbeddingFunction
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

from app.core.config import Settings, get_settings
from app.schemas.chunk import DocumentChunk


class ChromaVectorStore:
    """Persistent Chroma repository for embedded compliance document chunks."""

    def __init__(
        self,
        directory: str,
        collection_name: str,
        embedding_function: EmbeddingFunction | None = None,
    ) -> None:
        Path(directory).mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=directory)
        self.collection: Collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
            embedding_function=embedding_function or DefaultEmbeddingFunction(),
        )

    @property
    def count(self) -> int:
        return self.collection.count()

    def upsert_chunks(self, chunks: list[DocumentChunk]) -> None:
        if not chunks:
            return

        self.collection.upsert(
            ids=[chunk.chunk_id for chunk in chunks],
            documents=[chunk.text for chunk in chunks],
            metadatas=[self._metadata_for(chunk) for chunk in chunks],
        )

    def delete_document(self, document_id: str) -> None:
        self.collection.delete(where={"document_id": document_id})

    def get_document_chunks(self, document_id: str) -> list[dict[str, Any]]:
        result = self.collection.get(
            where={"document_id": document_id},
            include=["documents", "metadatas"],
        )
        ids = result.get("ids", [])
        documents = result.get("documents", []) or []
        metadatas = result.get("metadatas", []) or []
        return [
            {
                "chunk_id": chunk_id,
                "text": documents[index],
                "metadata": metadatas[index] or {},
            }
            for index, chunk_id in enumerate(ids)
        ]

    def search(
        self,
        query: str,
        n_results: int = 5,
        where: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        if not query.strip():
            return []

        result = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        return self._flatten_query_result(result)

    @staticmethod
    def _metadata_for(chunk: DocumentChunk) -> dict[str, str | int | float | bool]:
        metadata: dict[str, str | int | float | bool] = {
            "document_id": chunk.document_id,
            "title": chunk.title,
            "document_type": chunk.document_type,
            "status": chunk.status,
        }
        optional_values = {
            "section": chunk.section,
            "page": chunk.page,
            "issue_date": chunk.issue_date.isoformat() if chunk.issue_date else None,
            "effective_date": chunk.effective_date.isoformat() if chunk.effective_date else None,
            "version": chunk.version,
            "authority": chunk.authority,
            "supersedes": chunk.supersedes,
            "superseded_by": chunk.superseded_by,
        }
        metadata.update({key: value for key, value in optional_values.items() if value is not None})
        return metadata

    @staticmethod
    def _flatten_query_result(result: dict[str, Any]) -> list[dict[str, Any]]:
        ids = result.get("ids", [[]])[0]
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]
        return [
            {
                "chunk_id": chunk_id,
                "text": documents[index],
                "metadata": metadatas[index],
                "distance": distances[index],
            }
            for index, chunk_id in enumerate(ids)
        ]


@lru_cache
def get_vector_store() -> ChromaVectorStore:
    settings: Settings = get_settings()
    return ChromaVectorStore(
        directory=settings.chroma_directory,
        collection_name=settings.chroma_collection,
    )