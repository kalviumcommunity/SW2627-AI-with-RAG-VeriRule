import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchDocuments, DocumentSummary } from '../services/documentService'

const authorities = [
  { name: 'Reserve Bank of India (RBI)', pct: 44, color: '#4f46e5' },
  { name: 'Securities and Exchange Board (SEBI)', pct: 32, color: '#7c3aed' },
  { name: 'Basel Committee (BCBS)', pct: 15, color: '#0d9488' },
  { name: 'Insurance Regulatory (IRDAI)', pct: 9, color: '#d97706' },
]

interface RiskCell {
  category: string
  label: string
  activeRules: number
  supersededRules: number
  riskLevel: 'low' | 'medium' | 'high'
  scenario: string
}

const RISK_HEATMAP: RiskCell[] = [
  {
    category: 'Cyber Security & IT Risk',
    label: 'Cyber Security',
    activeRules: 8,
    supersededRules: 4,
    riskLevel: 'high',
    scenario: '24x7 Security Operations Centre (SOC) Infrastructure',
  },
  {
    category: 'Digital Payments',
    label: 'Digital Payments',
    activeRules: 6,
    supersededRules: 1,
    riskLevel: 'medium',
    scenario: 'Digital Payment Beneficiary Transfer (₹5,00,000)',
  },
  {
    category: 'Market Infrastructure',
    label: 'Market Infra',
    activeRules: 11,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Stock Broker Trade Authentication & Log Storage',
  },
  {
    category: 'Capital & Risk Governance',
    label: 'Capital Risk',
    activeRules: 5,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Operational Resilience ICT Recovery Assessment',
  },
  {
    category: 'Internal Risk Governance',
    label: 'Internal Audit',
    activeRules: 3,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Internal Audit SOC Coverage',
  },
  {
    category: 'KYC & AML Compliance',
    label: 'KYC / AML',
    activeRules: 4,
    supersededRules: 2,
    riskLevel: 'medium',
    scenario: 'High-value customer onboarding KYC',
  },
]

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' }
    case 'medium':
      return { bg: '#fffbeb', border: '#fef3c7', text: '#92400e', dot: '#f59e0b' }
    case 'low':
      return { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' }
    default:
      return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', dot: '#9ca3af' }
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user.name ? user.name.split(' ')[0] : 'User'
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await fetchDocuments()
        setDocuments(data)
      } catch {
        // fallback to empty
      } finally {
        setLoading(false)
      }
    }
    loadDocs()
  }, [])

  // Compute live metrics from document repository
  const totalDocs = documents.length
  const activeCount = documents.filter((d) => d.status === 'active').length
  const supersededCount = documents.filter((d) => d.status === 'superseded').length
  const totalChunks = documents.reduce((acc, d) => acc + d.chunk_count, 0)

  const liveMetrics = [
    { title: 'Indexed Documents', value: loading ? '...' : String(totalDocs), sub: 'In vector repository', icon: '📜' },
    { title: 'Active Rules', value: loading ? '...' : String(activeCount), sub: 'Currently enforced', icon: '✓' },
    { title: 'Superseded', value: loading ? '...' : String(supersededCount), sub: 'Historical conflicts', icon: '⚡' },
    { title: 'Vector Chunks', value: loading ? '...' : String(totalChunks), sub: 'Embedded passages', icon: '🔍' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Welcome ──────────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}</h1>
        <p>Here's an overview of your regulatory compliance workspace.</p>
      </div>

      {/* ── Live Metrics ─────────────────────────────────────────────── */}
      <div className="metrics-grid">
        {liveMetrics.map((m) => (
          <div key={m.title} className="metric-card">
            <div className="metric-header">
              <span className="metric-title">{m.title}</span>
              <div className="metric-icon-wrap">{m.icon}</div>
            </div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Compliance Risk Heatmap ──────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 className="section-card-title" style={{ margin: '0 0 0.15rem 0' }}>Compliance Risk Heatmap</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              At-a-glance compliance exposure by transaction category
            </span>
          </div>
          <Link to="/dashboard/rule-verifier" className="btn btn-ghost btn-sm">
            Open Rule Verifier →
          </Link>
        </div>

        <div className="risk-heatmap-grid">
          {RISK_HEATMAP.map((cell) => {
            const colors = getRiskColor(cell.riskLevel)
            return (
              <Link
                key={cell.category}
                to="/dashboard/rule-verifier"
                className="risk-heatmap-cell"
                style={{
                  background: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <div className="risk-cell-header">
                  <span className="risk-cell-label">{cell.label}</span>
                  <span className="risk-level-dot" style={{ background: colors.dot }} />
                </div>
                <div className="risk-cell-stats">
                  <div className="risk-stat">
                    <span className="risk-stat-value" style={{ color: '#10b981' }}>{cell.activeRules}</span>
                    <span className="risk-stat-label">Active</span>
                  </div>
                  <div className="risk-stat">
                    <span className="risk-stat-value" style={{ color: cell.supersededRules > 0 ? '#ef4444' : '#9ca3af' }}>
                      {cell.supersededRules}
                    </span>
                    <span className="risk-stat-label">Superseded</span>
                  </div>
                </div>
                <div className="risk-level-badge" style={{ color: colors.text, background: colors.border }}>
                  {cell.riskLevel === 'high'
                    ? '⚠ Conflict Detected'
                    : cell.riskLevel === 'medium'
                    ? '⏳ Pending Review'
                    : '✓ Compliant'}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="heatmap-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>Compliant — No unresolved conflicts</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>Pending Review — Recent regulatory updates</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ef4444' }} />
            <span>Conflict Detected — Active + superseded rules coexist</span>
          </div>
        </div>
      </div>

      {/* ── Two Column: Authority Coverage + Quick Access ─────────── */}
      <div className="dashboard-overview-grid">

        {/* Authority Distribution */}
        <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
          <h2 className="section-card-title">Regulatory Authority Coverage</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {authorities.map((a) => (
              <div key={a.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{a.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{a.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f3f6', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${a.pct}%`, height: '100%', background: a.color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="dashboard-section-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="section-card-title">Quick Access</h2>
            <div className="quick-access-links">
              <Link to="/dashboard/rule-verifier" className="quick-access-item">
                <span className="qa-icon">🎯</span>
                <div>
                  <strong>Rule Verifier</strong>
                  <span>Verify transaction compliance & generate proof</span>
                </div>
              </Link>
              <Link to="/dashboard/rule-timeline" className="quick-access-item">
                <span className="qa-icon">📅</span>
                <div>
                  <strong>Rule Timeline</strong>
                  <span>Trace supersession chains across directives</span>
                </div>
              </Link>
              <Link to="/dashboard/query-engine" className="quick-access-item">
                <span className="qa-icon">⚡</span>
                <div>
                  <strong>AI Query Engine</strong>
                  <span>Natural language compliance search</span>
                </div>
              </Link>
              <Link to="/dashboard/documents" className="quick-access-item">
                <span className="qa-icon">📁</span>
                <div>
                  <strong>Document Repository</strong>
                  <span>Upload & manage regulatory documents</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recently Indexed Documents (live) ──────────────────────── */}
      <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h2 className="section-card-title" style={{ margin: 0 }}>Recently Indexed Documents</h2>
          <Link to="/dashboard/documents" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>
        <div className="circulars-table-wrapper">
          <table className="circulars-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Title</th>
                <th>Authority</th>
                <th>Status</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : documents.slice(0, 5)).map((doc) => (
                <tr key={doc.document_id}>
                  <td style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#4f46e5' }}>
                    {doc.document_id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{doc.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{doc.authority || 'N/A'}</td>
                  <td>
                    <span className={`badge-status ${doc.status === 'active' ? 'badge-active' : 'badge-superseded'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{doc.effective_date || 'N/A'}</td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading document inventory...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
