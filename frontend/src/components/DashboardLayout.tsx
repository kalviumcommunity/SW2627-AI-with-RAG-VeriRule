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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const avatarInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  useEffect(() => {
    setSidebarOpen(false)
  }, [path])

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const ALL_PAGES = [
    { label: 'Overview Dashboard', path: '/dashboard', cat: 'Main', desc: 'Real-time compliance exposure & risk heatmap' },
    { label: 'Circulars & Master Directions', path: '/dashboard/circulars', cat: 'Main', desc: 'Indexed regulatory circulars & rule hierarchies' },
    { label: 'Rule Verifier & Conflict Resolver', path: '/dashboard/rule-verifier', cat: 'Governance', desc: 'Test transaction against active vs superseded rules' },
    { label: 'Regulatory Diff Engine', path: '/dashboard/diff-engine', cat: 'Governance', desc: 'Compare directive versions and department impact' },
    { label: 'Remediation & CAPA Workflow', path: '/dashboard/remediation', cat: 'Governance', desc: 'Assign corrective actions, track SLAs & sign-offs' },
    { label: 'Rule Supersession Timeline', path: '/dashboard/rule-timeline', cat: 'Governance', desc: 'Chronological timeline of regulatory evolution' },
    { label: 'Impact Analyzer & Gap Matrix', path: '/dashboard/impact-analyzer', cat: 'Governance', desc: 'Evaluate IT system impact & operational gaps' },
    { label: 'Compliance Simulator', path: '/dashboard/simulator', cat: 'Governance', desc: 'Interactive scenario testing & risk evaluation' },
    { label: 'Executive Compliance Reports', path: '/dashboard/reports', cat: 'Governance', desc: 'Generate formal audit packages & SHA-256 proofs' },
    { label: 'Audit Trail', path: '/dashboard/audit-trail', cat: 'Governance', desc: 'Verifiable audit log of queries & verifications' },
    { label: 'AI Query Engine', path: '/dashboard/query-engine', cat: 'Intelligence', desc: 'Natural language search with ChromaDB evidence' },
    { label: 'Compliance Chat Assistant', path: '/dashboard/chat', cat: 'Intelligence', desc: 'Real-time interactive AI compliance assistant' },
    { label: 'Document Repository', path: '/dashboard/documents', cat: 'Repository', desc: 'Ingest & manage PDF/text files in vector store' },
    { label: 'Analytics Dashboard', path: '/dashboard/analytics', cat: 'Analytics', desc: 'Quantitative metrics & compliance scorecards' },
    { label: 'Platform Settings', path: '/dashboard/settings', cat: 'Account', desc: 'User profile & confidence threshold preferences' },
  ]

  const filteredSearchPages = ALL_PAGES.filter(
    (p) =>
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sampleNotifications = [
    { id: '1', title: 'RBI Master Direction Updated', time: '10m ago', type: 'info', text: 'Master Direction RBI/2023-24/108 indexed into ChromaDB.' },
    { id: '2', title: 'CAPA SLA Warning', time: '1h ago', type: 'warning', text: 'CAPA-2026-001 (MFA Enforcement) due in 5 days.' },
    { id: '3', title: 'Audit Report Generated', time: '3h ago', type: 'success', text: 'Executive Compliance Summary package exported successfully.' },
  ]

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 800,
            }}>
              VR
            </div>
            <span>VeriRule</span>
          </Link>
        </div>

        {/* Global Search Bar (Triggers Command Palette) */}
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            flex: 1,
            maxWidth: '500px',
            display: 'flex',
            alignItems: 'center',
            background: '#F3F4F6',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <span style={{ color: '#6B7280', width: '18px', height: '18px', display: 'flex', flexShrink: 0 }}>
            {icons.search}
          </span>
          <span style={{ flex: 1, fontSize: '0.9rem', color: '#6B7280' }}>
            Search regulations, circulars, tools…
          </span>
          <kbd style={{
            fontSize: '0.7rem',
            background: '#E5E7EB',
            color: '#4B5563',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 600,
          }}>
            ⌘K
          </kbd>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4B5563',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: '8px',
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
              top: '6px',
              right: '6px',
            }} />
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '120px',
              width: '340px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              zIndex: 300,
              padding: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                <span className="enterprise-badge enterprise-badge-info">3 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sampleNotifications.map((n) => (
                  <div key={n.id} style={{ padding: '0.65rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                      <span>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{n.time}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* ── Command Palette Modal (Ctrl+K) ───────────────────────── */}
      {searchOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '8vh',
        }}
          onClick={() => setSearchOpen(false)}
        >
          <div style={{
            width: '100%',
            maxWidth: '620px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', gap: '0.75rem' }}>
              <span style={{ color: '#2563EB', width: 20, height: 20 }}>{icons.search}</span>
              <input
                type="text"
                autoFocus
                placeholder="Search regulations, circulars, tools or pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#0F172A',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', padding: '0.2rem 0.5rem', background: '#F1F5F9', borderRadius: 6 }}>ESC to close</span>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                Navigation & Tools ({filteredSearchPages.length})
              </div>
              {filteredSearchPages.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                  No matching regulatory sections found for "{searchQuery}".
                </div>
              ) : (
                filteredSearchPages.map((p) => (
                  <div
                    key={p.path}
                    onClick={() => {
                      navigate(p.path)
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 150ms ease',
                      marginBottom: '0.25rem',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>{p.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{p.desc}</div>
                    </div>
                    <span className="enterprise-badge enterprise-badge-neutral">{p.cat}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
