import { useState } from 'react'
import { Link } from 'react-router-dom'

interface TimelineNode {
  id: string
  documentId: string
  title: string
  authority: string
  category: string
  issueDate: string
  status: 'active' | 'superseded' | 'under_review'
  section?: string
  passage: string
  supersededBy?: string
  supersedes?: string
}

const TIMELINE_DATA: TimelineNode[] = [
  {
    id: 'tl-1',
    documentId: 'RBI/2016-17/38',
    title: 'Cyber Security Framework in Banks (Baseline Guidance)',
    authority: 'Reserve Bank of India',
    category: 'Cyber Security',
    issueDate: '2016-06-02',
    status: 'superseded',
    section: 'Section 2.1',
    passage:
      'Banks are advised to maintain basic password complexity policies and periodic security reviews as a baseline cyber security measure.',
    supersededBy: 'RBI/2023-24/108',
  },
  {
    id: 'tl-2',
    documentId: 'RBI/2019-20/55',
    title: 'Interim Advisory on Multi-Factor Authentication for Internet Banking',
    authority: 'Reserve Bank of India',
    category: 'Cyber Security',
    issueDate: '2019-09-12',
    status: 'superseded',
    section: 'Section 3.2',
    passage:
      'Banks shall implement two-factor authentication for all internet banking sessions. Software OTP is acceptable as the second factor.',
    supersededBy: 'RBI/2023-24/108',
    supersedes: 'RBI/2016-17/38',
  },
  {
    id: 'tl-3',
    documentId: 'RBI/2023-24/108',
    title: 'Master Direction on Cyber Security Framework for Financial Entities',
    authority: 'Reserve Bank of India',
    category: 'Cyber Security',
    issueDate: '2023-11-07',
    status: 'active',
    section: 'Section 3.1.2 & Section 5.2.0',
    passage:
      'Entities must maintain continuous 24x7 Security Operations Centre (SOC) capability for threat detection and event correlation. Privileged database access requires hardware-backed or cryptographic Multi-Factor Authentication.',
    supersedes: 'RBI/2019-20/55',
  },
  {
    id: 'tl-4',
    documentId: 'RBI/2018-19/22',
    title: 'Circular on Payment Cooling-Off Period for New Beneficiaries',
    authority: 'Reserve Bank of India',
    category: 'Digital Payments',
    issueDate: '2018-08-15',
    status: 'superseded',
    section: 'Para 4',
    passage:
      'Banks may implement a 4-hour cooling-off period for newly added beneficiaries in internet banking at their discretion.',
    supersededBy: 'RBI/2021-22/15',
  },
  {
    id: 'tl-5',
    documentId: 'RBI/2021-22/15',
    title: 'Master Direction – Digital Payment Security Controls in Banks',
    authority: 'Reserve Bank of India',
    category: 'Digital Payments',
    issueDate: '2021-02-18',
    status: 'active',
    section: 'Section 4.1.1 & Section 7.3.0',
    passage:
      'Authentication tokens must dynamically tie the OTP to specific beneficiary account details and payment amount. Banks shall enforce a mandatory 2-hour transfer limit cooling period for newly added payment beneficiaries.',
    supersedes: 'RBI/2018-19/22',
  },
  {
    id: 'tl-6',
    documentId: 'SEBI/HO/MIRSD/2022/101',
    title: 'Framework for Cyber Security and Cyber Resilience for Stock Brokers',
    authority: 'SEBI',
    category: 'Market Infrastructure',
    issueDate: '2022-07-20',
    status: 'active',
    section: 'Section 6.2.0',
    passage:
      'Authentication and trade order logs must be stored in Write-Once-Read-Many (WORM) media for a minimum period of 7 years.',
  },
  {
    id: 'tl-7',
    documentId: 'BCBS/D516',
    title: 'Principles for Operational Resilience in Commercial Banks',
    authority: 'Basel Committee',
    category: 'Capital & Risk Governance',
    issueDate: '2021-03-31',
    status: 'active',
    section: 'Principle 4',
    passage:
      'Pillar 2 capital assessment must incorporate cyber operational outage and recovery scenarios across critical clearing and settlement services.',
  },
  {
    id: 'tl-8',
    documentId: 'AUD-INT-2024-Q2',
    title: 'Internal Audit Report on Cyber Incident Readiness & SOC 24x7 Coverage',
    authority: 'Internal Bank Audit Committee',
    category: 'Internal Risk Governance',
    issueDate: '2024-05-14',
    status: 'active',
    section: 'Finding #1',
    passage:
      'Legacy password controls (RBI/2016-17/38) are no longer sufficient. 24x7 SOC telemetry, as mandated by RBI/2023-24/108, is strictly mandatory for core compliance.',
  },
]

const CATEGORIES = ['All', 'Cyber Security', 'Digital Payments', 'Market Infrastructure', 'Capital & Risk Governance', 'Internal Risk Governance']
const AUTHORITIES = ['All', 'Reserve Bank of India', 'SEBI', 'Basel Committee', 'Internal Bank Audit Committee']

export default function RuleTimelinePage() {
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [authorityFilter, setAuthorityFilter] = useState('All')
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [showSupersededOnly, setShowSupersededOnly] = useState(false)

  const filtered = TIMELINE_DATA.filter((node) => {
    if (categoryFilter !== 'All' && node.category !== categoryFilter) return false
    if (authorityFilter !== 'All' && node.authority !== authorityFilter) return false
    if (showSupersededOnly && node.status !== 'superseded') return false
    return true
  }).sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime())

  const activeCount = TIMELINE_DATA.filter((n) => n.status === 'active').length
  const supersededCount = TIMELINE_DATA.filter((n) => n.status === 'superseded').length
  const chainCount = TIMELINE_DATA.filter((n) => n.supersedes || n.supersededBy).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'
      case 'superseded':
        return '#ef4444'
      case 'under_review':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const findLinkedDoc = (docId: string | undefined) => {
    if (!docId) return null
    return TIMELINE_DATA.find((n) => n.documentId === docId)
  }

  return (
    <div className="timeline-page">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Regulatory Document Lineage</span>
          <h1>Rule Supersession Timeline</h1>
          <p>
            Visualize how compliance rules evolved over time. Trace supersession chains from
            historical circulars to current Master Directions.
          </p>
        </div>
        <div className="doc-header-stats">
          <div className="header-stat-chip">
            <span>Active Rules</span>
            <strong style={{ color: '#10b981' }}>{activeCount}</strong>
          </div>
          <div className="header-stat-chip">
            <span>Superseded</span>
            <strong style={{ color: '#ef4444' }}>{supersededCount}</strong>
          </div>
          <div className="header-stat-chip">
            <span>Linked Chains</span>
            <strong>{chainCount}</strong>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
        <div className="filter-row">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="filter-controls">
            <select
              className="audit-select"
              value={authorityFilter}
              onChange={(e) => setAuthorityFilter(e.target.value)}
            >
              {AUTHORITIES.map((a) => (
                <option key={a} value={a}>
                  {a === 'All' ? 'All Authorities' : a}
                </option>
              ))}
            </select>
            <label className="checklist-item" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={showSupersededOnly}
                onChange={(e) => setShowSupersededOnly(e.target.checked)}
              />
              <span>Superseded only</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Timeline Visualization ──────────────────────────────────── */}
      <div className="dashboard-section-card timeline-container" style={{ marginBottom: 0 }}>
        <div className="timeline-header-row">
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
            Regulatory Rule Evolution ({filtered.length} documents)
          </h2>
          <span className="live-indicator">
            <span className="pulse-dot" /> Lineage graph synchronized
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="audit-empty-state">
            <div className="empty-icon">📅</div>
            <h3>No rules match your filters</h3>
            <p>Try adjusting your category or authority filter.</p>
          </div>
        ) : (
          <div className="timeline-track">
            {filtered.map((node, index) => {
              const isExpanded = expandedNode === node.id
              const linkedSupersededBy = findLinkedDoc(node.supersededBy)
              const linkedSupersedes = findLinkedDoc(node.supersedes)

              return (
                <div
                  key={node.id}
                  className={`timeline-node ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                >
                  {/* Connector Line */}
                  {index > 0 && <div className="timeline-connector" />}

                  {/* Node Dot */}
                  <div
                    className="timeline-dot"
                    style={{ background: getStatusColor(node.status) }}
                  >
                    {node.status === 'active' ? '✓' : node.status === 'superseded' ? '✕' : '⏳'}
                  </div>

                  {/* Node Card */}
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div className="timeline-date-badge">
                        {new Date(node.issueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <span
                        className={`badge-status ${node.status === 'active' ? 'badge-active' : 'badge-superseded'}`}
                      >
                        {node.status}
                      </span>
                    </div>

                    <div
                      className="timeline-doc-id"
                      style={{ color: getStatusColor(node.status) }}
                    >
                      {node.documentId}
                    </div>
                    <h3 className="timeline-card-title">{node.title}</h3>

                    <div className="timeline-card-meta">
                      <span className="meta-tag doc-tag">{node.authority}</span>
                      <span className="meta-tag section-tag">{node.category}</span>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="timeline-expanded-content">
                        {node.section && (
                          <div className="timeline-section-tag">
                            Section Reference: <strong>{node.section}</strong>
                          </div>
                        )}

                        <div
                          className={`passage-callout ${node.status === 'active' ? 'active-passage-callout' : 'superseded-passage-callout'}`}
                        >
                          <span className="callout-label">
                            {node.status === 'active' ? 'Active Clause:' : 'Superseded Text:'}
                          </span>
                          <p>"{node.passage}"</p>
                        </div>

                        {/* Supersession Chain Links */}
                        {(linkedSupersededBy || linkedSupersedes) && (
                          <div className="supersession-chain-box">
                            <h4>Supersession Chain</h4>
                            {linkedSupersedes && (
                              <div className="chain-link-item">
                                <span className="chain-arrow">← Supersedes:</span>
                                <span className="chain-doc-ref" style={{ color: '#ef4444' }}>
                                  {linkedSupersedes.documentId}
                                </span>
                                <span className="chain-doc-title">
                                  {linkedSupersedes.title}
                                </span>
                              </div>
                            )}
                            {linkedSupersededBy && (
                              <div className="chain-link-item">
                                <span className="chain-arrow">→ Superseded by:</span>
                                <span className="chain-doc-ref" style={{ color: '#10b981' }}>
                                  {linkedSupersededBy.documentId}
                                </span>
                                <span className="chain-doc-title">
                                  {linkedSupersededBy.title}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ marginTop: '0.75rem' }}>
                          <Link
                            to="/dashboard/rule-verifier"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open in Rule Verifier →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <div className="dashboard-section-card timeline-legend-card" style={{ marginBottom: 0 }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          Timeline Legend
        </h3>
        <div className="timeline-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>Active — Current governing rule (apply this)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ef4444' }} />
            <span>Superseded — Historical rule replaced by newer directive (do not apply)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>Under Review — Pending regulatory update or amendment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
