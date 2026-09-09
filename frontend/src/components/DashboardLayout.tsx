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

  return (
    <Link
      to={item.to}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: isActive ? '#4D85FF' : '#4B5563',
        textDecoration: 'none',
        background: isActive ? 'rgba(77, 133, 255, 0.1)' : 'transparent',
        transition: 'all 150ms ease',
        position: 'relative',
        margin: '0.25rem 0',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#F3F4F6';
          e.currentTarget.style.color = '#111827';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#4B5563';
        }
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ width: '18px', height: '18px', display: 'flex', flexShrink: 0 }}>
          {item.icon}
        </span>
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span style={{
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: 700,
          background: item.badgeColor === 'green' ? 'rgba(16, 185, 129, 0.1)'
            : item.badgeColor === 'blue' ? 'rgba(59, 130, 246, 0.1)'
            : item.badgeColor === 'violet' ? 'rgba(124, 58, 237, 0.1)'
            : 'rgba(77, 133, 255, 0.1)',
          color: item.badgeColor === 'green' ? '#10B981'
            : item.badgeColor === 'blue' ? '#3B82F6'
            : item.badgeColor === 'violet' ? '#7C3AED'
            : '#4D85FF',
        }}>
          {item.badge}
        </span>
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#F9FAFB',
    }}>

      {/* ── Professional Header ────────────────────────────────── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#374151',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
            }}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? icons.close : icons.menu}
          </button>

          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#111827',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #4D85FF, #14B8A6)',
              borderRadius: '8px',
            }} />
            <span>VeriRule</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: '500px',
          display: 'flex',
          alignItems: 'center',
          background: '#F3F4F6',
          border: '1.5px solid #E5E7EB',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          gap: '0.5rem',
        }}>
          <span style={{ color: '#6B7280', width: '18px', height: '18px', display: 'flex', flexShrink: 0 }}>
            {icons.search}
          </span>
          <input
            type="search"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#111827',
            }}
            placeholder="Search regulations…"
            aria-label="Global search"
          />
          <kbd style={{
            fontSize: '0.7rem',
            background: '#E5E7EB',
            color: '#4B5563',
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 600,
          }}>
            ⌘K
          </kbd>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Notification Bell */}
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4B5563',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '0.5rem',
            }}
            aria-label="Notifications"
          >
            {icons.bell}
            <span style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: '#10B981',
              borderRadius: '50%',
              top: '4px',
              right: '2px',
            }} />
          </button>

          {/* User Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingRight: '1rem',
            borderRight: '1px solid #E5E7EB',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #4D85FF, #7C3AED)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}>
              {avatarInitial}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{user.role}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: 'white',
              border: '1.5px solid #E5E7EB',
              color: '#374151',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Overlay */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            display: sidebarOpen ? 'block' : 'none',
            cursor: 'pointer',
            border: 'none',
          }}
          aria-label="Close navigation menu"
        />

        {/* Sidebar */}
        <aside style={{
          width: '280px',
          background: 'white',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms ease',
        }}>
          <nav style={{ flex: 1, padding: '1.5rem 0.75rem', overflow: 'auto' }}>
            {/* Main Navigation Group */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 1rem',
                marginBottom: '0.75rem',
              }}>
                Main
              </div>
              {MAIN_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}
            </div>

            {/* Governance Group */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 1rem',
                marginBottom: '0.75rem',
              }}>
                Governance & Compliance
              </div>
              {GOVERNANCE_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}
            </div>

            {/* Analytics Group */}
            <div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 1rem',
                marginBottom: '0.75rem',
              }}>
                Analytics & Reporting
              </div>
              {ANALYTICS_NAV.map((item) => <NavLink key={item.to} item={item} path={path} />)}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid #E5E7EB',
            background: '#FAFBFC',
          }}>
            <Link
              to="/dashboard/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#4B5563',
                textDecoration: 'none',
                transition: 'all 150ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              <span style={{ width: '18px', height: '18px', display: 'flex' }}>{icons.settings}</span>
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#4B5563',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2';
                e.currentTarget.style.color = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              <span style={{ width: '18px', height: '18px', display: 'flex' }}>{icons.logout}</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : 0,
          overflow: 'auto',
          transition: 'margin-left 250ms ease',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
