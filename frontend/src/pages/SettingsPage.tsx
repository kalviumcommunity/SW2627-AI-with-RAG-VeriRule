import { useState } from 'react'

const initialSettings = {
  displayName: 'Alex Morgan',
  email: 'alex.morgan@verirule.bank',
  role: 'Compliance Officer',
  answerStyle: 'concise',
  minimumConfidence: '0.75',
  includeHistorical: true,
  showEvidence: true,
  activeOnly: true,
  queryAlerts: true,
  ingestionAlerts: true,
  weeklyDigest: false,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(false)

  const updateSetting = <Key extends keyof typeof initialSettings>(key: Key, value: (typeof initialSettings)[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const saveSettings = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2800)
  }

  const resetSettings = () => {
    setSettings(initialSettings)
    setSaved(false)
  }

  return (
    <div className="settings-page">
      <div className="dashboard-welcome settings-heading">
        <div>
          <span className="eyebrow">Workspace controls</span>
          <h1>Settings</h1>
          <p>Manage your VeriRule workspace and the safeguards applied to compliance answers.</p>
        </div>
        {saved && <span className="settings-saved" role="status"><span>✓</span> Changes saved</span>}
      </div>

      <div className="settings-layout">
        <aside className="settings-nav" aria-label="Settings sections">
          <a href="#profile" className="settings-nav-item active">Profile</a>
          <a href="#query-preferences" className="settings-nav-item">Query preferences</a>
          <a href="#knowledge-base" className="settings-nav-item">Knowledge base</a>
          <a href="#notifications" className="settings-nav-item">Notifications</a>
        </aside>

        <div className="settings-sections">
          <section id="profile" className="dashboard-section-card settings-card">
            <div className="settings-card-heading"><div><h2>Profile</h2><p>Details shown across your compliance workspace.</p></div><div className="profile-avatar">AM</div></div>
            <div className="settings-form-grid">
              <label className="form-group"><span className="form-label">Display name</span><input className="form-input" value={settings.displayName} onChange={(event) => updateSetting('displayName', event.target.value)} /></label>
              <label className="form-group"><span className="form-label">Work email</span><input className="form-input" type="email" value={settings.email} onChange={(event) => updateSetting('email', event.target.value)} /></label>
              <label className="form-group"><span className="form-label">Role</span><input className="form-input" value={settings.role} disabled /></label>
              <div className="settings-readonly"><span className="form-label">Access level</span><span className="access-badge">Standard officer access</span><small>Managed by your organization administrator.</small></div>
            </div>
          </section>

          <section id="query-preferences" className="dashboard-section-card settings-card">
            <div className="settings-card-heading"><div><h2>Query preferences</h2><p>Set how the engine presents grounded compliance intelligence.</p></div><span className="settings-icon">⚡</span></div>
            <div className="settings-form-grid">
              <label className="form-group"><span className="form-label">Answer style</span><select className="form-input" value={settings.answerStyle} onChange={(event) => updateSetting('answerStyle', event.target.value)}><option value="concise">Concise and decision-ready</option><option value="detailed">Detailed with full context</option></select></label>
              <label className="form-group"><span className="form-label">Minimum confidence threshold</span><select className="form-input" value={settings.minimumConfidence} onChange={(event) => updateSetting('minimumConfidence', event.target.value)}><option value="0.6">60% · Exploratory</option><option value="0.75">75% · Recommended</option><option value="0.9">90% · Strict</option></select></label>
            </div>
            <div className="settings-toggles">
              <ToggleRow label="Always show source evidence" description="Keep document passages visible alongside every substantive answer." checked={settings.showEvidence} onChange={(value) => updateSetting('showEvidence', value)} />
              <ToggleRow label="Include historical context" description="Explain when a relevant rule has been superseded by a newer source." checked={settings.includeHistorical} onChange={(value) => updateSetting('includeHistorical', value)} />
            </div>
          </section>

          <section id="knowledge-base" className="dashboard-section-card settings-card">
            <div className="settings-card-heading"><div><h2>Knowledge base</h2><p>Control which approved sources can influence your answers.</p></div><span className="settings-icon">▣</span></div>
            <div className="knowledge-status"><span className="status-dot" /><div><strong>Knowledge base synchronized</strong><p>1,420 documents · Last indexed today at 09:15</p></div><span className="badge-status badge-active">Healthy</span></div>
            <div className="settings-toggles"><ToggleRow label="Prioritize active documents only" description="Exclude drafts and archived sources from authoritative retrieval." checked={settings.activeOnly} onChange={(value) => updateSetting('activeOnly', value)} /></div>
            <a className="settings-link" href="/dashboard/circulars">Manage circulars and document status <span>→</span></a>
          </section>

          <section id="notifications" className="dashboard-section-card settings-card">
            <div className="settings-card-heading"><div><h2>Notifications</h2><p>Choose which workspace events should reach your inbox.</p></div><span className="settings-icon">♧</span></div>
            <div className="settings-toggles">
              <ToggleRow label="Query review alerts" description="Notify me when a query needs manual review or has insufficient evidence." checked={settings.queryAlerts} onChange={(value) => updateSetting('queryAlerts', value)} />
              <ToggleRow label="Document ingestion updates" description="Notify me when a document finishes indexing or needs attention." checked={settings.ingestionAlerts} onChange={(value) => updateSetting('ingestionAlerts', value)} />
              <ToggleRow label="Weekly workspace digest" description="Receive a summary of searches, citations, and unresolved conflicts." checked={settings.weeklyDigest} onChange={(value) => updateSetting('weeklyDigest', value)} />
            </div>
          </section>

          <div className="settings-actions"><button type="button" className="btn btn-ghost" onClick={resetSettings}>Reset changes</button><button type="button" className="btn btn-primary" onClick={saveSettings}>Save settings <span aria-hidden="true">→</span></button></div>
        </div>
      </div>
    </div>
  )
}

interface ToggleRowProps { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="toggle-track" aria-hidden="true"><span /></span></label>
}