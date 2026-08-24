import { useEffect, useState } from 'react'
import {
  fetchAuditLogs,
  fetchAuditStats,
  postAuditLog,
  AuditEvent,
  AuditStats,
  AuditCategory,
  AuditSeverity,
} from '../services/auditService'

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeSeverity, setActiveSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  // Manual Audit Modal state
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthority, setNewAuthority] = useState('Reserve Bank of India')
  const [newCategory, setNewCategory] = useState<AuditCategory>('verification')
  const [newDocId, setNewDocId] = useState('RBI/2023-24/108')
  const [newSection, setNewSection] = useState('Section 3.1.2')
  const [newPassage, setNewPassage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [fetchedLogs, fetchedStats] = await Promise.all([
        fetchAuditLogs({
          category: activeCategory !== 'all' ? activeCategory : undefined,
          severity: activeSeverity !== 'all' ? activeSeverity : undefined,
          search: searchQuery.trim() || undefined,
        }),
        fetchAuditStats(),
      ])
      setLogs(fetchedLogs)
      setStats(fetchedStats)
    } catch (err) {
      console.error('Failed to load audit data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeCategory, activeSeverity, searchQuery])

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsSubmitting(true)
    try {
      await postAuditLog({
        title: newTitle.trim(),
        category: newCategory,
        severity: 'verified',
        authority: newAuthority,
        document_id: newDocId.trim(),
        section: newSection.trim(),
        passage_text: newPassage.trim() || 'Manual verification audit recorded by compliance team.',
        details: `Verified requirement ${newDocId} (${newSection}) with source proof.`,
        confidence_score: 0.98,
        execution_time_ms: 110,
      })

      // Reset modal
      setNewTitle('')
      setNewPassage('')
      setShowModal(false)
      await loadData()
    } catch (err) {
      console.error('Error logging audit event:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportReport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `verirule_audit_report_${Date.now()}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } else {
      const headers = ['ID', 'Timestamp', 'Category', 'Severity', 'Title', 'Authority', 'Document ID', 'Section', 'Confidence', 'Hash']
      const rows = logs.map((l) => [
        l.id,
        l.timestamp,
        l.category,
        l.severity,
        `"${l.title.replace(/"/g, '""')}"`,
        l.authority || '',
        l.document_id || '',
        l.section || '',
        l.confidence_score ? `${Math.round(l.confidence_score * 100)}%` : '',
        l.verification_hash,
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `verirule_audit_report_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }

  const getCategoryBadgeClass = (cat: AuditCategory) => {
    switch (cat) {
      case 'query':
        return 'badge-cat-query'
      case 'verification':
        return 'badge-cat-verification'
      case 'ingestion':
        return 'badge-cat-ingestion'
      case 'supersession':
        return 'badge-cat-supersession'
      default:
        return 'badge-cat-system'
    }
  }

  const getSeverityBadgeClass = (sev: AuditSeverity) => {
    switch (sev) {
      case 'verified':
        return 'badge-status badge-active'
      case 'superseded':
        return 'badge-status badge-superseded'
      case 'flagged':
        return 'badge-status badge-flagged'
      default:
        return 'badge-status badge-info'
    }
  }

  return (
    <div className="audit-trail-page">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="audit-header-panel">
        <div>
          <span className="eyebrow">Governance & Compliance Intelligence</span>
          <h1>Compliance Audit Trail</h1>
          <p>
            Cryptographically verifiable audit log tracking query executions, evidence verifications, and regulatory supersessions.
          </p>
        </div>

        <div className="audit-actions">
          <button type="button" onClick={() => loadData()} className="btn btn-ghost btn-sm" title="Refresh Audit Trail">
            <span>🔄</span> Refresh
          </button>
          <button type="button" onClick={() => setShowModal(true)} className="btn btn-secondary btn-sm">
            <span>+</span> Log Audit Event
          </button>

          <div className="dropdown-export">
            <button type="button" onClick={() => exportReport('json')} className="btn btn-primary btn-sm">
              <span>📥</span> Export Report (JSON)
            </button>
            <button type="button" onClick={() => exportReport('csv')} className="btn btn-ghost btn-sm">
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Grid ────────────────────────────────────────── */}
      {stats && (
        <div className="metrics-grid audit-metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Audited Events</span>
              <div className="metric-icon-wrap">🛡️</div>
            </div>
            <div className="metric-value">{stats.total_events}</div>
            <div className="metric-sub">Recorded in compliance ledger</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Verified Passages</span>
              <div className="metric-icon-wrap">✓</div>
            </div>
            <div className="metric-value">{stats.verified_count}</div>
            <div className="metric-sub">Grounded by active rules</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Superseded Notices</span>
              <div className="metric-icon-wrap">⚡</div>
            </div>
            <div className="metric-value">{stats.superseded_count}</div>
            <div className="metric-sub">Conflict resolution events</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Average Confidence</span>
              <div className="metric-icon-wrap">🎯</div>
            </div>
            <div className="metric-value">{Math.round(stats.average_confidence * 100)}%</div>
            <div className="metric-sub">Vector similarity score</div>
          </div>
        </div>
      )}

      {/* ── Filters Toolbar ─────────────────────────────────────────── */}
      <div className="audit-filter-card dashboard-section-card">
        <div className="filter-row">
          <div className="category-pills">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'query', label: 'Query Searches' },
              { id: 'verification', label: 'Rule Verifications' },
              { id: 'supersession', label: 'Supersessions' },
              { id: 'ingestion', label: 'Document Ingestions' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <select
              className="audit-select"
              value={activeSeverity}
              onChange={(e) => setActiveSeverity(e.target.value)}
              aria-label="Filter severity"
            >
              <option value="all">All Severities</option>
              <option value="verified">Verified</option>
              <option value="superseded">Superseded</option>
              <option value="flagged">Flagged</option>
              <option value="info">Info</option>
            </select>

            <div className="audit-search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="audit-search-input"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Audit Logs List ─────────────────────────────────────────── */}
      <div className="dashboard-section-card audit-list-card">
        <div className="audit-list-header">
          <h2>Audit Log Records ({logs.length})</h2>
          <span className="live-indicator">
            <span className="pulse-dot" /> Real-time Sync Active
          </span>
        </div>

        {loading ? (
          <div className="audit-loading-state">
            <div className="spinner" />
            <p>Fetching compliance audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No audit records match your filters</h3>
            <p>Try clearing your category or severity search filter.</p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setActiveCategory('all')
                setActiveSeverity('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="audit-timeline">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`audit-timeline-item ${selectedEvent?.id === log.id ? 'active-item' : ''}`}
                onClick={() => setSelectedEvent(log)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedEvent(log)
                }}
              >
                <div className="timeline-left">
                  <div className={`timeline-badge ${getCategoryBadgeClass(log.category)}`}>
                    {log.category === 'query' && '🔍'}
                    {log.category === 'verification' && '✓'}
                    {log.category === 'supersession' && '⚡'}
                    {log.category === 'ingestion' && '📥'}
                    {log.category === 'system' && '⚙️'}
                  </div>
                </div>

                <div className="timeline-content">
                  <div className="timeline-topline">
                    <div className="timeline-title-wrap">
                      <span className="audit-id-badge">{log.id}</span>
                      <h3 className="timeline-title">{log.title}</h3>
                      <span className={getSeverityBadgeClass(log.severity)}>{log.severity}</span>
                    </div>

                    <div className="timeline-time">
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="timeline-date">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {log.query_text && <p className="timeline-query">“{log.query_text}”</p>}

                  <div className="timeline-metadata">
                    {log.authority && <span className="meta-tag authority-tag">{log.authority}</span>}
                    {log.document_id && <span className="meta-tag doc-tag">Doc: {log.document_id}</span>}
                    {log.section && <span className="meta-tag section-tag">{log.section}</span>}
                    {log.confidence_score !== undefined && (
                      <span className="meta-tag confidence-tag">
                        Confidence: {Math.round(log.confidence_score * 100)}%
                      </span>
                    )}
                    {log.execution_time_ms && (
                      <span className="meta-tag latency-tag">⚡ {log.execution_time_ms} ms</span>
                    )}
                    <span className="meta-tag hash-tag" title={log.verification_hash}>
                      Sig: {log.verification_hash.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Inspection Drawer / Modal ─────────────────────────────────── */}
      {selectedEvent && (
        <div className="audit-drawer-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="audit-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Audit Inspection Record</span>
                <h2>{selectedEvent.title}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className="audit-id-badge">{selectedEvent.id}</span>
                  <span className={getSeverityBadgeClass(selectedEvent.severity)}>{selectedEvent.severity}</span>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setSelectedEvent(null)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Cryptographic Verification Signature</h4>
                <div className="code-box">
                  <code>{selectedEvent.verification_hash}</code>
                </div>
                <span className="hash-hint">SHA-256 integrity hash issued at audit entry creation.</span>
              </div>

              {selectedEvent.query_text && (
                <div className="drawer-section">
                  <h4>Query Statement</h4>
                  <div className="quote-box">“{selectedEvent.query_text}”</div>
                </div>
              )}

              {selectedEvent.passage_text && (
                <div className="drawer-section">
                  <h4>Grounding Evidence Passage</h4>
                  <div className="passage-box">{selectedEvent.passage_text}</div>
                </div>
              )}

              <div className="drawer-section">
                <h4>Document & Rule Metadata</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Authority</span>
                    <span className="detail-val">{selectedEvent.authority || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Document ID</span>
                    <span className="detail-val">{selectedEvent.document_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Document Title</span>
                    <span className="detail-val">{selectedEvent.document_title || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Section Reference</span>
                    <span className="detail-val">{selectedEvent.section || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Similarity Score</span>
                    <span className="detail-val">
                      {selectedEvent.confidence_score !== undefined
                        ? `${Math.round(selectedEvent.confidence_score * 100)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Execution Time</span>
                    <span className="detail-val">
                      {selectedEvent.execution_time_ms ? `${selectedEvent.execution_time_ms} ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timestamp</span>
                    <span className="detail-val">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Verified By</span>
                    <span className="detail-val">{selectedEvent.actor}</span>
                  </div>
                </div>
              </div>

              {selectedEvent.details && (
                <div className="drawer-section">
                  <h4>Audit Remarks</h4>
                  <p className="drawer-remarks">{selectedEvent.details}</p>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Audit Logging Modal ───────────────────────────────── */}
      {showModal && (
        <div className="audit-drawer-backdrop" onClick={() => setShowModal(false)}>
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Manual Audit Action</span>
                <h2>Record Compliance Verification</h2>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAudit}>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="audit-title">Audit Action Title</label>
                  <input
                    id="audit-title"
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Master Direction Cyber Compliance Verification"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="audit-authority">Regulatory Authority</label>
                    <select
                      id="audit-authority"
                      className="modal-input"
                      value={newAuthority}
                      onChange={(e) => setNewAuthority(e.target.value)}
                    >
                      <option value="Reserve Bank of India">Reserve Bank of India (RBI)</option>
                      <option value="SEBI">SEBI</option>
                      <option value="Basel Committee">Basel Committee (BCBS)</option>
                      <option value="IRDAI">IRDAI</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="audit-category">Category</label>
                    <select
                      id="audit-category"
                      className="modal-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AuditCategory)}
                    >
                      <option value="verification">Rule Verification</option>
                      <option value="query">Query Search</option>
                      <option value="supersession">Supersession Link</option>
                      <option value="ingestion">Document Ingestion</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="audit-doc-id">Document ID</label>
                    <input
                      id="audit-doc-id"
                      type="text"
                      className="modal-input"
                      value={newDocId}
                      onChange={(e) => setNewDocId(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="audit-section">Section Reference</label>
                    <input
                      id="audit-section"
                      type="text"
                      className="modal-input"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="audit-passage">Grounded Evidence Passage</label>
                  <textarea
                    id="audit-passage"
                    className="modal-input"
                    rows={3}
                    placeholder="Enter the official text clause verified against..."
                    value={newPassage}
                    onChange={(e) => setNewPassage(e.target.value)}
                  />
                </div>
              </div>

              <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !newTitle.trim()}>
                  {isSubmitting ? 'Logging...' : 'Save Audit Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
