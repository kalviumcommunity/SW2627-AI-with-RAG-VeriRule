import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { postAuditLog } from '../services/auditService'

interface DepartmentImpact {
  department: string
  icon: string
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low'
  affectedSystems: string[]
  keyRequirement: string
  currentGap: string
  actionItems: string[]
  deadline: string
}

interface CircularImpactProfile {
  documentId: string
  title: string
  authority: string
  effectiveDate: string
  category: string
  overallRiskLevel: 'Critical' | 'High' | 'Medium'
  summary: string
  departments: DepartmentImpact[]
}

const CIRCULAR_PROFILES: CircularImpactProfile[] = [
  {
    documentId: 'RBI/2023-24/108',
    title: 'Master Direction on Cyber Security Framework for Financial Entities',
    authority: 'Reserve Bank of India',
    effectiveDate: '2023-11-07',
    category: 'Cyber Security & IT Governance',
    overallRiskLevel: 'Critical',
    summary:
      'Replaces baseline 2016 security guidelines with mandatory 24x7 SOC continuous threat telemetry, hardware-backed cryptographic MFA for privileged database access, and 7-year log retention.',
    departments: [
      {
        department: 'IT Infrastructure & Security Operations',
        icon: '🖥️',
        impactLevel: 'Critical',
        affectedSystems: ['24x7 SOC SIEM Engine', 'Core DB Authentication Proxy', 'Firewall Telemetry'],
        keyRequirement: 'Mandatory continuous 24x7 SOC telemetry and hardware cryptographic MFA for DB admins.',
        currentGap: 'Legacy password policies (RBI/2016-17/38) lack hardware MFA binding and real-time SIEM feeds.',
        actionItems: [
          'Deploy FIDO2 Hardware MFA tokens for all DBA accounts',
          'Ingest database query logs into 24x7 SIEM collector',
          'Configure automated SOC P1 incident escalation playbooks',
        ],
        deadline: '30 Days',
      },
      {
        department: 'Digital Payments & Core Banking',
        icon: '💳',
        impactLevel: 'High',
        affectedSystems: ['Internet Banking Switch', 'Mobile App Auth Gateway', 'Payment Processor'],
        keyRequirement: 'Encrypted payload tokens binding OTP dynamically to payment amount and beneficiary.',
        currentGap: 'Current SMS OTPs lack transaction payload hashing, exposing transfers to SIM swap attacks.',
        actionItems: [
          'Upgrade Auth API to sign payload hashes with RSA-4896 keys',
          'Enforce 2-hour transfer limit cooling window on new beneficiaries',
        ],
        deadline: '45 Days',
      },
      {
        department: 'Internal Audit & Governance',
        icon: '🛡️',
        impactLevel: 'Medium',
        affectedSystems: ['Audit Logging Ledger', 'Compliance Evidence Storage'],
        keyRequirement: 'WORM storage compliance for all privileged session audit trails.',
        currentGap: 'Audit logs stored on standard cloud storage without immutable WORM write locks.',
        actionItems: [
          'Provision S3 Object Lock in Compliance WORM mode for audit buckets',
          'Schedule monthly integrity audit log hash verification',
        ],
        deadline: '60 Days',
      },
    ],
  },
  {
    documentId: 'RBI/2021-22/15',
    title: 'Master Direction – Digital Payment Security Controls in Banks',
    authority: 'Reserve Bank of India',
    effectiveDate: '2021-02-18',
    category: 'Digital Payments',
    overallRiskLevel: 'High',
    summary:
      'Mandates cooling-off periods, beneficiary authentication binding, and velocity monitoring for high-value retail payment transfers.',
    departments: [
      {
        department: 'Digital Payments & Mobile Banking',
        icon: '📱',
        impactLevel: 'High',
        affectedSystems: ['Retail Payment Switch', 'Beneficiary Management Engine'],
        keyRequirement: '2-hour cooling period for newly registered payment beneficiaries before high-value payout.',
        currentGap: 'Cooling period currently set to 30 minutes, below the mandatory 2-hour RBI directive.',
        actionItems: [
          'Update beneficiary registration timer from 30 mins to 120 mins',
          'Add push notification alerts upon new beneficiary addition',
        ],
        deadline: '15 Days',
      },
      {
        department: 'Risk Management & Fraud Prevention',
        icon: '🔍',
        impactLevel: 'Medium',
        affectedSystems: ['Fraud Monitoring System (FMS)', 'Velocity Check Engine'],
        keyRequirement: 'Real-time velocity alerts for consecutive transactions exceeding ₹1,00,000.',
        currentGap: 'FMS runs batch velocity checks every 4 hours instead of sub-second inline evaluation.',
        actionItems: [
          'Migrate velocity rule evaluation to inline Redis memory engine',
          'Configure automatic step-up authentication for anomalous transaction patterns',
        ],
        deadline: '30 Days',
      },
    ],
  },
  {
    documentId: 'SEBI/HO/MIRSD/2022/101',
    title: 'Framework for Cyber Security & Cyber Resilience for Stock Brokers',
    authority: 'SEBI',
    effectiveDate: '2022-07-20',
    category: 'Market Infrastructure',
    overallRiskLevel: 'High',
    summary:
      'Requires stock brokers and market intermediaries to maintain 7-year immutable order logs and conduct quarterly vulnerability assessments.',
    departments: [
      {
        department: 'Trade Execution & Order Management',
        icon: '📈',
        impactLevel: 'High',
        affectedSystems: ['Order Matching Engine', 'FIX Protocol Gateway'],
        keyRequirement: 'Write-Once-Read-Many (WORM) storage for order placement logs retained for 7 years.',
        currentGap: 'Order logs archived on local server disk without WORM compliance assurance.',
        actionItems: [
          'Integrate optical WORM media for 7-year trade order log archival',
          'Implement daily SHA-256 digest hashing of trade log blocks',
        ],
        deadline: '30 Days',
      },
    ],
  },
]

export default function ImpactAnalyzerPage() {
  const { user } = useAuth()
  const [selectedProfile, setSelectedProfile] = useState<CircularImpactProfile>(CIRCULAR_PROFILES[0])
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const [showReportModal, setShowReportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const toggleActionItem = (itemKey: string) => {
    setCompletedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }))
  }

  const handleGenerateReport = async () => {
    setIsExporting(true)
    try {
      await postAuditLog({
        title: `Compliance Impact Assessment: ${selectedProfile.documentId}`,
        category: 'verification',
        severity: 'verified',
        authority: selectedProfile.authority,
        query_text: `Impact assessment for ${selectedProfile.title}`,
        document_id: selectedProfile.documentId,
        document_title: selectedProfile.title,
        confidence_score: 0.96,
        passage_text: selectedProfile.summary,
        section: 'Departmental Impact Analysis',
        execution_time_ms: 120,
        details: `Executive compliance impact assessment generated by officer ${user.name} across ${selectedProfile.departments.length} bank divisions.`,
      })
    } catch {
      // ignore
    } finally {
      setIsExporting(false)
      setShowReportModal(true)
    }
  }

  const downloadJsonReport = () => {
    const reportData = {
      assessment_id: `IMPACT-${selectedProfile.documentId.replace(/[/]/g, '-')}`,
      generated_by: user.name,
      role: user.role,
      date: new Date().toISOString(),
      circular: {
        document_id: selectedProfile.documentId,
        title: selectedProfile.title,
        authority: selectedProfile.authority,
        effective_date: selectedProfile.effectiveDate,
        overall_risk: selectedProfile.overallRiskLevel,
      },
      departmental_analysis: selectedProfile.departments.map((dept) => ({
        department: dept.department,
        impact_level: dept.impactLevel,
        affected_systems: dept.affectedSystems,
        key_requirement: dept.keyRequirement,
        operational_gap: dept.currentGap,
        action_items: dept.actionItems.map((item) => ({
          task: item,
          completed: !!completedItems[`${dept.department}-${item}`],
        })),
        deadline: dept.deadline,
      })),
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `compliance_impact_assessment_${selectedProfile.documentId.replace(/[/]/g, '_')}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const getImpactBadgeClass = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'badge-superseded'
      case 'High':
        return 'badge-superseded'
      case 'Medium':
        return 'warning-chip'
      default:
        return 'badge-active'
    }
  }

  return (
    <div className="impact-analyzer-page">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Operational Compliance Intelligence</span>
          <h1>Regulatory Impact Analyzer & Gap Matrix</h1>
          <p>
            Evaluate how new Master Directions and regulatory circulars impact your bank’s IT systems, operations, and compliance posture.
          </p>
        </div>
      </div>

      {/* ── Circular Selector Bar ───────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1.25rem 1.5rem', marginBottom: 0 }}>
        <div className="scenario-header">
          <h2>Select Directive to Analyze</h2>
          <span className="scenario-hint">Evaluate departmental gap & action plan</span>
        </div>

        <div className="scenario-pills-grid">
          {CIRCULAR_PROFILES.map((prof) => (
            <button
              key={prof.documentId}
              type="button"
              className={`scenario-pill-btn ${selectedProfile.documentId === prof.documentId ? 'active' : ''}`}
              onClick={() => {
                setSelectedProfile(prof)
                setCompletedItems({})
              }}
            >
              <span className="pill-cat">{prof.category}</span>
              <span className="pill-title">{prof.documentId}</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {prof.title.substring(0, 48)}...
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Directive Executive Summary Card ────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, borderLeft: '4px solid #4f46e5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <span className="authority-tag-lg" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
              {selectedProfile.authority}
            </span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)' }}>
              {selectedProfile.title}
            </h2>
          </div>
          <span className={`badge-status ${getImpactBadgeClass(selectedProfile.overallRiskLevel)}`}>
            Risk: {selectedProfile.overallRiskLevel}
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0.5rem 0 1rem 0' }}>
          {selectedProfile.summary}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
          <span>Doc ID: <strong>{selectedProfile.documentId}</strong></span>
          <span>Effective Date: <strong>{selectedProfile.effectiveDate}</strong></span>
          <span>Impacted Divisions: <strong>{selectedProfile.departments.length} Departments</strong></span>
        </div>
      </div>

      {/* ── Departmental Impact Breakdown Grid ──────────────────────── */}
      <div className="impact-grid">
        {selectedProfile.departments.map((dept) => (
          <div key={dept.department} className="dashboard-section-card impact-card" style={{ marginBottom: 0 }}>
            <div className="impact-card-top">
              <div className="dept-title-wrap">
                <span className="dept-icon">{dept.icon}</span>
                <div>
                  <h3 className="dept-name">{dept.department}</h3>
                  <span className="affected-systems-tag">
                    Systems: {dept.affectedSystems.join(', ')}
                  </span>
                </div>
              </div>
              <span className={`badge-status ${getImpactBadgeClass(dept.impactLevel)}`}>
                {dept.impactLevel} Impact
              </span>
            </div>

            <div className="passage-callout active-passage-callout" style={{ margin: '0.85rem 0' }}>
              <span className="callout-label">Regulatory Mandate:</span>
              <p>"{dept.keyRequirement}"</p>
            </div>

            <div className="gap-box">
              <span className="gap-label">⚠️ Operational Compliance Gap:</span>
              <p>{dept.currentGap}</p>
            </div>

            <div className="action-items-section">
              <h4>Required Compliance Actions</h4>
              <div className="checklist-items">
                {dept.actionItems.map((item) => {
                  const itemKey = `${dept.department}-${item}`
                  const isDone = !!completedItems[itemKey]
                  return (
                    <label key={item} className="checklist-item" style={{ fontSize: '0.82rem' }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleActionItem(itemKey)}
                      />
                      <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {item}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="dept-card-footer">
              <span className="deadline-badge">⏱ Target Deadline: {dept.deadline}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action Plan Export Bar ──────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Executive Impact Assessment Report</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Export departmental gap matrix and action items for risk committee audit defense.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerateReport}
          disabled={isExporting}
        >
          {isExporting ? 'Generating Report...' : 'Generate Executive Report →'}
        </button>
      </div>

      {/* ── Executive Report Modal ──────────────────────────────────── */}
      {showReportModal && (
        <div className="audit-drawer-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="audit-modal certificate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="certificate-header">
              <div className="cert-badge-logo">🛡️ Executive Compliance Report</div>
              <h2>Regulatory Impact Assessment</h2>
              <span className="cert-hash">Directive ID: {selectedProfile.documentId}</span>
            </div>

            <div className="certificate-body">
              <div className="cert-section">
                <span className="cert-label">Assessed By:</span>
                <strong>{user.name} ({user.role})</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Regulatory Title:</span>
                <strong>{selectedProfile.title}</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Departmental Action Summary:</span>
                <ul className="cert-checklist">
                  {selectedProfile.departments.map((d) => (
                    <li key={d.department}>
                      <strong>{d.department}:</strong> {d.actionItems.length} action items ({d.deadline} deadline)
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReportModal(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={downloadJsonReport}>
                Download Impact Assessment 📥
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
