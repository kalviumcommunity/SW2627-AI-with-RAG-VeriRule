import hashlib
from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from app.schemas.remediation import (
    CAPACreateRequest,
    CAPASignoffRequest,
    CAPATask,
    RemediationSummary,
)

router = APIRouter()

# Initial in-memory CAPA database for demonstration
CAPA_DB: list[CAPATask] = [
    CAPATask(
        capa_id="CAPA-2026-001",
        breach_id="BREACH-PAY-882",
        title="Enforce Mandatory MFA for All Digital Payments",
        circular_id="RBI/2023-24/89",
        department="Core Banking System",
        assignee="Vikramaditya S (Lead Architect)",
        status="in_progress",
        risk_level="critical",
        created_at=datetime.now() - timedelta(days=5),
        due_date=datetime.now() + timedelta(days=9),
        description="RBI Master Direction 2023 revoked the INR 50,000 MFA exemption limit. API Gateway still permits single-factor auth on low-value wires.",
        corrective_action="Update API Gateway security interceptor policy to enforce adaptive MFA challenge on 100% of payment endpoints.",
        evidence_proof=None,
        signed_off_by=None,
        signed_off_at=None,
    ),
    CAPATask(
        capa_id="CAPA-2026-002",
        breach_id="BREACH-SOC-104",
        title="Automate Cyber Incident Escalation Webhook to CSIRT-Fin",
        circular_id="RBI/2023-24/89",
        department="SOC & Cyber Security",
        assignee="Ananya R (CISO Lead)",
        status="under_review",
        risk_level="critical",
        created_at=datetime.now() - timedelta(days=10),
        due_date=datetime.now() + timedelta(days=2),
        description="Reporting SLA for critical cyber intrusion compressed from 24 Hours to 2 Hours under new Master Direction.",
        corrective_action="Deployed automated SIEM webhook integration to dispatch incident telemetry payload within 120 seconds of detection.",
        evidence_proof="PR #482 merged. SIEM alert simulation validated against CSIRT-Fin sandbox webhook.",
        signed_off_by=None,
        signed_off_at=None,
    ),
    CAPATask(
        capa_id="CAPA-2026-003",
        breach_id="BREACH-KYC-319",
        title="Trigger 12-Month High-Risk Periodic KYC Refresh Campaign",
        circular_id="RBI/2024-25/12",
        department="KYC Operations",
        assignee="Rohan K (Operations Manager)",
        status="open",
        risk_level="high",
        created_at=datetime.now() - timedelta(days=2),
        due_date=datetime.now() + timedelta(days=12),
        description="High-Risk customer refresh window reduced from 2 years to 1 year under 2024 KYC Master Direction update.",
        corrective_action="Batch flag 14,200 accounts exceeding 12 months since last KYC document verification and issue automated SMS/Email portal reminders.",
        evidence_proof=None,
        signed_off_by=None,
        signed_off_at=None,
    ),
    CAPATask(
        capa_id="CAPA-2026-004",
        breach_id="BREACH-NET-701",
        title="Decommission TLS 1.1 Support on Branch Edge Routers",
        circular_id="RBI/2018-19/124",
        department="Network Engineering",
        assignee="Suresh M (Network Admin)",
        status="closed",
        risk_level="high",
        created_at=datetime.now() - timedelta(days=20),
        due_date=datetime.now() - timedelta(days=5),
        description="TLS 1.1 legacy fallback connection allowance has been formally revoked.",
        corrective_action="Applied firmware update across 450 branch edge firewalls disabling TLS 1.1 SSL handshakes.",
        evidence_proof="Qualys SSL Vulnerability Scan Report #QS-99120 showing 100% TLS 1.2+ compliance across all branch IP blocks.",
        signed_off_by="Harshal Kale (Senior Chief Risk Officer)",
        signed_off_at=datetime.now() - timedelta(days=4),
    ),
]


@router.get("/tasks", response_model=list[CAPATask])
def list_capa_tasks() -> list[CAPATask]:
    return CAPA_DB


@router.get("/summary", response_model=RemediationSummary)
def get_remediation_summary() -> RemediationSummary:
    total = len(CAPA_DB)
    open_c = sum(1 for c in CAPA_DB if c.status == "open")
    in_prog = sum(1 for c in CAPA_DB if c.status == "in_progress")
    review = sum(1 for c in CAPA_DB if c.status == "under_review")
    closed = sum(1 for c in CAPA_DB if c.status == "closed")
    now = datetime.now()
    overdue = sum(1 for c in CAPA_DB if c.due_date < now and c.status != "closed")
    readiness = (closed / total * 100.0) if total > 0 else 100.0

    return RemediationSummary(
        total_breaches=total,
        open_capas=open_c,
        in_progress=in_prog,
        under_review=review,
        closed_and_certified=closed,
        overdue_count=overdue,
        audit_readiness_score=round(readiness, 1),
    )


@router.post("/capa", response_model=CAPATask)
def create_capa(req: CAPACreateRequest) -> CAPATask:
    capa_id = f"CAPA-{datetime.now().year}-{str(uuid4())[:4].upper()}"
    breach_id = f"BREACH-{str(uuid4())[:6].upper()}"
    now = datetime.now()
    new_task = CAPATask(
        capa_id=capa_id,
        breach_id=breach_id,
        title=req.title,
        circular_id=req.circular_id,
        department=req.department,
        assignee=req.assignee,
        status="open",
        risk_level=req.risk_level,
        created_at=now,
        due_date=now + timedelta(days=req.due_days),
        description=req.description,
        corrective_action=req.corrective_action,
        evidence_proof=None,
        signed_off_by=None,
        signed_off_at=None,
    )
    CAPA_DB.insert(0, new_task)
    return new_task


@router.post("/signoff", response_model=CAPATask)
def signoff_capa(req: CAPASignoffRequest) -> CAPATask:
    for task in CAPA_DB:
        if task.capa_id == req.capa_id:
            task.evidence_proof = req.evidence_proof
            task.signed_off_by = req.signed_off_by
            task.signed_off_at = datetime.now()
            task.status = "closed"
            return task
    raise HTTPException(status_code=404, detail=f"CAPA task '{req.capa_id}' not found.")
