import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const metrics = [
  { title: 'Total Circulars', value: '1,420', sub: '+12 this week', icon: '📜' },
  { title: 'Active Rules', value: '1,278', sub: 'Enforced by engine', icon: '✓' },
  { title: 'Superseded', value: '142', sub: 'Resolved conflicts', icon: '⚡' },
  { title: 'Citations', value: '12,850', sub: 'Source-verified', icon: '🔍' },
]

const recentCirculars = [
  {
    id: 'RBI/2023-24/108',
    title: 'Master Direction on Cyber Security Framework for Financial Entities',
    authority: 'RBI',
    status: 'Active' as const,
    date: '2023-11-07',
  },
  {
    id: 'RBI/2021-22/15',
    title: 'Master Direction – Digital Payment Security Controls in Banks',
    authority: 'RBI',
    status: 'Active' as const,
    date: '2021-02-18',
  },
  {
    id: 'SEBI/HO/MIRSD/2022/101',
    title: 'Framework for Cyber Security and Cyber Resilience for Stock Brokers',
    authority: 'SEBI',
    status: 'Active' as const,
    date: '2022-07-20',
  },
  {
    id: 'BCBS/D516',
    title: 'Principles for Operational Resilience in Commercial Banks',
    authority: 'Basel Committee',
    status: 'Active' as const,
    date: '2021-03-31',
  },
  {
    id: 'RBI/2016-17/38',
    title: 'Cyber Security Framework in Banks (Baseline Guidance)',
    authority: 'RBI',
    status: 'Superseded' as const,
    date: '2016-06-02',
  },
]

const authorities = [
  { name: 'Reserve Bank of India (RBI)', pct: 44, color: '#4f46e5' },
  { name: 'Securities and Exchange Board (SEBI)', pct: 32, color: '#7c3aed' },
  { name: 'Basel Committee (BCBS)', pct: 15, color: '#0d9488' },
  { name: 'Insurance Regulatory (IRDAI)', pct: 9, color: '#d97706' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user.name ? user.name.split(' ')[0] : 'User'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Welcome ──────────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}</h1>
        <p>Here's an overview of your regulatory compliance workspace.</p>
      </div>

      {/* ── Metrics ──────────────────────────────────────────────────── */}
      <div className="metrics-grid">
        {metrics.map((m) => (
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

      {/* ── Two Column: Authority Coverage + Quick Access ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

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

        {/* Circulars Quick Access */}
        <div className="dashboard-section-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="section-card-title">Circulars & Rules Engine</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55, marginBottom: '1rem' }}>
              Browse indexed RBI, SEBI, and Basel Committee circulars. Track supersession links and inspect extracted compliance rules.
            </p>
            <div style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #eaecf0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Automatic Conflict Resolution</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Master Directions automatically resolve superseded circulars with traceable source proof.
              </div>
            </div>
          </div>
          <Link to="/dashboard/circulars" className="btn btn-primary" style={{ textAlign: 'center' }}>
            Open Circulars & Rules →
          </Link>
        </div>
      </div>

      {/* ── Recent Circulars Table ────────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h2 className="section-card-title" style={{ margin: 0 }}>Recently Indexed Circulars</h2>
          <Link to="/dashboard/circulars" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>
        <div className="circulars-table-wrapper">
          <table className="circulars-table">
            <thead>
              <tr>
                <th>Circular ID</th>
                <th>Title</th>
                <th>Authority</th>
                <th>Status</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCirculars.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#4f46e5' }}>
                    {row.id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.authority}</td>
                  <td>
                    <span className={`badge-status ${row.status === 'Active' ? 'badge-active' : 'badge-superseded'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
