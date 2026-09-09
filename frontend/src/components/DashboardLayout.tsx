import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

/* ─── Inline SVG Icons ─────────────────────────────────────────────────── */
const icons = {
  overview:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  circulars:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  verifier:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  diff:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  remediation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  timeline:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  impact:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  simulator:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  reports:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="18" y1="21" x2="6" y2="21"/><line x1="12" y1="17" x2="6" y2="17"/><line x1="18" y1="13" x2="6" y2="13"/></svg>,
  audit:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  query:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chat:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  documents:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  analytics:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

interface NavItem {
  to: string
  label: string
  icon: JSX.Element
  badge?: string
  badgeColor?: string
  exact?: boolean
}

const MAIN_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: icons.overview, exact: true },
  { to: '/dashboard/circulars', label: 'Circulars & Rules', icon: icons.circulars, badge: '5' },
]

const GOVERNANCE_NAV: NavItem[] = [
  { to: '/dashboard/rule-verifier', label: 'Rule Verifier', icon: icons.verifier },
  { to: '/dashboard/diff-engine', label: 'Regulatory Diff', icon: icons.diff, badge: 'New', badgeColor: 'green' },
  { to: '/dashboard/remediation', label: 'Remediation & CAPA', icon: icons.remediation, badge: 'New', badgeColor: 'green' },
  { to: '/dashboard/rule-timeline', label: 'Rule Timeline', icon: icons.timeline },
  { to: '/dashboard/impact-analyzer', label: 'Impact Analyzer', icon: icons.impact, badge: 'New', badgeColor: 'blue' },
  { to: '/dashboard/simulator', label: 'Compliance Simulator', icon: icons.simulator },
  { to: '/dashboard/reports', label: 'Compliance Reports', icon: icons.reports, badge: 'New', badgeColor: 'green' },
  { to: '/dashboard/audit-trail', label: 'Audit Trail', icon: icons.audit },
  { to: '/dashboard/query-engine', label: 'AI Query Engine', icon: icons.query },
  { to: '/dashboard/chat', label: 'Compliance Chat', icon: icons.chat, badge: 'New', badgeColor: 'violet' },
  { to: '/dashboard/documents', label: 'Document Repository', icon: icons.documents },
]

const ANALYTICS_NAV: NavItem[] = [
  { to: '/dashboard/analytics', label: 'Analytics Dashboard', icon: icons.analytics, badge: 'New', badgeColor: 'green' },
]

function NavLink({ item, path }: { item: NavItem; path: string }) {
  const isActive = item.exact
    ? path === item.to || path === item.to + '/'
    : path.startsWith(item.to)

  const badgeClass =
    item.badgeColor === 'green' ? 'sidebar-badge-green'
    : item.badgeColor === 'blue' ? 'sidebar-badge-blue'
    : item.badgeColor === 'violet' ? 'sidebar-badge-violet'
    : 'sidebar-badge-gray'

  return (
    <Link
      to={item.to}
      className={`sidebar-nav-item${isActive ? ' active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="sidebar-nav-left">
        <span className="sidebar-icon">{item.icon}</span>
        <span className="sidebar-label">{item.label}</span>
      </div>
      {item.badge && (
        <span className={`sidebar-badge ${badgeClass}`}>{item.badge}</span>
      )}
    </Link>
  )
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const avatarInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  useEffect(() => {
    setSidebarOpen(false)
  }, [path])

  return (
    <div className="dashboard-layout">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button
            type="button"
            className={`dashboard-menu-toggle ${sidebarOpen ? 'is-open' : ''}`}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? icons.close : icons.menu}
          </button>

          <Link to="/" className="logo-wrap" aria-label="VeriRule home">
            <img src="/logo.svg" alt="VeriRule logo" className="logo-icon" />
            <span className="logo-name">
              Veri<span>Rule</span>
            </span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="header-search-wrap">
          <span className="header-search-icon">{icons.search}</span>
          <input
            type="search"
            className="header-search-input"
            placeholder="Search regulations, circulars, rules…"
            aria-label="Global search"
          />
          <kbd className="header-search-kbd">⌘K</kbd>
        </div>

        <div className="dashboard-header-right">
          {/* Notification bell */}
          <button type="button" className="header-icon-btn" aria-label="Notifications">
            {icons.bell}
            <span className="notif-dot" aria-hidden="true" />
          </button>

          {/* User badge */}
          <div className="dashboard-user-badge">
            <div className="user-avatar" aria-hidden="true">{avatarInitial}</div>
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

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="dashboard-body">
        {/* Scrim overlay */}
        <button
          type="button"
          className={`sidebar-scrim${sidebarOpen ? ' visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />

        {/* Sidebar */}
        <aside className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Navigation">
          <div className="sidebar-scroll">

            <div className="sidebar-group-label">Main</div>
            {MAIN_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}

            <div className="sidebar-group-label">Governance</div>
            {GOVERNANCE_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}

            <div className="sidebar-group-label">Analytics</div>
            {ANALYTICS_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <Link
              to="/dashboard/settings"
              className={`sidebar-nav-item${path.startsWith('/dashboard/settings') ? ' active' : ''}`}
            >
              <div className="sidebar-nav-left">
                <span className="sidebar-icon">{icons.settings}</span>
                <span className="sidebar-label">Settings</span>
              </div>
            </Link>
            <button type="button" className="sidebar-nav-item sidebar-logout-btn" onClick={handleSignOut}>
              <div className="sidebar-nav-left">
                <span className="sidebar-icon">{icons.logout}</span>
                <span className="sidebar-label">Sign Out</span>
              </div>
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
