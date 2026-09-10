import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const initialPreferences = {
  answerStyle: 'concise',
  minimumConfidence: '0.75',
  includeHistorical: true,
  showEvidence: true,
  activeOnly: true,
  queryAlerts: true,
  ingestionAlerts: true,
  weeklyDigest: false,
}

const NAV_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'query-preferences', label: 'Query Preferences', icon: '⚡' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: '🗄️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [displayName, setDisplayName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [preferences, setPreferences] = useState(initialPreferences)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => {
    setDisplayName(user.name)
    setEmail(user.email)
  }, [user.name, user.email])

  const updatePreference = <Key extends keyof typeof initialPreferences>(
    key: Key,
    value: (typeof initialPreferences)[Key]
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const saveSettings = () => {
    updateUser({ name: displayName, email: email })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2800)
  }

  const resetSettings = () => {
    setDisplayName(user.name)
    setEmail(user.email)
    setPreferences(initialPreferences)
    setSaved(false)
  }

  const nameParts = displayName.trim().split(/\s+/)
  const initials = nameParts.length >= 2
    ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
    : displayName.charAt(0).toUpperCase() || 'U'

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* ── Enterprise Page Header ────────────────────────────────────────────── */}
      <div className="enterprise-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div className="enterprise-category-tag">
            <span>⚙️ SYSTEM &amp; ACCOUNT PREFERENCES</span>
          </div>
          <h1 className="enterprise-header-title">Platform Settings</h1>
          <p className="enterprise-header-subtitle">
            Manage your profile, AI model confidence thresholds, vector engine parameters, and notification channels.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saved && (
            <span className="enterprise-badge enterprise-badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              ✓ Changes Saved
            </span>
          )}
          <button type="button" onClick={saveSettings} className="enterprise-btn-primary">
            Save Preferences
          </button>
        </div>
      </div>

      {/* ── Layout: Sidebar Nav + Sections ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar Nav */}
        <nav style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.875rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: activeSection === section.id ? 600 : 500,
                color: activeSection === section.id ? '#2563EB' : '#64748B',
                textDecoration: 'none',
                transition: 'all 150ms ease',
                background: activeSection === section.id ? 'linear-gradient(90deg, rgba(77, 133, 255, 0.08), transparent)' : 'transparent',
                borderLeft: `3px solid ${activeSection === section.id ? '#4D85FF' : 'transparent'}`,
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{section.icon}</span>
              {section.label}
            </a>
          ))}
        </nav>

        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ── Profile ───────────────────────────────────────────────────────── */}
          <section id="profile" className="settings-form-card">
            <div className="settings-form-card-header">
              <div>
                <h2 className="settings-form-card-title">Profile</h2>
                <p className="settings-form-card-desc">Details shown across your compliance workspace.</p>
              </div>
              <div className="profile-avatar-premium">{initials}</div>
            </div>
            <div className="settings-form-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <label className="form-group">
                  <span className="form-label">Display name</span>
                  <input
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Work email</span>
                  <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Role</span>
                  <input className="form-input" value={user.role} disabled />
                </label>
                <div className="form-group">
                  <span className="form-label">Access Level</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <span className="enterprise-badge enterprise-badge-info">Standard Officer Access</span>
                  </div>
                  <small style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.35rem', display: 'block' }}>Managed by your organization administrator.</small>
                </div>
              </div>
            </div>
          </section>

          {/* ── Query Preferences ─────────────────────────────────────────────── */}
          <section id="query-preferences" className="settings-form-card">
            <div className="settings-form-card-header">
              <div>
                <h2 className="settings-form-card-title">Query Preferences</h2>
                <p className="settings-form-card-desc">Set how the AI engine presents compliance intelligence.</p>
              </div>
              <div className="settings-form-card-icon">⚡</div>
            </div>
            <div className="settings-form-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <label className="form-group">
                  <span className="form-label">Answer style</span>
                  <select className="form-input" value={preferences.answerStyle} onChange={(e) => updatePreference('answerStyle', e.target.value)}>
                    <option value="concise">Concise and decision-ready</option>
                    <option value="detailed">Detailed with full context</option>
                  </select>
                </label>
                <label className="form-group">
                  <span className="form-label">Minimum confidence threshold</span>
                  <select className="form-input" value={preferences.minimumConfidence} onChange={(e) => updatePreference('minimumConfidence', e.target.value)}>
                    <option value="0.6">60% · Exploratory</option>
                    <option value="0.75">75% · Recommended</option>
                    <option value="0.9">90% · Strict</option>
                  </select>
                </label>
              </div>
              <div>
                <PremiumToggle label="Always show source evidence" description="Keep document passages visible alongside every substantive answer." checked={preferences.showEvidence} onChange={(v) => updatePreference('showEvidence', v)} />
                <PremiumToggle label="Include historical context" description="Explain when a relevant rule has been superseded by a newer source." checked={preferences.includeHistorical} onChange={(v) => updatePreference('includeHistorical', v)} />
              </div>
            </div>
          </section>

          {/* ── Knowledge Base ────────────────────────────────────────────────── */}
          <section id="knowledge-base" className="settings-form-card">
            <div className="settings-form-card-header">
              <div>
                <h2 className="settings-form-card-title">Knowledge Base</h2>
                <p className="settings-form-card-desc">Control which approved sources can influence answers.</p>
              </div>
              <div className="settings-form-card-icon">🗄️</div>
            </div>
            <div className="settings-form-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', flexShrink: 0, boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: '#064E3B', display: 'block' }}>Knowledge base synchronized</strong>
                  <span style={{ fontSize: '0.8rem', color: '#065F46' }}>1,420 documents · Last indexed today at 09:15</span>
                </div>
                <span className="enterprise-badge enterprise-badge-success">Healthy</span>
              </div>
              <PremiumToggle label="Prioritize active documents only" description="Exclude drafts and archived sources from authoritative retrieval." checked={preferences.activeOnly} onChange={(v) => updatePreference('activeOnly', v)} />
              <a className="enterprise-btn-outline" href="/dashboard/circulars" style={{ marginTop: '1.25rem', display: 'inline-flex', fontSize: '0.85rem' }}>
                Manage circulars and document status →
              </a>
            </div>
          </section>

          {/* ── Notifications ─────────────────────────────────────────────────── */}
          <section id="notifications" className="settings-form-card">
            <div className="settings-form-card-header">
              <div>
                <h2 className="settings-form-card-title">Notifications</h2>
                <p className="settings-form-card-desc">Choose which workspace events reach your inbox.</p>
              </div>
              <div className="settings-form-card-icon">🔔</div>
            </div>
            <div className="settings-form-card-body">
              <PremiumToggle label="Query review alerts" description="Notify me when a query needs manual review or has insufficient evidence." checked={preferences.queryAlerts} onChange={(v) => updatePreference('queryAlerts', v)} />
              <PremiumToggle label="Document ingestion updates" description="Notify me when a document finishes indexing or needs attention." checked={preferences.ingestionAlerts} onChange={(v) => updatePreference('ingestionAlerts', v)} />
              <PremiumToggle label="Weekly workspace digest" description="Receive a summary of searches, citations, and unresolved conflicts." checked={preferences.weeklyDigest} onChange={(v) => updatePreference('weeklyDigest', v)} />
            </div>
          </section>

          {/* ── Actions ───────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="enterprise-btn-secondary" onClick={resetSettings}>Reset Changes</button>
            <button type="button" className="enterprise-btn-primary" onClick={saveSettings}>
              Save Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PremiumToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function PremiumToggle({ label, description, checked, onChange }: PremiumToggleProps) {
  return (
    <div className="toggle-row-premium">
      <div className="toggle-row-premium-info">
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-track-premium" />
      </label>
    </div>
  )
}