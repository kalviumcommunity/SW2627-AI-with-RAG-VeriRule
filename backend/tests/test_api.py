from fastapi.testclient import TestClient

from app.main import app

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
    assert response.json()["status"] == "queued"
