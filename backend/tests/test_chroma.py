from collections.abc import Sequence
from pathlib import Path

from app.schemas.chunk import DocumentChunk
from app.vectorstore.chroma import ChromaVectorStore


class TestEmbeddingFunction:
    def __call__(self, input: Sequence[str]) -> list[list[float]]:
        return [[float(len(text)), 1.0] for text in input]


def test_chroma_persists_chunks_and_supports_metadata_filter(tmp_path: Path) -> None:
    chroma_directory = str(tmp_path / "chroma")

    chunks = [
        DocumentChunk(
            chunk_id="chunk-current",
            document_id="circ-2025-004",
            text="Procedure B is currently required for high-value cash transactions.",
            title="Circular 2025-004",
            document_type="circular",
            section="2",
            page=5,
            status="active",
        ),
        DocumentChunk(
            chunk_id="chunk-old",
            document_id="circ-2023-011",
            text="Procedure A was required for high-value cash transactions.",
            title="Circular 2023-011",
            document_type="circular",
            status="superseded",
        ),
    ]

    # First store instance: insert the chunks.
    store = ChromaVectorStore(
        directory=chroma_directory,
        collection_name="test_documents",
        embedding_function=TestEmbeddingFunction(),
    )

    store.upsert_chunks(chunks)

    assert store.count == 2

    # Second store instance: reopen the same persistent database.
    reopened_store = ChromaVectorStore(
        directory=chroma_directory,
        collection_name="test_documents",
        embedding_function=TestEmbeddingFunction(),
    )

    results = reopened_store.search(
        "high-value cash transactions",
        where={"status": "active"},
    )

    assert len(results) == 1
    assert results[0]["chunk_id"] == "chunk-current"
    assert results[0]["metadata"]["page"] == 5


def test_chroma_deletes_all_chunks_for_document(tmp_path: Path) -> None:
    store = ChromaVectorStore(
        directory=str(tmp_path / "chroma"),
        collection_name="test_documents",
        embedding_function=TestEmbeddingFunction(),
    )
    store.upsert_chunks([
        DocumentChunk(
            chunk_id="chunk-one",
            document_id="doc-one",
            text="Current requirement text.",
            title="Document One",
            document_type="circular",
            status="active",
        ),
        DocumentChunk(
            chunk_id="chunk-two",
            document_id="doc-two",
            text="Another requirement text.",
            title="Document Two",
            document_type="circular",
            status="active",
        ),
    ])

    store.delete_document("doc-one")

    assert store.count == 1
    assert store.search("Current requirement text.") == []