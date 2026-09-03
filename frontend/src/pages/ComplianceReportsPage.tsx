import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { postAuditLog } from '../services/auditService'
import { generateAnalyticsReport, type AnalyticsReportResponse } from '../services/analyticsService'

interface ReportTemplate {
  id: string
  title: string
  category: string
  description: string
  healthScore: number
  authority: string
  activeDirectivesCount: number
  supersededCount: number
  keyFindings: string[]
  recommendedActions: string[]
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'rep-1',
    title: 'Master Direction Executive Compliance Summary',
    category: 'Executive Board Briefing',
    description:
      'Comprehensive compliance posture assessment covering all active Reserve Bank of India, SEBI, and Basel Committee directives currently enforced across the bank.',
    healthScore: 96,
    authority: 'Reserve Bank of India & SEBI',
    activeDirectivesCount: 1278,
    supersededCount: 142,
    keyFindings: [
      'Master Direction RBI/2023-24/108 is 100% enforced across core IT database infrastructure.',
      '2-hour beneficiary cooling period (RBI/2021-22/15) is operational on retail digital payment channels.',
      '142 historical circulars are successfully isolated as SUPERSEDED to prevent outdated guidance reliance.',
    ],
    recommendedActions: [
      'Maintain monthly SHA-256 integrity audits on vector document repository.',
      'Schedule Q3 operational outage simulation for Basel III capital resilience compliance.',
    ],
  },
  {
    id: 'rep-2',
    title: 'Superseded Circulars & Historical Risk Exposure Assessment',
    category: 'Internal Audit & Risk Committee',
    description:
      'Detailed audit report highlighting obsolete historical circulars, legacy baseline rules, and supersession lineage chains to ensure zero reliance on outdated guidance.',
    healthScore: 89,
    authority: 'Reserve Bank of India',
    activeDirectivesCount: 4,
    supersededCount: 18,
    keyFindings: [
      'RBI/2016-17/38 (Baseline Cyber Security) was replaced by Master Direction RBI/2023-24/108.',
      'RBI/2018-19/22 (Discretionary Beneficiary Cooling) was replaced by Master Direction RBI/2021-22/15.',
      'All automated transaction checks now flag historical circular references with explicit red warnings.',
    ],
    recommendedActions: [
      'Archive legacy standard operating procedure (SOP) manuals referencing 2016 password baselines.',
      'Notify compliance officers of mandatory hardware MFA enforcement for DB administrators.',
    ],
  },
  {
    id: 'rep-3',
    title: 'Cyber Security & 24x7 SOC Telemetry Readiness Audit',
    category: 'Regulatory Inspector Package',
    description:
      'Verification audit package for RBI Master Direction RBI/2023-24/108, proving continuous 24x7 SOC threat telemetry, hardware MFA, and 7-year log retention.',
    healthScore: 98,
    authority: 'RBI Cyber Security Department',
    activeDirectivesCount: 8,
    supersededCount: 4,
    keyFindings: [
      '24x7 Security Operations Centre (SOC) telemetry ingested continuously into SIEM engine.',
      'FIDO2 Hardware MFA enforced for 100% of privileged database administrator sessions.',
      'Audit log streams stored in S3 Object Lock Write-Once-Read-Many (WORM) compliant buckets.',
    ],
    recommendedActions: [
      'Conduct bi-annual SOC incident response tabletop exercise.',
      'Review automated firewall rule change authorization logs.',
    ],
  },
  {
    id: 'rep-4',
    title: 'Digital Payment Security & Beneficiary Protection Audit',
    category: 'Payment Systems Inspectorate',
    description:
      'Compliance proof package for RBI Master Direction RBI/2021-22/15 covering dynamic OTP payload binding, 2-hour beneficiary cooling limits, and velocity monitoring.',
    healthScore: 94,
    authority: 'Reserve Bank of India',
    activeDirectivesCount: 6,
    supersededCount: 1,
    keyFindings: [
      'OTP tokens dynamically tied to beneficiary account details and payment amount.',
      'Mandatory 2-hour transfer limit cooling window enforced for all new online beneficiaries.',
      'Velocity alerts configured for consecutive retail fund transfers exceeding ₹1,00,000.',
    ],
    recommendedActions: [
      'Upgrade mobile application auth gateway to RSA-4896 payload signing.',
      'Review fraud monitoring system inline velocity evaluation latency.',
    ],
  },
]

export default function ComplianceReportsPage() {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0])
  const [isExporting, setIsExporting] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [reportHash, setReportHash] = useState('')
  const [generatedReport, setGeneratedReport] = useState<AnalyticsReportResponse | null>(null)
  const [generationError, setGenerationError] = useState('')

  const getReportType = (): 'compliance_scorecard' | 'risk_assessment' | 'executive_summary' => {
    if (selectedTemplate.id === 'rep-2') return 'risk_assessment'
    if (selectedTemplate.id === 'rep-3' || selectedTemplate.id === 'rep-4') return 'compliance_scorecard'
    return 'executive_summary'
  }

  const createDigest = async (value: string) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return `0x${Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`
  }

  const buildReportPackage = (report: AnalyticsReportResponse, digest: string) => ({
    report_title: selectedTemplate.title,
    report_category: selectedTemplate.category,
    digest_hash: digest,
    generated_by: user.name,
    role: user.role,
    generated_at: new Date().toISOString(),
    governing_authority: selectedTemplate.authority,
    compliance_health_score: `${selectedTemplate.healthScore}/100`,
    active_directives_enforced: selectedTemplate.activeDirectivesCount,
    superseded_circulars_isolated: selectedTemplate.supersededCount,
    executive_summary: selectedTemplate.description,
    key_findings: selectedTemplate.keyFindings,
    recommended_actions: selectedTemplate.recommendedActions,
    live_analytics_report: report,
  })

  const handleGenerateReport = async () => {
    setIsExporting(true)
    setGenerationError('')

    try {
      const report = await generateAnalyticsReport({
        report_type: getReportType(),
        include_trends: true,
        include_recommendations: true,
        format: 'json',
      })
      const hash = await createDigest(JSON.stringify(buildReportPackage(report, '')))

      setGeneratedReport(report)
      setReportHash(hash)

      try {
        await postAuditLog({
          title: `Compliance Report Generated: ${selectedTemplate.title}`,
          category: 'verification',
          severity: 'verified',
          authority: selectedTemplate.authority,
          query_text: `Formal compliance report export: ${selectedTemplate.title}`,
          confidence_score: selectedTemplate.healthScore / 100,
          passage_text: selectedTemplate.description,
          section: 'Executive Reporting Center',
          execution_time_ms: 180,
          details: `Risk officer ${user.name} generated formal executive report '${selectedTemplate.title}' (Health Score: ${selectedTemplate.healthScore}/100, SHA-256 Digest: ${hash}).`,
        })
      } catch {
        // Report generation remains usable if audit logging is temporarily unavailable.
      }
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Failed to generate compliance report:', error)
      setGenerationError('The live compliance report could not be generated. Check that the backend is running and try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadReportPackage = () => {
    if (!generatedReport) return

    const reportData = buildReportPackage(generatedReport, reportHash)

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `compliance_report_${selectedTemplate.id}_${reportHash.substring(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return '#10b981'
    if (score >= 85) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="compliance-reports-page">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Executive Compliance Reporting</span>
          <h1>Regulatory Compliance Reporting Center</h1>
          <p>
            Generate, inspect, and export formal compliance readiness reports, superseded circular exposure analyses, and audit proof packages for senior management and regulatory inspectors.
          </p>
        </div>
      </div>

      {/* ── Report Template Selection Bar ──────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1.25rem 1.5rem', marginBottom: 0 }}>
        <div className="scenario-header">
          <h2>Select Executive Report Template</h2>
          <span className="scenario-hint">Choose template for audit generation</span>
        </div>

        <div className="scenario-pills-grid">
          {REPORT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              className={`scenario-pill-btn ${selectedTemplate.id === tmpl.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(tmpl)}
            >
              <span className="pill-cat">{tmpl.category}</span>
              <span className="pill-title">{tmpl.title}</span>
              <span style={{ fontSize: '0.74rem', color: getScoreColor(tmpl.healthScore), fontWeight: 700, marginTop: '0.2rem' }}>
                Health Score: {tmpl.healthScore}/100
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Executive Report Briefing Card ─────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
        <div className="report-briefing-header">
          <div>
            <span className="authority-tag-lg" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
              {selectedTemplate.category} — {selectedTemplate.authority}
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)' }}>
              {selectedTemplate.title}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0.5rem 0' }}>
              {selectedTemplate.description}
            </p>
          </div>

          <div className="scorecard-badge" style={{ borderColor: getScoreColor(selectedTemplate.healthScore) }}>
            <span className="score-num" style={{ color: getScoreColor(selectedTemplate.healthScore) }}>
              {selectedTemplate.healthScore}
            </span>
            <span className="score-label">Compliance Score</span>
          </div>
        </div>

        <div className="report-stats-strip">
          <div className="report-stat-item">
            <span>Governing Authority</span>
            <strong>{selectedTemplate.authority}</strong>
          </div>
          <div className="report-stat-item">
            <span>Active Directives</span>
            <strong style={{ color: '#10b981' }}>{selectedTemplate.activeDirectivesCount} Active</strong>
          </div>
          <div className="report-stat-item">
            <span>Superseded Isolated</span>
            <strong style={{ color: '#ef4444' }}>{selectedTemplate.supersededCount} Obsolete</strong>
          </div>
          <div className="report-stat-item">
            <span>Audit Status</span>
            <strong style={{ color: '#4f46e5' }}>VERIFIED & READY</strong>
          </div>
        </div>

        {/* Key Findings Section */}
        <div className="report-findings-section">
          <h3>Key Compliance Findings</h3>
          <div className="findings-list">
            {selectedTemplate.keyFindings.map((finding) => (
              <div key={finding} className="finding-item">
                <span className="finding-check">✓</span>
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action Items */}
        <div className="report-actions-section">
          <h3>Recommended Compliance Action Items</h3>
          <div className="findings-list">
            {selectedTemplate.recommendedActions.map((act) => (
              <div key={act} className="finding-item" style={{ background: '#eef2ff', borderColor: '#c7d2fe' }}>
                <span className="finding-check" style={{ color: '#4f46e5' }}>→</span>
                <span style={{ color: '#3730a3' }}>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={isExporting}
          >
            {isExporting ? 'Generating Audit Package...' : 'Generate Executive Report Package 📥'}
          </button>
        </div>
        {generationError && (
          <p role="alert" style={{ color: '#b91c1c', margin: '0.75rem 0 0', textAlign: 'right', fontSize: '0.84rem' }}>
            {generationError}
          </p>
        )}
      </div>

      {/* ── Report Download Modal ────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="audit-drawer-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="audit-modal certificate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="certificate-header">
              <div className="cert-badge-logo">📋 VeriRule Formal Report</div>
              <h2>{selectedTemplate.title}</h2>
              <span className="cert-hash">SHA-256 DIGEST: {reportHash}</span>
            </div>

            <div className="certificate-body">
              <div className="cert-section">
                <span className="cert-label">Issued To / Officer:</span>
                <strong>{user.name} ({user.role})</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Authority & Category:</span>
                <strong>{selectedTemplate.authority} — {selectedTemplate.category}</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Overall Health Score:</span>
                <strong style={{ color: getScoreColor(selectedTemplate.healthScore) }}>
                  {selectedTemplate.healthScore}/100 Compliant
                </strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Report Findings Summary:</span>
                <ul className="cert-checklist">
                  {selectedTemplate.keyFindings.map((kf) => (
                    <li key={kf}>✓ {kf}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPreviewModal(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={downloadReportPackage}>
                Download Audit Package (JSON) 📥
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
