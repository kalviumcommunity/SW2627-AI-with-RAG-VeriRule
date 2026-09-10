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

const getRiskColors = (level: string) => {
  switch (level) {
    case 'high':   return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444', tag: '#FEE2E2', tagText: '#B91C1C' }
    case 'medium': return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B', tag: '#FEF3C7', tagText: '#B45309' }
    case 'low':    return { bg: '#F0FDF4', border: '#A7F3D0', text: '#065F46', dot: '#10B981', tag: '#D1FAE5', tagText: '#047857' }
    default:       return { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280', dot: '#9CA3AF', tag: '#F3F4F6', tagText: '#6B7280' }
  }
}

const quickLinks = [
  { to: '/dashboard/rule-verifier', icon: '🎯', label: 'Rule Verifier', desc: 'Verify transaction compliance' },
  { to: '/dashboard/rule-timeline', icon: '📅', label: 'Rule Timeline', desc: 'Trace regulatory changes' },
  { to: '/dashboard/chat', icon: '💬', label: 'Compliance Chat', desc: 'Ask AI compliance questions' },
  { to: '/dashboard/analytics', icon: '📊', label: 'Analytics', desc: 'View usage & insights' },
]

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

  const totalDocs = documents.length
  const activeCount = documents.filter((d) => d.status === 'active').length
  const supersededCount = documents.filter((d) => d.status === 'superseded').length
  const totalChunks = documents.reduce((acc, d) => acc + d.chunk_count, 0)

  const kpiCards = [
    { title: 'Indexed Documents', value: loading ? '—' : String(totalDocs), sub: 'In vector repository', icon: '📜', accent: 'kpi-card-blue', trend: '+14% vs last mo', positive: true },
    { title: 'Active Rules', value: loading ? '—' : String(activeCount), sub: 'Currently enforced', icon: '✓', accent: 'kpi-card-green', trend: '100% compliant', positive: true },
    { title: 'Superseded', value: loading ? '—' : String(supersededCount), sub: 'Historical conflicts', icon: '⚠', accent: 'kpi-card-amber', trend: '2 active conflicts', positive: false },
    { title: 'Vector Chunks', value: loading ? '—' : String(totalChunks), sub: 'Embedded passages', icon: '🔍', accent: 'kpi-card-violet', trend: '512 kb embeddings', positive: true },
  ]

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* ── Enterprise Page Header ────────────────────────────────────────── */}
      <div className="enterprise-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="enterprise-category-tag"><span>⚡ EXECUTIVE OVERVIEW</span></div>
          <h1 className="enterprise-header-title">Welcome back, {firstName}</h1>
          <p className="enterprise-header-subtitle">
            Real-time compliance exposure, rule supersession mapping, and active AI intelligence monitoring across all regulatory authorities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/query-engine" className="enterprise-btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Ask AI Assistant
          </Link>
          <Link to="/dashboard/reports" className="enterprise-btn-outline">Generate Report</Link>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="enterprise-grid-4" style={{ marginBottom: '2rem' }}>
        {kpiCards.map((card) => (
          <div key={card.title} className={`enterprise-stat-card ${card.accent}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="enterprise-stat-label">{card.title}</span>
              <div className="enterprise-icon-box">
                <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
              </div>
            </div>
            <div>
              <div className="enterprise-stat-val">{card.value}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{card.sub}</span>
                <span className={`enterprise-trend-pill ${card.positive ? 'enterprise-trend-positive' : 'enterprise-trend-negative'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Compliance Risk Heatmap ───────────────────────────────────────── */}
      <div className="panel-card" style={{ marginBottom: '2rem' }}>
        <div className="panel-card-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Compliance Risk Heatmap</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>At-a-glance compliance exposure by transaction category</p>
          </div>
          <Link to="/dashboard/rule-verifier" className="enterprise-btn-outline" style={{ fontSize: '0.85rem' }}>
            Open Rule Verifier →
          </Link>
        </div>
        <div className="panel-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {RISK_HEATMAP.map((cell) => {
              const c = getRiskColors(cell.riskLevel)
              return (
                <Link
                  key={cell.category}
                  to="/dashboard/rule-verifier"
                  style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: '16px', padding: '1.25rem', textDecoration: 'none', transition: 'all 200ms ease', display: 'block' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.08)` }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: c.text }}>{cell.label}</span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, boxShadow: `0 0 0 3px ${c.tag}` }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.875rem' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{cell.activeRules}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: c.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cell.supersededRules > 0 ? '#EF4444' : '#9CA3AF' }}>{cell.supersededRules}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: c.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Superseded</div>
                    </div>
                  </div>
                  <div style={{ background: c.tag, color: c.tagText, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.77rem', fontWeight: 700, textAlign: 'center' }}>
                    {cell.riskLevel === 'high' ? '⚠ Conflict Detected' : cell.riskLevel === 'medium' ? '⏳ Pending Review' : '✓ Compliant'}
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
            {[{ dot: '#10B981', label: 'Compliant — No unresolved conflicts' }, { dot: '#F59E0B', label: 'Pending Review — Recent regulatory updates' }, { dot: '#EF4444', label: 'Conflict Detected — Active + superseded rules coexist' }].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#4B5563' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-Column: Authority Coverage + Quick Access ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Authority Distribution */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Regulatory Authority Coverage</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>Indexed documents by governing body</p>
            </div>
          </div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authorities.map((a) => (
              <div key={a.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{a.name}</span>
                  <span style={{ fontWeight: 700, color: a.color }}>{a.pct}%</span>
                </div>
                <div className="authority-bar-track">
                  <div className="authority-bar-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Quick Access</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>Frequently used tools</p>
            </div>
          </div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="quick-access-item"
              >
                <div className="quick-access-icon">{item.icon}</div>
                <div>
                  <div className="quick-access-label">{item.label}</div>
                  <div className="quick-access-desc">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recently Indexed Documents ────────────────────────────────────── */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Recently Indexed Documents</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>Live from vector document repository</p>
          </div>
          <Link to="/dashboard/documents" className="enterprise-btn-outline" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
            View all →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="enterprise-table">
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
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.4 }}>⏳</div>
                    Loading document inventory...
                  </td>
                </tr>
              )}
              {!loading && documents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No documents indexed yet.
                  </td>
                </tr>
              )}
              {(loading ? [] : documents.slice(0, 5)).map((doc) => (
                <tr key={doc.document_id}>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5' }}>
                    {doc.document_id}
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 280 }}>
                    <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{doc.authority || 'N/A'}</td>
                  <td>
                    <span className={`enterprise-badge ${doc.status === 'active' ? 'enterprise-badge-success' : 'enterprise-badge-danger'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.84rem' }}>{doc.effective_date || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}