import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from app.schemas.audit import AuditCategory, AuditEvent, AuditEventCreate, AuditSeverity, AuditStats

AUDIT_LOG_FILE = Path("data/audit_logs.json")


class AuditService:
    """Service for capturing, persisting, and querying compliance audit trail events."""

    def __init__(self, storage_path: Path = AUDIT_LOG_FILE) -> None:
        self.storage_path = storage_path
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self._events: List[AuditEvent] = self._load_events()

        if not self._events:
            self._seed_initial_audits()

    def _load_events(self) -> List[AuditEvent]:
        if not self.storage_path.exists():
            return []
        try:
            with open(self.storage_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                events = []
                for item in raw_data:
                    item["timestamp"] = datetime.fromisoformat(item["timestamp"])
                    events.append(AuditEvent(**item))
                return events
        except Exception:
            return []

    def _save_events(self) -> None:
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                dumpable = []
                for item in self._events:
                    d = item.model_dump()
                    d["timestamp"] = d["timestamp"].isoformat()
                    dumpable.append(d)
                json.dump(dumpable, f, indent=2)
        except Exception:
            pass

    def _seed_initial_audits(self) -> None:
        initial_entries = [
            AuditEventCreate(
                title="KYC Customer Verification Policy Match",
                category=AuditCategory.QUERY,
                severity=AuditSeverity.VERIFIED,
                authority="Reserve Bank of India",
                query_text="What KYC requirement currently applies to high-value cash transactions?",
                document_id="RBI/2023-24/108",
                document_title="Master Direction on Cyber Security Framework for Financial Entities",
                confidence_score=0.96,
                passage_text="Entities must maintain mandatory identity verification logs and 24x7 SOC transaction monitoring for all transactions exceeding reporting thresholds.",
                section="Section 3.1.2",
                execution_time_ms=142,
                details="Rule verified with 96% vector similarity against active Master Direction.",
            ),
            AuditEventCreate(
                title="Superseded Password Standard Inspection",
                category=AuditCategory.SUPERSESSION,
                severity=AuditSeverity.SUPERSEDED,
                authority="Reserve Bank of India",
                query_text="What password complexity standard governs user authentication?",
                document_id="RBI/2016-17/38",
                document_title="Cyber Security Framework in Banks (Baseline Guidance)",
                confidence_score=0.88,
                passage_text="Baseline guidance superseded by Master Direction RBI/2023-24/108 requiring multi-factor hardware cryptographic tokens.",
                section="Section 2.1",
                execution_time_ms=89,
                details="Flagged historical circular RBI/2016-17/38 as superseded by RBI/2023-24/108.",
            ),
            AuditEventCreate(
                title="Stock Broker WORM Storage Audit",
                category=AuditCategory.VERIFICATION,
                severity=AuditSeverity.VERIFIED,
                authority="SEBI",
                query_text="How long must order audit logs be preserved under SEBI regulations?",
                document_id="SEBI/HO/MIRSD/2022/101",
                document_title="Framework for Cyber Security and Cyber Resilience for Stock Brokers",
                confidence_score=0.98,
                passage_text="Authentication and order logs must be stored in Write-Once-Read-Many (WORM) media for a minimum of 7 years.",
                section="Section 6.2.0",
                execution_time_ms=115,
                details="7-year immutable audit storage rule matched with source citation.",
            ),
            AuditEventCreate(
                title="Digital Payment OTP Binding Check",
                category=AuditCategory.QUERY,
                severity=AuditSeverity.VERIFIED,
                authority="Reserve Bank of India",
                query_text="Which cyber security controls govern our payment infrastructure?",
                document_id="RBI/2021-22/15",
                document_title="Master Direction – Digital Payment Security Controls in Banks",
                confidence_score=0.94,
                passage_text="Authentication tokens must dynamically tie the OTP to specific beneficiary account details and payment amount.",
                section="Section 4.1.1",
                execution_time_ms=130,
                details="Verified dynamic OTP beneficiary binding clause.",
            ),
            AuditEventCreate(
                title="Operational Resilience ICT Scenario Indexing",
                category=AuditCategory.INGESTION,
                severity=AuditSeverity.INFO,
                authority="Basel Committee",
                query_text=None,
                document_id="BCBS/D516",
                document_title="Principles for Operational Resilience in Commercial Banks",
                confidence_score=1.0,
                passage_text="Pillar 2 capital assessment must incorporate cyber operational outage and recovery scenarios.",
                section="Principle 4",
                execution_time_ms=310,
                details="Successfully parsed and indexed global Basel principles into vector store.",
            ),
        ]

        for entry in initial_entries:
            self.log_event(entry)

    def log_event(self, event_create: AuditEventCreate) -> AuditEvent:
        now = datetime.now(timezone.utc)
        raw_sig = f"{now.isoformat()}:{event_create.title}:{event_create.document_id or 'none'}:{uuid4()}"
        verification_hash = f"0x{hashlib.sha256(raw_sig.encode()).hexdigest()[:16].upper()}"

        event = AuditEvent(
            id=f"AUD-{uuid4().hex[:8].upper()}",
            timestamp=now,
            verification_hash=verification_hash,
            **event_create.model_dump(),
        )

        self._events.insert(0, event)
        self._save_events()
        return event

    def list_events(
        self,
        category: Optional[AuditCategory] = None,
        severity: Optional[AuditSeverity] = None,
        search: Optional[str] = None,
        limit: int = 100,
    ) -> List[AuditEvent]:
        result = self._events

        if category:
            result = [e for e in result if e.category == category]

        if severity:
            result = [e for e in result if e.severity == severity]

        if search and search.strip():
            q = search.lower().strip()
            result = [
                e for e in result
                if q in e.title.lower()
                or (e.query_text and q in e.query_text.lower())
                or (e.document_id and q in e.document_id.lower())
                or (e.authority and q in e.authority.lower())
                or (e.details and q in e.details.lower())
            ]

        return result[:limit]

    def get_stats(self) -> AuditStats:
        total = len(self._events)
        verified = sum(1 for e in self._events if e.severity == AuditSeverity.VERIFIED)
        flagged = sum(1 for e in self._events if e.severity == AuditSeverity.FLAGGED)
        superseded = sum(1 for e in self._events if e.severity == AuditSeverity.SUPERSEDED)

        scores = [e.confidence_score for e in self._events if e.confidence_score is not None]
        avg_confidence = round(sum(scores) / len(scores), 2) if scores else 0.0

        return AuditStats(
            total_events=total,
            verified_count=verified,
            flagged_count=flagged,
            superseded_count=superseded,
            average_confidence=avg_confidence,
        )


_audit_service_instance = AuditService()


def get_audit_service() -> AuditService:
    return _audit_service_instance
