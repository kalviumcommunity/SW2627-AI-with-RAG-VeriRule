from fastapi import APIRouter

from app.api.routes import analytics, audit, chat, documents, health, queries

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(queries.router, prefix="/queries", tags=["queries"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

