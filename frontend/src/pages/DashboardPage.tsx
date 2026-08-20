import { Link, useNavigate } from 'react-router-dom'

const metrics = [
  {
    title: 'Active Regulatory Circulars',
    value: '1,420',
    sub: '↑ 12 newly indexed this week',
    icon: '📜',
  },
  {
    title: 'Rule Conflicts Resolved',
    value: '142',
    sub: '✓ 100% supersession accuracy',
    icon: '⚡',
  },
  {
    title: 'Evidence Citations',
    value: '12,850',
    sub: '✓ Source verified & page tagged',
    icon: '🔍',
  },
  {
    title: 'Audit Readiness',
    value: 'Verified',
    sub: '✓ Complete audit log enabled',
    icon: '🛡️',
  },
]

const recentCirculars = [
  {
    id: 'RBI/2026-27/84',
    title: 'Master Direction – Digital Payment Security Controls',
    authority: 'Reserve Bank of India',
    status: 'Active',
    date: '2026-07-15',
    citations: 342,
  },
  {
    id: 'RBI/2025-26/112',
    title: 'Guidelines on Cyber Security Framework in Banks',
    authority: 'Reserve Bank of India',
    status: 'Superseded',
    date: '2025-11-20',
    citations: 189,
  },
  {
    id: 'SEBI/HO/MIRSD/2026/4',
    title: 'Enhanced Due Diligence and KYC Verification Standards',
    authority: 'SEBI',
    status: 'Active',
    date: '2026-06-02',
    citations: 512,
  },
  {
    id: 'BCBS/D424',
    title: 'Principles for Operational Resilience & Risk Management',
    authority: 'Basel Committee',
    status: 'Active',
    date: '2026-03-10',
    citations: 870,
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()

  function handleSignOut() {
    navigate('/signin')
  }

  return (
    <div className="dashboard-layout">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <Link to="/" className="logo-wrap" aria-label="VeriRule home">
            <img src="/logo.svg" alt="VeriRule logo" className="logo-icon" />
            <span className="logo-name">
              Veri<span>Rule</span>
            </span>
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(79, 70, 229, 0.08)',
              color: 'var(--brand)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(79, 70, 229, 0.2)',
            }}
          >
            Workspace Pilot
          </span>
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-user-badge">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <span className="user-name">Alex Morgan</span>
              <span className="user-role">Risk & Compliance Officer</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body Container ────────────────────────────────────────────── */}
      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <a href="#overview" className="sidebar-nav-item active">
            <span className="sidebar-icon">📊</span>
            <span>Overview</span>
          </a>
          <a href="#circulars" className="sidebar-nav-item">
            <span className="sidebar-icon">📜</span>
            <span>Circulars & Rules</span>
          </a>
          <a href="#assistant" className="sidebar-nav-item">
            <span className="sidebar-icon">⚡</span>
            <span>AI Query Engine</span>
          </a>
          <a href="#audit" className="sidebar-nav-item">
            <span className="sidebar-icon">🛡️</span>
            <span>Audit Trail</span>
          </a>
          <a href="#settings" className="sidebar-nav-item">
            <span className="sidebar-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="dashboard-welcome">
            <h1>Compliance Intelligence Dashboard</h1>
            <p>
              Welcome back! Track active circulars, evidence-backed regulatory updates, and supersession rule trees.
            </p>
          </div>

          {/* Metric Cards */}
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

          {/* AI Query Assistant Preview Box */}
          <div className="dashboard-section-card">
            <h2 className="section-card-title">🔍 Quick AI Compliance Query</h2>
            <div className="search-demo-box">
              <input
                type="text"
                className="search-demo-input"
                placeholder="Ask a compliance question (e.g. 'What are the latest RBI digital payment security guidelines?')"
                readOnly
              />
              <button type="button" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Search Evidence
              </button>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              💡 All answers are generated with pinpoint citations to official circular sections and page numbers.
            </span>
          </div>

          {/* Recent Circulars Table */}
          <div className="dashboard-section-card">
            <h2 className="section-card-title">📜 Indexed Regulatory Circulars</h2>
            <div className="circulars-table-wrapper">
              <table className="circulars-table">
                <thead>
                  <tr>
                    <th>Circular ID</th>
                    <th>Title & Subject</th>
                    <th>Authority</th>
                    <th>Status</th>
                    <th>Ingestion Date</th>
                    <th>Citations</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCirculars.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.84rem' }}>{row.id}</td>
                      <td>{row.title}</td>
                      <td>{row.authority}</td>
                      <td>
                        <span
                          className={`badge-status ${
                            row.status === 'Active' ? 'badge-active' : 'badge-superseded'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{row.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--brand)' }}>{row.citations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
