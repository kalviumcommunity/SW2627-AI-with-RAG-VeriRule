import { useState } from 'react'

interface CAPATask {
  capa_id: string
  breach_id: string
  title: string
  circular_id: string
  department: string
  assignee: string
  status: 'open' | 'in_progress' | 'under_review' | 'closed'
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  created_at: string
  due_date: string
  description: string
  corrective_action: string
  evidence_proof: string | null
  signed_off_by: string | null
  signed_off_at: string | null
}

const INITIAL_CAPAS: CAPATask[] = [
  {
    capa_id: 'CAPA-2026-001',
    breach_id: 'BREACH-PAY-882',
    title: 'Enforce Mandatory MFA for All Digital Payments',
    circular_id: 'RBI/2023-24/89',
    department: 'Core Banking System',
    assignee: 'Vikramaditya S (Lead Architect)',
    status: 'in_progress',
    risk_level: 'critical',
    created_at: '2026-08-30',
    due_date: '2026-09-15',
    description: 'RBI Master Direction 2023 revoked the INR 50,000 MFA exemption limit. API Gateway still permits single-factor auth on low-value wires.',
    corrective_action: 'Update API Gateway security interceptor policy to enforce adaptive MFA challenge on 100% of payment endpoints.',
    evidence_proof: null,
    signed_off_by: null,
    signed_off_at: null,
  },
  {
    capa_id: 'CAPA-2026-002',
    breach_id: 'BREACH-SOC-104',
    title: 'Automate Cyber Incident Escalation Webhook to CSIRT-Fin',
    circular_id: 'RBI/2023-24/89',
    department: 'SOC & Cyber Security',
    assignee: 'Ananya R (CISO Lead)',
    status: 'under_review',
    risk_level: 'critical',
    created_at: '2026-08-25',
    due_date: '2026-09-10',
    description: 'Reporting SLA for critical cyber intrusion compressed from 24 Hours to 2 Hours under new Master Direction.',
    corrective_action: 'Deployed automated SIEM webhook integration to dispatch incident telemetry payload within 120 seconds of detection.',
    evidence_proof: 'PR #482 merged. SIEM alert simulation validated against CSIRT-Fin sandbox webhook.',
    signed_off_by: null,
    signed_off_at: null,
  },
  {
    capa_id: 'CAPA-2026-003',
    breach_id: 'BREACH-KYC-319',
    title: 'Trigger 12-Month High-Risk Periodic KYC Refresh Campaign',
    circular_id: 'RBI/2024-25/12',
    department: 'KYC Operations',
    assignee: 'Rohan K (Operations Manager)',
    status: 'open',
    risk_level: 'high',
    created_at: '2026-09-02',
    due_date: '2026-09-20',
    description: 'High-Risk customer refresh window reduced from 2 years to 1 year under 2024 KYC Master Direction update.',
    corrective_action: 'Batch flag 14,200 accounts exceeding 12 months since last KYC document verification and issue automated SMS/Email portal reminders.',
    evidence_proof: null,
    signed_off_by: null,
    signed_off_at: null,
  },
  {
    capa_id: 'CAPA-2026-004',
    breach_id: 'BREACH-NET-701',
    title: 'Decommission TLS 1.1 Support on Branch Edge Routers',
    circular_id: 'RBI/2018-19/124',
    department: 'Network Engineering',
    assignee: 'Suresh M (Network Admin)',
    status: 'closed',
    risk_level: 'high',
    created_at: '2026-08-15',
    due_date: '2026-09-01',
    description: 'TLS 1.1 legacy fallback connection allowance has been formally revoked.',
    corrective_action: 'Applied firmware update across 450 branch edge firewalls disabling TLS 1.1 SSL handshakes.',
    evidence_proof: 'Qualys SSL Vulnerability Scan Report #QS-99120 showing 100% TLS 1.2+ compliance across all branch IP blocks.',
    signed_off_by: 'Harshal Kale (Senior Chief Risk Officer)',
    signed_off_at: '2026-09-02',
  },
]

export default function RemediationPage() {
  const [tasks, setTasks] = useState<CAPATask[]>(INITIAL_CAPAS)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showSignoffModal, setShowSignoffModal] = useState<boolean>(false)
  const [activeTaskForSignoff, setActiveTaskForSignoff] = useState<CAPATask | null>(null)

  // Form Inputs
  const [newTitle, setNewTitle] = useState('')
  const [newCircularId, setNewCircularId] = useState('RBI/2023-24/89')
  const [newDepartment, setNewDepartment] = useState('Core Banking System')
  const [newAssignee, setNewAssignee] = useState('Pavithra (Compliance Officer)')
  const [newRiskLevel, setNewRiskLevel] = useState<'critical' | 'high' | 'medium' | 'low'>('high')
  const [newDescription, setNewDescription] = useState('')
  const [newCorrectiveAction, setNewCorrectiveAction] = useState('')
  const [newDueDays, setNewDueDays] = useState(14)

  // Signoff Inputs
  const [signoffOfficer, setSignoffOfficer] = useState('Harshal Kale (Senior Chief Risk Officer)')
  const [signoffEvidence, setSignoffEvidence] = useState('')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim() || !newCorrectiveAction.trim()) return

    const now = new Date()
    const due = new Date()
    due.setDate(due.getDate() + newDueDays)

    const newTask: CAPATask = {
      capa_id: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`,
      breach_id: `BREACH-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      circular_id: newCircularId,
      department: newDepartment,
      assignee: newAssignee,
      status: 'open',
      risk_level: newRiskLevel,
      created_at: now.toISOString().split('T')[0],
      due_date: due.toISOString().split('T')[0],
      description: newDescription,
      corrective_action: newCorrectiveAction,
      evidence_proof: null,
      signed_off_by: null,
      signed_off_at: null,
    }

    setTasks([newTask, ...tasks])
    setShowCreateModal(false)
    setNewTitle('')
    setNewDescription('')
    setNewCorrectiveAction('')
  }

  const handleExecuteSignoff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTaskForSignoff || !signoffEvidence.trim()) return

    const updated = tasks.map((t) => {
      if (t.capa_id === activeTaskForSignoff.capa_id) {
        return {
          ...t,
          status: 'closed' as const,
          evidence_proof: signoffEvidence,
          signed_off_by: signoffOfficer,
          signed_off_at: new Date().toISOString().split('T')[0],
        }
      }
      return t
    })

    setTasks(updated)
    setShowSignoffModal(false)
    setActiveTaskForSignoff(null)
    setSignoffEvidence('')
  }

  const handleAdvanceStatus = (capaId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.capa_id === capaId) {
          if (t.status === 'open') return { ...t, status: 'in_progress' }
          if (t.status === 'in_progress') return { ...t, status: 'under_review' }
        }
        return t
      })
    )
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterRisk !== 'all' && t.risk_level !== filterRisk) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = t.capa_id.toLowerCase().includes(q)
      const matchBreach = t.breach_id.toLowerCase().includes(q)
      const matchTitle = t.title.toLowerCase().includes(q)
      const matchCirc = t.circular_id.toLowerCase().includes(q)
      const matchDept = t.department.toLowerCase().includes(q)
      const matchAssignee = t.assignee.toLowerCase().includes(q)
      if (!matchId && !matchBreach && !matchTitle && !matchCirc && !matchDept && !matchAssignee) return false
    }
    return true
  })

  // Metrics
  const openCount = tasks.filter((t) => t.status === 'open').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const reviewCount = tasks.filter((t) => t.status === 'under_review').length
  const closedCount = tasks.filter((t) => t.status === 'closed').length
  const readinessScore = tasks.length > 0 ? Math.round((closedCount / tasks.length) * 100) : 100

  const handleExportReport = () => {
    const lines = [
      `================================================================================`,
      `VERIRULE EXECUTIVE COMPLIANCE REMEDIATION & CAPA AUDIT REPORT`,
      `Report ID: RPT-CAPA-${Date.now()}`,
      `Generated At: ${new Date().toISOString()}`,
      `================================================================================`,
      ``,
      `1. AUDIT READINESS METRICS`,
      `- Audit Readiness Score : ${readinessScore}%`,
      `- Total CAPA Action Items: ${tasks.length}`,
      `- Open CAPAs             : ${openCount}`,
      `- In Progress CAPAs      : ${inProgressCount}`,
      `- Under Review CAPAs     : ${reviewCount}`,
      `- Closed & Certified     : ${closedCount}`,
      ``,
      `2. CAPA TASK PIPELINE & SIGN-OFF DIRECTORY`,
      ...tasks.map((t) => {
        return [
          `--------------------------------------------------------------------------------`,
          `CAPA ID         : ${t.capa_id} [${t.status.toUpperCase().replace('_', ' ')}]`,
          `Breach Ref      : ${t.breach_id}`,
          `Circular ID     : ${t.circular_id}`,
          `Title           : ${t.title}`,
          `Department      : ${t.department}`,
          `Assignee        : ${t.assignee}`,
          `Risk Level      : ${t.risk_level.toUpperCase()}`,
          `Target Due Date : ${t.due_date}`,
          `Description     : ${t.description}`,
          `Action Required : ${t.corrective_action}`,
          t.evidence_proof ? `Evidence Proof  : ${t.evidence_proof}` : `Evidence Proof  : Pending Verification`,
          t.signed_off_by ? `Signed Off By   : ${t.signed_off_by} on ${t.signed_off_at}` : `Sign-Off Status : PENDING SIGN-OFF`,
        ].join('\n')
      }),
      ``,
      `================================================================================`,
      `END OF REPORT - VERIRULE COMPLIANCE GOVERNANCE SYSTEM`,
      `================================================================================`,
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CAPA_Remediation_Audit_Report_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="diff-tag diff-tag-removed">OPEN</span>
      case 'in_progress':
        return <span className="diff-tag diff-tag-modified">IN PROGRESS</span>
      case 'under_review':
        return <span className="diff-tag" style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid #c4b5fd' }}>UNDER REVIEW</span>
      case 'closed':
        return <span className="diff-tag diff-tag-added">CLOSED & CERTIFIED</span>
      default:
        return <span className="diff-tag">{status}</span>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <span className="badge-risk badge-risk-critical">CRITICAL</span>
      case 'high':
        return <span className="badge-risk badge-risk-high">HIGH</span>
      case 'medium':
        return <span className="badge-risk badge-risk-medium">MEDIUM</span>
      default:
        return <span className="badge-risk badge-risk-low">LOW</span>
    }
  }

  return (
    <div className="remediation-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">Compliance Breach Remediation & CAPA Workflow</h1>
            <span className="sidebar-badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
              Governance Engine
            </span>
          </div>
          <p className="page-subtitle">
            Assign Corrective Actions (CAPA), monitor SLA deadlines, attach verification evidence, and execute supervisory sign-offs.
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
            ➕ Assign New CAPA
          </button>
          <button type="button" onClick={handleExportReport} className="btn btn-secondary btn-sm">
            📥 Export CAPA Audit Report
          </button>
        </div>
      </div>

      {/* ── Summary Metrics Grid ─────────────────────────────────────────── */}
      <div className="diff-summary-grid mb-4">
        <div className="card metric-card">
          <div className="metric-label">Open CAPA Tasks</div>
          <div className="metric-value" style={{ color: '#ef4444' }}>{openCount}</div>
          <div className="metric-sub" style={{ color: '#991b1b', marginTop: '0.2rem' }}>
            Awaiting initial action
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">In Progress & Review</div>
          <div className="metric-value" style={{ color: '#d97706' }}>{inProgressCount + reviewCount}</div>
          <div className="metric-sub" style={{ color: '#b45309', marginTop: '0.2rem' }}>
            {inProgressCount} Active | {reviewCount} Under Audit Review
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Closed & Certified</div>
          <div className="metric-value" style={{ color: '#16a34a' }}>{closedCount}</div>
          <div className="metric-sub" style={{ color: '#15803d', marginTop: '0.2rem' }}>
            Fully remediated & signed off
          </div>
        </div>

        <div className="card metric-card" style={{ borderColor: 'var(--color-primary-light)' }}>
          <div className="metric-label">Audit Readiness Score</div>
          <div className="metric-value" style={{ color: 'var(--color-primary)' }}>{readinessScore}%</div>
          <div className="metric-sub" style={{ color: '#4338ca', marginTop: '0.2rem' }}>
            Regulatory Compliance Index
          </div>
        </div>
      </div>

      {/* ── Control & Search Bar ────────────────────────────────────────── */}
      <div className="card diff-controls-card mb-4" style={{ padding: '1.25rem' }}>
        <div className="diff-filter-toolbar">
          <div className="search-box-wrap" style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search CAPA ID, circular, assignee, department, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <button
              type="button"
              className={`chip ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={`chip chip-removed ${filterStatus === 'open' ? 'active' : ''}`}
              onClick={() => setFilterStatus('open')}
            >
              Open ({openCount})
            </button>
            <button
              type="button"
              className={`chip chip-modified ${filterStatus === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilterStatus('in_progress')}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              className={`chip ${filterStatus === 'under_review' ? 'active' : ''}`}
              style={filterStatus === 'under_review' ? { background: '#7c3aed', color: 'white' } : {}}
              onClick={() => setFilterStatus('under_review')}
            >
              Under Review ({reviewCount})
            </button>
            <button
              type="button"
              className={`chip chip-added ${filterStatus === 'closed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('closed')}
            >
              Closed ({closedCount})
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
        </div>
      </div>

      {/* ── CAPA Tasks Directory ────────────────────────────────────────── */}
      <div className="capa-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredTasks.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No CAPA remediation tasks match your selected filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.capa_id} className={`card clause-diff-card clause-status-${task.status}`}>
              {/* Task Header */}
              <div className="clause-card-header">
                <div className="clause-header-left">
                  {getStatusBadge(task.status)}
                  <span className="clause-id-title">{task.capa_id}</span>
                  <span className="clause-section-name">Ref: {task.breach_id}</span>
                  <span className="dep-chip" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 600 }}>
                    📜 {task.circular_id}
                  </span>
                </div>

                <div className="clause-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {getRiskBadge(task.risk_level)}
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    SLA Due: {task.due_date}
                  </span>
                </div>
              </div>

              {/* Task Title */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0.2rem 0 0.6rem 0' }}>
                {task.title}
              </h3>

              {/* Description & Action */}
              <div className="diff-split-container" style={{ marginBottom: '0.85rem' }}>
                <div className="diff-pane diff-pane-old" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <div className="diff-pane-title" style={{ color: '#475569' }}>
                    Breach & Compliance Gap Context
                  </div>
                  <div className="diff-pane-content" style={{ color: '#334155' }}>
                    {task.description}
                  </div>
                </div>

                <div className="diff-pane diff-pane-new" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="diff-pane-title" style={{ color: '#166534' }}>
                    Mandatory Corrective Action (CAPA)
                  </div>
                  <div className="diff-pane-content" style={{ color: '#14532d', fontWeight: 500 }}>
                    {task.corrective_action}
                  </div>
                </div>
              </div>

              {/* Evidence & Signoff Banner */}
              {task.evidence_proof && (
                <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9', marginBottom: '0.2rem' }}>
                    🔍 Verification Evidence Attached:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4c1d95' }}>{task.evidence_proof}</div>
                  {task.signed_off_by && (
                    <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '0.4rem' }}>
                      ✓ Digitally Certified & Signed Off by: {task.signed_off_by} on {task.signed_off_at}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Row */}
              <div className="clause-card-footer" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.83rem', color: '#64748b' }}>
                  <span>🏢 <strong>Dept:</strong> {task.department}</span>
                  <span>👤 <strong>Assignee:</strong> {task.assignee}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {task.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(task.capa_id)}
                      className="btn btn-secondary btn-sm"
                    >
                      ▶ Start Working (In Progress)
                    </button>
                  )}

                  {task.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(task.capa_id)}
                      className="btn btn-secondary btn-sm"
                    >
                      🔍 Submit for Audit Review
                    </button>
                  )}

                  {task.status === 'under_review' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTaskForSignoff(task)
                        setShowSignoffModal(true)
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      ✍️ Executive Sign-Off & Close
                    </button>
                  )}

                  {task.status === 'closed' && (
                    <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Remediation Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Assign New CAPA Modal ────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content card" style={{ maxWidth: '600px', width: '90%', padding: '1.5rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-heading)' }}>
              ➕ Assign New CAPA Remediation Task
            </h2>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Patch API Gateway for Mandatory MFA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Circular / Rule ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCircularId}
                    onChange={(e) => setNewCircularId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Risk Level</label>
                  <select
                    className="form-control"
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Responsible Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Assignee</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Breach & Risk Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Mandatory Corrective Action</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={newCorrectiveAction}
                  onChange={(e) => setNewCorrectiveAction(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">SLA Target Completion (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={newDueDays}
                  onChange={(e) => setNewDueDays(parseInt(e.target.value) || 14)}
                  min={1}
                  max={180}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create CAPA Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Supervisory Signoff Modal ────────────────────────────────────── */}
      {showSignoffModal && activeTaskForSignoff && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content card" style={{ maxWidth: '550px', width: '90%', padding: '1.5rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-heading)' }}>
              ✍️ Senior Risk Officer Sign-Off
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Executing sign-off for task: <strong>{activeTaskForSignoff.capa_id} — {activeTaskForSignoff.title}</strong>
            </p>

            <form onSubmit={handleExecuteSignoff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Signing Officer Name & Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={signoffOfficer}
                  onChange={(e) => setSignoffOfficer(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Verification Evidence / PR Link / Audit Log Proof</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Pull Request #482 merged; Qualys Vulnerability Scan showing 100% resolution; Test automation suite log ID #9921."
                  value={signoffEvidence}
                  onChange={(e) => setSignoffEvidence(e.target.value)}
                  required
                />
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#166534' }}>
                🔒 Executing this sign-off will generate an immutable verification record in the VeriRule Audit Trail.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignoffModal(false)
                    setActiveTaskForSignoff(null)
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                  ✓ Certify & Close CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
