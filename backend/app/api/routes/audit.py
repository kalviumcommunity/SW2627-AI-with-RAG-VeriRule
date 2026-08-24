from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.schemas.audit import AuditCategory, AuditEvent, AuditEventCreate, AuditSeverity, AuditStats
from app.services.audit_service import AuditService, get_audit_service

router = APIRouter()


@router.get("/logs", response_model=list[AuditEvent])
def list_audit_logs(
    category: Optional[AuditCategory] = Query(None, description="Filter by event category"),
    severity: Optional[AuditSeverity] = Query(None, description="Filter by audit severity"),
    search: Optional[str] = Query(None, description="Search term across audit fields"),
    limit: int = Query(100, ge=1, le=500),
    service: AuditService = Depends(get_audit_service),
) -> list[AuditEvent]:
    return service.list_events(category=category, severity=severity, search=search, limit=limit)


@router.post("/logs", response_model=AuditEvent, status_code=201)
def create_audit_log(
    event: AuditEventCreate,
    service: AuditService = Depends(get_audit_service),
) -> AuditEvent:
    return service.log_event(event)


@router.get("/stats", response_model=AuditStats)
def get_audit_stats(
    service: AuditService = Depends(get_audit_service),
) -> AuditStats:
    return service.get_stats()
