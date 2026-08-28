from fastapi.testclient import TestClient

from app.main import app
from app.services import query_service

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_query_fails_safely_without_evidence() -> None:
    response = client.post("/queries", json={"question": "What KYC rule applies?"})

    assert response.status_code == 200
    assert response.json()["status"] == "insufficient_evidence"
    assert response.json()["sources"] == []


def test_document_upload_is_accepted_for_ingestion() -> None:
    response = client.post(
        "/documents/upload",
        files={"file": ("circular.txt", b"sample compliance content", "text/plain")},
    )

    assert response.status_code == 202
    assert response.json()["status"] == "active"


def test_query_rejects_weak_retrieval_evidence(monkeypatch) -> None:
    class WeakVectorStore:
        def search(self, question: str, n_results: int, where: dict[str, str]) -> list[dict]:
            return [
                {
                    "chunk_id": "weak-match",
                    "text": "Unrelated archived guidance.",
                    "metadata": {
                        "document_id": "old-doc",
                        "title": "Unrelated guidance",
                        "document_type": "circular",
                        "status": "active",
                    },
                    "distance": 0.91,
                }
            ]

    monkeypatch.setattr(query_service, "get_vector_store", lambda: WeakVectorStore())

    response = client.post(
        "/queries",
        json={"question": "What requirement applies to a wire transfer?"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "insufficient_evidence"
    assert response.json()["sources"] == []
