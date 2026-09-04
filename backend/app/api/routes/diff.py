import hashlib
from uuid import uuid4

from fastapi import APIRouter
from app.schemas.diff import (
    ClauseDiff,
    DepartmentalDeltaImpact,
    RegulatoryDiffRequest,
    RegulatoryDiffResponse,
)

router = APIRouter()


PRESET_DIFFS: dict[str, RegulatoryDiffResponse] = {
    "RBI/2018-19/124_vs_RBI/2023-24/89": RegulatoryDiffResponse(
        comparison_id="DIFF-2026-PAY-8921",
        baseline_doc_id="RBI/2018-19/124",
        baseline_title="Master Direction on Digital Payment Security Controls (2018 Baseline)",
        target_doc_id="RBI/2023-24/89",
        target_title="Master Direction on Cyber Resilience & Digital Banking (2023 Update)",
        effective_date="2023-11-01",
        diff_summary={"added": 3, "removed": 2, "modified": 4, "unchanged": 12},
        clauses=[
            ClauseDiff(
                clause_id="SEC-4.2",
                section="Section 4 - Authentication Controls",
                diff_status="modified",
                old_text="Two-Factor Authentication (2FA) is recommended for high-value internet banking transfers exceeding INR 50,000.",
                new_text="Mandatory Adaptive Multi-Factor Authentication (MFA) incorporating hardware token or biometric signature required for ALL digital payment transactions regardless of value threshold.",
                parameter_change="Threshold changed from > INR 50,000 -> Mandatory for ALL transactions. Added mandatory Biometric/Hardware Token.",
                risk_level="critical",
                affected_departments=["Core Banking System", "Mobile Banking UI", "Fraud Risk"],
                action_required="Update API gateway to enforce 2FA/MFA on all transaction flows regardless of amount."
            ),
            ClauseDiff(
                clause_id="SEC-7.1",
                section="Section 7 - Cyber Incident Reporting SLA",
                diff_status="modified",
                old_text="Cyber security breaches and ransomware intrusions must be reported to RBI Cyber Security Cell within 24 hours of detection.",
                new_text="Mandatory reporting of cyber incidents, rogue IP hits, and unauthorized database exfiltration within 2 hours of initial detection to CSIRT-Fin & RBI.",
                parameter_change="Incident reporting SLA shortened from 24 Hours -> 2 Hours.",
                risk_level="critical",
                affected_departments=["SOC Incident Response", "Information Security", "Compliance"],
                action_required="Deploy automated SIEM webhook alert integration for instantaneous CSIRT escalation."
            ),
            ClauseDiff(
                clause_id="SEC-9.3",
                section="Section 9 - Legacy Cipher Suites",
                diff_status="removed",
                old_text="TLS 1.1 and RSA 1024-bit key exchange are permissible for legacy branch network fallback connections until notice.",
                new_text=None,
                parameter_change="Superseded & Revoked. TLS 1.1 completely banned.",
                risk_level="high",
                affected_departments=["Network Infrastructure", "Core Banking Ops"],
                action_required="Disable TLS 1.1 protocol support across all internet-facing edge routers and SSL offloaders."
            ),
            ClauseDiff(
                clause_id="SEC-11.0",
                section="Section 11 - Quantum-Resistant Encryption Standard",
                diff_status="added",
                old_text=None,
                new_text="All inter-bank settlement transactions exceeding INR 10,00,00,000 must utilize AES-256 and PQC (Post-Quantum Cryptography) hybrid transport wrappers.",
                parameter_change="New Requirement: Mandatory AES-256 + PQC for wire transfers > INR 10 Cr.",
                risk_level="high",
                affected_departments=["Treasury Operations", "Payment Gateway Architecture"],
                action_required="Upgrade Hardware Security Modules (HSM) to support post-quantum hybrid key generation."
            ),
            ClauseDiff(
                clause_id="SEC-3.1",
                section="Section 3 - Customer Data Encryption",
                diff_status="unchanged",
                old_text="Customer PII (Personally Identifiable Information) must be encrypted at rest using AES-256.",
                new_text="Customer PII (Personally Identifiable Information) must be encrypted at rest using AES-256.",
                parameter_change="No change",
                risk_level="low",
                affected_departments=["Database Administration"],
                action_required="Maintain current AES-256 database encryption policy."
            ),
        ],
        department_impacts=[
            DepartmentalDeltaImpact(
                department="SOC & Information Security",
                changes_count=3,
                risk_summary="Critical SLA compression from 24 hours to 2 hours for CSIRT notification.",
                sla_impact="Immediate (within 7 days)"
            ),
            DepartmentalDeltaImpact(
                department="Core Banking System & Mobile Engineering",
                changes_count=2,
                risk_summary="Mandatory MFA enforcement on all digital transfers (eliminating INR 50k exemption).",
                sla_impact="Medium (within 30 days)"
            ),
            DepartmentalDeltaImpact(
                department="Treasury & Payment Gateways",
                changes_count=1,
                risk_summary="Post-Quantum Hybrid encryption deployment for high-value interbank wires.",
                sla_impact="Long-term (within 90 days)"
            ),
        ],
        hash_certificate=hashlib.sha256("RBI/2018-19/124_vs_RBI/2023-24/89_DELTA_CERT".encode()).hexdigest()
    )
}


@router.post("/compare", response_model=RegulatoryDiffResponse)
def compare_regulatory_docs(request: RegulatoryDiffRequest) -> RegulatoryDiffResponse:
    key = f"{request.baseline_doc_id}_vs_{request.target_doc_id}"
    if key in PRESET_DIFFS:
        return PRESET_DIFFS[key]

    # Dynamic fallback generator for any document pair
    doc_hash = hashlib.sha256(f"{request.baseline_doc_id}_{request.target_doc_id}".encode()).hexdigest()
    return RegulatoryDiffResponse(
        comparison_id=f"DIFF-{str(uuid4())[:8].upper()}",
        baseline_doc_id=request.baseline_doc_id,
        baseline_title=f"Historical Regulatory Directive ({request.baseline_doc_id})",
        target_doc_id=request.target_doc_id,
        target_title=f"Active Master Direction ({request.target_doc_id})",
        effective_date="2024-01-15",
        diff_summary={"added": 2, "removed": 1, "modified": 3, "unchanged": 8},
        clauses=[
            ClauseDiff(
                clause_id="CLAUSE-1.1",
                section="General Compliance Thresholds",
                diff_status="modified",
                old_text=f"Standard monitoring threshold applied under baseline {request.baseline_doc_id}.",
                new_text=f"Strict continuous automated monitoring enforced under superseding directive {request.target_doc_id}.",
                parameter_change="Audit frequency increased from Quarterly to Real-Time continuous monitoring.",
                risk_level="high",
                affected_departments=["Risk & Compliance", "Internal Audit"],
                action_required="Reconfigure automated compliance monitoring engine."
            ),
            ClauseDiff(
                clause_id="CLAUSE-2.4",
                section="Record Retention Mandate",
                diff_status="added",
                old_text=None,
                new_text="Audit trails and decision proof certificates must be retained for a minimum of 10 years in immutable WORM storage.",
                parameter_change="New Mandate: 10-Year immutable audit retention.",
                risk_level="medium",
                affected_departments=["IT Storage Infrastructure", "Legal"],
                action_required="Provision WORM cloud storage bucket for audit logs."
            ),
        ],
        department_impacts=[
            DepartmentalDeltaImpact(
                department="Risk & Compliance",
                changes_count=3,
                risk_summary="Continuous monitoring and immutable audit trail requirements.",
                sla_impact="30 Days"
            )
        ],
        hash_certificate=doc_hash
    )
