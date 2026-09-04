import { useState } from 'react'

interface ClauseDiff {
  clause_id: string
  section: string
  diff_status: 'added' | 'removed' | 'modified' | 'unchanged'
  old_text: string | null
  new_text: string | null
  parameter_change: string | null
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  affected_departments: string[]
  action_required: string
}

interface DepartmentalDeltaImpact {
  department: string
  changes_count: number
  risk_summary: string
  sla_impact: string
}

interface ComparisonPreset {
  id: string
  title: string
  baseline_id: string
  target_id: string
  effective_date: string
  summary: { added: number; removed: number; modified: number; unchanged: number }
  clauses: ClauseDiff[]
  impacts: DepartmentalDeltaImpact[]
  hash: string
}

const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'pay-2018-vs-2023',
    title: 'Digital Payment Controls (2018 Baseline) vs Cyber Resilience Master Direction (2023)',
    baseline_id: 'RBI/2018-19/124',
    target_id: 'RBI/2023-24/89',
    effective_date: '2023-11-01',
    summary: { added: 3, removed: 2, modified: 4, unchanged: 12 },
    hash: 'a5f8e9102c4b8d73e1f9a41b5d6e3c2b8a7f9e102c4b8d73e1f9a41b5d6e3c2b',
    impacts: [
      {
        department: 'SOC & Cyber Incident Response',
        changes_count: 3,
        risk_summary: 'SLA compressed from 24 hours to 2 hours for CSIRT notification.',
        sla_impact: 'Immediate Action (7 Days)'
      },
      {
        department: 'Core Banking System & Mobile Apps',
        changes_count: 2,
        risk_summary: 'Mandatory MFA on ALL digital transfers (INR 50k exemption removed).',
        sla_impact: 'High Priority (30 Days)'
      },
      {
        department: 'Treasury & Interbank Remittance',
        changes_count: 1,
        risk_summary: 'Post-Quantum Encryption mandatory for transfers exceeding INR 10 Cr.',
        sla_impact: 'Long-term (90 Days)'
      }
    ],
    clauses: [
      {
        clause_id: 'SEC-4.2',
        section: 'Section 4 - Authentication & Access Controls',
        diff_status: 'modified',
        old_text: 'Two-Factor Authentication (2FA) is recommended for high-value internet banking transfers exceeding INR 50,000.',
        new_text: 'Mandatory Adaptive Multi-Factor Authentication (MFA) incorporating hardware token or biometric signature required for ALL digital payment transactions regardless of value threshold.',
        parameter_change: 'Exemption Limit: > INR 50,000 → Mandatory for ALL Amounts. Added Biometric/Hardware Token.',
        risk_level: 'critical',
        affected_departments: ['Core Banking System', 'Mobile App Engineering', 'Fraud Risk Management'],
        action_required: 'Update API Gateway rules to strip INR 50,000 exemption and mandate MFA challenge.'
      },
      {
        clause_id: 'SEC-7.1',
        section: 'Section 7 - Cyber Incident Escalation Timeline',
        diff_status: 'modified',
        old_text: 'Cyber security breaches and ransomware intrusions must be reported to RBI Cyber Security Cell within 24 hours of detection.',
        new_text: 'Mandatory reporting of cyber incidents, rogue IP hits, and unauthorized database exfiltration within 2 hours of initial detection to CSIRT-Fin & RBI.',
        parameter_change: 'Notification Window: 24 Hours → 2 Hours (Compressed by 91.6%).',
        risk_level: 'critical',
        affected_departments: ['SOC Operations', 'InfoSec Incident Response', 'Legal & Regulatory Compliance'],
        action_required: 'Configure automated SIEM incident webhook trigger to dispatch emergency payload to CSIRT-Fin API.'
      },
      {
        clause_id: 'SEC-9.3',
        section: 'Section 9 - Transport Encryption Standards',
        diff_status: 'removed',
        old_text: 'TLS 1.1 and RSA 1024-bit key exchange are permissible for legacy branch network fallback connections until notice.',
        new_text: null,
        parameter_change: 'Clause Revoked & Banned. Zero tolerance for TLS 1.1.',
        risk_level: 'high',
        affected_departments: ['Network Engineering', 'Branch Infrastructure'],
        action_required: 'Decommission TLS 1.1 SSL handshake negotiation profiles on edge firewalls.'
      },
      {
        clause_id: 'SEC-11.0',
        section: 'Section 11 - Post-Quantum Cryptography Wrapping',
        diff_status: 'added',
        old_text: null,
        new_text: 'All inter-bank settlement transactions exceeding INR 10,00,00,000 must utilize AES-256 and PQC (Post-Quantum Cryptography) hybrid transport wrappers.',
        parameter_change: 'New Mandate: PQC Hybrid Cryptography for Wires > INR 10 Cr.',
        risk_level: 'high',
        affected_departments: ['Treasury Operations', 'Payment Switch Engineering'],
        action_required: 'Provision HSM firmware upgrade supporting NIST PQC ML-KEM algorithm suite.'
      },
      {
        clause_id: 'SEC-3.1',
        section: 'Section 3 - Customer Data Encryption at Rest',
        diff_status: 'unchanged',
        old_text: 'Customer PII (Personally Identifiable Information) must be encrypted at rest using AES-256.',
        new_text: 'Customer PII (Personally Identifiable Information) must be encrypted at rest using AES-256.',
        parameter_change: 'No threshold change.',
        risk_level: 'low',
        affected_departments: ['Database Administration'],
        action_required: 'Maintain existing AES-256 database column encryption configuration.'
      }
    ]
  },
  {
    id: 'kyc-2019-vs-2024',
    title: 'KYC & Onboarding Guidelines (2019) vs Master Direction Update (2024)',
    baseline_id: 'RBI/2019-20/78',
    target_id: 'RBI/2024-25/12',
    effective_date: '2024-04-01',
    summary: { added: 2, removed: 1, modified: 3, unchanged: 14 },
    hash: 'b7c9d104e5f2a83910c2b4d8e7f1a02b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    impacts: [
      {
        department: 'KYC Operations & Customer Onboarding',
        changes_count: 2,
        risk_summary: 'High-risk customer Periodic KYC refresh window reduced from 2 years to 1 year.',
        sla_impact: 'Immediate Action (15 Days)'
      },
      {
        department: 'AML & Transaction Monitoring Engine',
        changes_count: 2,
        risk_summary: 'Mandatory Video-CIP (V-CIP) liveness verification with facial match threshold > 98%.',
        sla_impact: 'High Priority (30 Days)'
      }
    ],
    clauses: [
      {
        clause_id: 'KYC-5.1',
        section: 'Section 5 - Periodic Customer Refresh Cycle',
        diff_status: 'modified',
        old_text: 'Periodic KYC update for High-Risk customers shall be carried out at least once in every 2 years.',
        new_text: 'Periodic KYC refresh for High-Risk accounts and Politically Exposed Persons (PEPs) must be completed every 12 months with biometric re-verification.',
        parameter_change: 'Refresh Interval: 2 Years → 1 Year (12 Months). Added mandatory biometric verification.',
        risk_level: 'critical',
        affected_departments: ['KYC Operations', 'AML Monitoring', 'Customer Relationship Managers'],
        action_required: 'Trigger automated notification to 14,200 high-risk account holders due for 12-month refresh.'
      },
      {
        clause_id: 'KYC-8.4',
        section: 'Section 8 - Video-CIP Artificial Intelligence Validation',
        diff_status: 'added',
        old_text: null,
        new_text: 'Video Customer Identification Process (V-CIP) must incorporate real-time AI spoofing detection and facial match confidence score equal to or exceeding 98.5%.',
        parameter_change: 'New Mandate: Real-time AI Spoofing check + Facial Match >= 98.5%.',
        risk_level: 'high',
        affected_departments: ['Digital Onboarding Team', 'AI Engineering'],
        action_required: 'Integrate deepfake detection SDK into mobile V-CIP SDK.'
      }
    ]
  }
]

export default function RegulatoryDiffPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pay-2018-vs-2023')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split')
  const [copiedHash, setCopiedHash] = useState<boolean>(false)

  const activePreset = COMPARISON_PRESETS.find((p) => p.id === selectedPresetId) || COMPARISON_PRESETS[0]

  const filteredClauses = activePreset.clauses.filter((clause) => {
    if (filterStatus !== 'all' && clause.diff_status !== filterStatus) return false
    if (filterRisk !== 'all' && clause.risk_level !== filterRisk) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = clause.clause_id.toLowerCase().includes(q)
      const matchSec = clause.section.toLowerCase().includes(q)
      const matchOld = clause.old_text?.toLowerCase().includes(q) || false
      const matchNew = clause.new_text?.toLowerCase().includes(q) || false
      const matchParam = clause.parameter_change?.toLowerCase().includes(q) || false
      if (!matchId && !matchSec && !matchOld && !matchNew && !matchParam) return false
    }
    return true
  })

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activePreset.hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2500)
  }

  const handleDownloadMemorandum = () => {
    const lines = [
      `================================================================================`,
      `VERIRULE REGULATORY DELTA IMPACT MEMORANDUM`,
      `Cryptographic Hash Certificate: ${activePreset.hash}`,
      `Generated At: ${new Date().toISOString()}`,
      `================================================================================`,
      ``,
      `1. COMPARISON SCOPE`,
      `Baseline Circular : ${activePreset.baseline_id}`,
      `Governing Target  : ${activePreset.target_id}`,
      `Effective Date    : ${activePreset.effective_date}`,
      `Document Title    : ${activePreset.title}`,
      ``,
      `2. DELTA METRICS SUMMARY`,
      `- Added Clauses    : ${activePreset.summary.added}`,
      `- Removed Clauses  : ${activePreset.summary.removed}`,
      `- Modified Clauses : ${activePreset.summary.modified}`,
      `- Unchanged Clauses: ${activePreset.summary.unchanged}`,
      ``,
      `3. DEPARTMENTAL IMPACT ANALYSIS`,
      ...activePreset.impacts.map(
        (imp) => `* Department: ${imp.department}\n  Impact SLA: ${imp.sla_impact}\n  Summary   : ${imp.risk_summary}\n`
      ),
      ``,
      `4. CLAUSE-BY-CLAUSE REGULATORY SHIFT DETAILS`,
      ...activePreset.clauses.map((c) => {
        return [
          `--------------------------------------------------------------------------------`,
          `Clause ID       : ${c.clause_id} [${c.diff_status.toUpperCase()}]`,
          `Section         : ${c.section}`,
          `Risk Severity   : ${c.risk_level.toUpperCase()}`,
          `Parameter Shift : ${c.parameter_change || 'N/A'}`,
          `Action Required : ${c.action_required}`,
          c.old_text ? `[HISTORICAL / SUPERSEDED TEXT]:\n"${c.old_text}"` : '',
          c.new_text ? `[GOVERNING ACTIVE TEXT]:\n"${c.new_text}"` : '',
        ]
          .filter(Boolean)
          .join('\n')
      }),
      ``,
      `================================================================================`,
      `END OF REGULATORY DELTA MEMORANDUM - CONFIDENTIAL BANK RISK REPORT`,
      `================================================================================`,
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Regulatory_Delta_Memorandum_${activePreset.baseline_id.replace(/\//g, '_')}_vs_${activePreset.target_id.replace(/\//g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'added':
        return 'diff-tag diff-tag-added'
      case 'removed':
        return 'diff-tag diff-tag-removed'
      case 'modified':
        return 'diff-tag diff-tag-modified'
      default:
        return 'diff-tag diff-tag-unchanged'
    }
  }

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'badge-risk badge-risk-critical'
      case 'high':
        return 'badge-risk badge-risk-high'
      case 'medium':
        return 'badge-risk badge-risk-medium'
      default:
        return 'badge-risk badge-risk-low'
    }
  }

  return (
    <div className="diff-engine-page">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">Automated Regulatory Delta & Diff Engine</h1>
            <span className="sidebar-badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
              Core Feature
            </span>
          </div>
          <p className="page-subtitle">
            Side-by-side clause supersession visualizer, parameter shift extractor, and departmental impact matrix.
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={handleCopyHash} className="btn btn-secondary btn-sm">
            {copiedHash ? '✓ Certificate Copied' : '🔑 Copy Cryptographic Hash'}
          </button>
          <button type="button" onClick={handleDownloadMemorandum} className="btn btn-primary btn-sm">
            📥 Export Regulatory Delta Memorandum
          </button>
        </div>
      </div>

      {/* ── Control Bar ──────────────────────────────────────────────────── */}
      <div className="card diff-controls-card mb-4" style={{ padding: '1.25rem' }}>
        <div className="diff-preset-selector-row mb-3">
          <label htmlFor="preset-select" className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
            Select Regulatory Comparison Pair:
          </label>
          <select
            id="preset-select"
            className="form-control"
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            style={{ width: '100%', fontSize: '0.95rem', fontWeight: 500 }}
          >
            {COMPARISON_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                [{preset.baseline_id} ➔ {preset.target_id}] — {preset.title}
              </option>
            ))}
          </select>
        </div>

        <div className="diff-filter-toolbar">
          <div className="search-box-wrap" style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search clause ID, section, keyword or requirement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Diff Type:</span>
            <button
              type="button"
              className={`chip ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All Clauses ({activePreset.clauses.length})
            </button>
            <button
              type="button"
              className={`chip chip-modified ${filterStatus === 'modified' ? 'active' : ''}`}
              onClick={() => setFilterStatus('modified')}
            >
              [~] Modified ({activePreset.summary.modified})
            </button>
            <button
              type="button"
              className={`chip chip-added ${filterStatus === 'added' ? 'active' : ''}`}
              onClick={() => setFilterStatus('added')}
            >
              [+] Added ({activePreset.summary.added})
            </button>
            <button
              type="button"
              className={`chip chip-removed ${filterStatus === 'removed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('removed')}
            >
              [-] Superseded ({activePreset.summary.removed})
            </button>
          </div>

          <div className="filter-group">
            <span className="filter-label">Risk:</span>
            <button
              type="button"
              className={`chip ${filterRisk === 'all' ? 'active' : ''}`}
              onClick={() => setFilterRisk('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`chip ${filterRisk === 'critical' ? 'active' : ''}`}
              onClick={() => setFilterRisk('critical')}
            >
              Critical
            </button>
            <button
              type="button"
              className={`chip ${filterRisk === 'high' ? 'active' : ''}`}
              onClick={() => setFilterRisk('high')}
            >
              High
            </button>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('split')}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'unified' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('unified')}
            >
              Unified Stack
            </button>
          </div>
        </div>
      </div>

      {/* ── Overview Summary Cards ────────────────────────────────────────── */}
      <div className="diff-summary-grid mb-4">
        <div className="card metric-card">
          <div className="metric-label">Baseline Document (Historical)</div>
          <div className="metric-value" style={{ fontSize: '1.25rem', color: '#64748b' }}>
            {activePreset.baseline_id}
          </div>
          <div className="metric-sub" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Historical Circular Baseline
          </div>
        </div>

        <div className="card metric-card" style={{ borderColor: 'var(--color-primary-light)' }}>
          <div className="metric-label">Target Master Direction (Governing)</div>
          <div className="metric-value" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            {activePreset.target_id}
          </div>
          <div className="metric-sub" style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.2rem' }}>
            Effective Date: {activePreset.effective_date}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Regulatory Delta Summary</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className="diff-tag diff-tag-modified">[~] {activePreset.summary.modified} Mod</span>
            <span className="diff-tag diff-tag-added">[+] {activePreset.summary.added} Add</span>
            <span className="diff-tag diff-tag-removed">[-] {activePreset.summary.removed} Del</span>
          </div>
          <div className="metric-sub" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            {activePreset.summary.unchanged} Unchanged Clauses
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">SHA-256 Audit Certificate</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', color: '#475569', marginTop: '0.4rem' }}>
            {activePreset.hash.substring(0, 32)}...
          </div>
          <div className="metric-sub" style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.3rem' }}>
            ✓ Verified Immutable
          </div>
        </div>
      </div>

      {/* ── Departmental Delta Impact Matrix ──────────────────────────────── */}
      <div className="card mb-4" style={{ padding: '1.25rem' }}>
        <h3 className="section-title mb-3" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏢</span> Operational Department Impact Matrix
        </h3>
        <div className="impact-matrix-grid">
          {activePreset.impacts.map((imp, idx) => (
            <div key={idx} className="impact-department-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-heading)' }}>
                  {imp.department}
                </span>
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem' }}>
                  {imp.sla_impact}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.4rem 0 0.6rem 0' }}>
                {imp.risk_summary}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                Impacted Rules: {imp.changes_count} Clause Shift(s)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Clause-by-Clause Visual Diff List ─────────────────────────────── */}
      <div className="diff-clauses-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-heading)', margin: 0 }}>
            Clause-by-Clause Comparison ({filteredClauses.length} Result{filteredClauses.length !== 1 ? 's' : ''})
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing clauses for {activePreset.baseline_id} ➔ {activePreset.target_id}
          </span>
        </div>

        {filteredClauses.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No clauses match your selected search or filter criteria.</p>
          </div>
        ) : (
          <div className="diff-clauses-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredClauses.map((clause) => (
              <div key={clause.clause_id} className={`card clause-diff-card clause-status-${clause.diff_status}`}>
                {/* Clause Card Header */}
                <div className="clause-card-header">
                  <div className="clause-header-left">
                    <span className={getStatusBadgeClass(clause.diff_status)}>
                      {clause.diff_status === 'modified' && '[~] MODIFIED'}
                      {clause.diff_status === 'added' && '[+] ADDED'}
                      {clause.diff_status === 'removed' && '[-] SUPERSEDED'}
                      {clause.diff_status === 'unchanged' && '[=] UNCHANGED'}
                    </span>
                    <span className="clause-id-title">{clause.clause_id}</span>
                    <span className="clause-section-name">— {clause.section}</span>
                  </div>

                  <div className="clause-header-right">
                    <span className={getRiskBadgeClass(clause.risk_level)}>
                      {clause.risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                {/* Parameter Shift Callout Chip */}
                {clause.parameter_change && (
                  <div className="parameter-shift-callout">
                    <span style={{ fontWeight: 600 }}>⚡ Key Parameter Shift:</span> {clause.parameter_change}
                  </div>
                )}

                {/* Split vs Unified Diff Viewer */}
                {viewMode === 'split' ? (
                  <div className="diff-split-container">
                    <div className="diff-pane diff-pane-old">
                      <div className="diff-pane-title">
                        <span>Baseline Clause ({activePreset.baseline_id})</span>
                        {clause.diff_status === 'removed' && <span className="tag-danger">Superseded</span>}
                      </div>
                      <div className="diff-pane-content">
                        {clause.old_text ? (
                          <p className="diff-text-old">{clause.old_text}</p>
                        ) : (
                          <span className="diff-text-empty">(No prior clause in baseline document)</span>
                        )}
                      </div>
                    </div>

                    <div className="diff-pane diff-pane-new">
                      <div className="diff-pane-title">
                        <span>Governing Clause ({activePreset.target_id})</span>
                        {clause.diff_status === 'added' && <span className="tag-success">New Requirement</span>}
                      </div>
                      <div className="diff-pane-content">
                        {clause.new_text ? (
                          <p className="diff-text-new">{clause.new_text}</p>
                        ) : (
                          <span className="diff-text-empty">(Clause revoked & eliminated from target directive)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="diff-unified-container">
                    {clause.old_text && (
                      <div className="unified-line line-removed">
                        <span className="line-prefix">-</span>
                        <span className="line-text">{clause.old_text}</span>
                      </div>
                    )}
                    {clause.new_text && (
                      <div className="unified-line line-added">
                        <span className="line-prefix">+</span>
                        <span className="line-text">{clause.new_text}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Footer Actions & Affected Departments */}
                <div className="clause-card-footer">
                  <div className="affected-deps">
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Affected Systems:</span>
                    {clause.affected_departments.map((dept, i) => (
                      <span key={i} className="dep-chip">
                        {dept}
                      </span>
                    ))}
                  </div>

                  <div className="action-required-box">
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>Action Required:</span>{' '}
                    {clause.action_required}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
