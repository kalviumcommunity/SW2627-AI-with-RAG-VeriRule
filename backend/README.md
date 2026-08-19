# VeriRule Backend

FastAPI service boundary for the VeriRule React client and future RAG pipeline.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Interactive documentation is at
`http://localhost:8000/docs`.

## Structure

- `app/api`: HTTP routers and route composition.
- `app/core`: application settings and cross-cutting configuration.
- `app/schemas`: request and response contracts shared with the frontend.
- `app/services`: use-case boundaries for query answering and document ingestion.
- `app/main.py`: FastAPI application factory and middleware.
- `tests`: API-level checks.

The retrieval, document parsing, metadata filtering, and LLM calls are intentionally
service boundaries for the first backend slice. They can be implemented with the PRD's
PyMuPDF, LangChain, ChromaDB, and approved LLM provider without changing the API layout.
