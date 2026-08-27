import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const { user, logout } = useAuth()

  const avatarInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="dashboard-layout">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <Link to="/" className="logo-wrap" aria-label="VeriRule home">
            <img src="/logo.svg" alt="VeriRule logo" className="logo-icon" />
            <span className="logo-name">
              Veri<span>Rule</span>
            </span>
          </Link>
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-user-badge">
            <div className="user-avatar">{avatarInitial}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary btn-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="dashboard-body">
        <aside className="dashboard-sidebar" aria-label="Navigation">
          <div className="sidebar-group-label">Main</div>

          <Link
            to="/dashboard"
            className={`sidebar-nav-item ${path === '/dashboard' || path === '/dashboard/' ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">📊</span>
              <span>Overview</span>
            </div>
          </Link>

          <Link
            to="/dashboard/circulars"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/circulars') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">📜</span>
              <span>Circulars & Rules</span>
            </div>
            <span className="sidebar-badge">5</span>
          </Link>

          <div className="sidebar-group-label">Governance</div>

          <Link
            to="/dashboard/rule-verifier"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/rule-verifier') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">🎯</span>
              <span>Rule Verifier</span>
            </div>
            <span className="sidebar-badge" style={{ background: '#dcfce7', color: '#15803d' }}>New</span>
          </Link>

          <Link
            to="/dashboard/rule-timeline"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/rule-timeline') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">📅</span>
              <span>Rule Timeline</span>
            </div>
          </Link>

          <Link
            to="/dashboard/audit-trail"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/audit-trail') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">🛡️</span>
              <span>Audit Trail</span>
            </div>
          </Link>

          <Link
            to="/dashboard/query-engine"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/query-engine') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">⚡</span>
              <span>AI Query Engine</span>
            </div>
          </Link>

          <div className="sidebar-group-label">System</div>

          <Link
            to="/dashboard/documents"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/documents') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">📁</span>
              <span>Document Repository</span>
            </div>
          </Link>

          <Link
            to="/dashboard/settings"
            className={`sidebar-nav-item ${path.startsWith('/dashboard/settings') ? 'active' : ''}`}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-icon">⚙️</span>
              <span>Settings</span>
            </div>
          </Link>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
