import { useState } from 'react'

interface CircularRule {
  section: string
  title: string
  detail: string
}

interface Circular {
  id: string
  title: string
  authority: 'Reserve Bank of India' | 'SEBI' | 'Basel Committee' | 'IRDAI'
  status: 'Active' | 'Superseded'
  date: string
  citations: number
  supersedesId?: string
  category: string
  rules: CircularRule[]
  documentText: string
}

const authenticCirculars: Circular[] = [
  {
    id: 'RBI/2023-24/108',
    title: 'Master Direction on Cyber Security Framework for Financial Entities',
    authority: 'Reserve Bank of India',
    status: 'Active',
    date: '2023-11-07',
    citations: 412,
    supersedesId: 'RBI/2016-17/38',
    category: 'Cyber Security & IT Risk',
    rules: [
      { section: 'Section 3.1.2', title: '24x7 Security Operations Centre (SOC)', detail: 'Entities must maintain round-the-clock SOC capability for continuous threat detection and event correlation.' },
      { section: 'Section 5.2.0', title: 'Privileged Access Multi-Factor Authentication', detail: 'Requires hardware-based or cryptographic MFA for all core administrative and database access.' },
    ],
    documentText: 'Official Master Direction published by the Reserve Bank of India (Department of Supervision). Regulated entities shall enforce continuous 24x7 SOC monitoring and hardware-backed multi-factor authentication for core banking administrative functions.',
  },
  {
    id: 'RBI/2021-22/15',
    title: 'Master Direction – Digital Payment Security Controls in Banks',
    authority: 'Reserve Bank of India',
    status: 'Active',
    date: '2021-02-18',
    citations: 328,
    category: 'Digital Payments',
    rules: [
      { section: 'Section 4.1.1', title: 'Dynamic OTP & Transaction Binding', detail: 'Authentication tokens must dynamically tie the OTP to specific beneficiary account details and payment amount.' },
      { section: 'Section 7.3.0', title: 'Beneficiary Cooling Period', detail: 'Enforces mandatory 2-hour transfer limit cooling period for newly added payment beneficiaries.' },
    ],
    documentText: 'Master Direction RBI/2021-22/15 issued by RBI for digital payment channels. Banks shall implement dynamic OTP binding and mandatory cooling-off limits for online fund transfers.',
  },
  {
    id: 'SEBI/HO/MIRSD/2022/101',
    title: 'Framework for Cyber Security and Cyber Resilience for Stock Brokers',
    authority: 'SEBI',
    status: 'Active',
    date: '2022-07-20',
    citations: 512,
    category: 'Market Infrastructure',
    rules: [
      { section: 'Section 2.4.1', title: 'Biometric & Liveness Client Verification', detail: 'Stock brokers must integrate liveness detection for electronic client onboarding and trade authorization.' },
      { section: 'Section 6.2.0', title: '7-Year WORM Audit Storage', detail: 'Authentication and order logs must be stored in Write-Once-Read-Many (WORM) media for 7 years.' },
    ],
    documentText: 'Master Circular issued by Securities and Exchange Board of India. Regulated stock brokers and depositories shall archive raw system access logs in immutable WORM storage for a minimum period of 7 years.',
  },
  {
    id: 'BCBS/D516',
    title: 'Principles for Operational Resilience in Commercial Banks',
    authority: 'Basel Committee',
    status: 'Active',
    date: '2021-03-31',
    citations: 870,
    category: 'Capital & Risk Governance',
    rules: [
      { section: 'Principle 4', title: 'ICT Outage Capital Allocation', detail: 'Pillar 2 capital assessment must incorporate cyber operational outage and recovery scenarios.' },
    ],
    documentText: 'Global standards released by Basel Committee on Banking Supervision (BCBS). Mandates operational resilience metrics and business continuity testing across critical clearing services.',
  },
  {
    id: 'RBI/2016-17/38',
    title: 'Cyber Security Framework in Banks (Baseline Guidance)',
    authority: 'Reserve Bank of India',
    status: 'Superseded',
    date: '2016-06-02',
    citations: 189,
    category: 'Legacy Cyber Guidelines',
    rules: [
      { section: 'Section 2.1', title: 'Baseline Password Policy (Superseded)', detail: 'Initial baseline password complexity standards (Superseded by Master Direction RBI/2023-24/108).' },
    ],
    documentText: 'Legacy baseline circular issued by RBI in June 2016. Baseline IT risk controls superseded by Master Direction RBI/2023-24/108.',
  },
]

export default function CircularsPage() {
  const [circularList, setCircularList] = useState<Circular[]>(authenticCirculars)
  const [searchQuery, setSearchQuery] = useState('')
  const [authorityFilter, setAuthorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [uploadForm, setUploadForm] = useState({
    id: '', title: '',
    authority: 'Reserve Bank of India' as Circular['authority'],
    date: '', category: 'Cyber Security & IT Risk', supersedesId: '',
  })

  function triggerToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadForm.id.trim() || !uploadForm.title.trim()) return

    const nc: Circular = {
      id: uploadForm.id.trim(), title: uploadForm.title.trim(),
      authority: uploadForm.authority, status: 'Active', date: uploadForm.date || new Date().toISOString().split('T')[0],
      citations: 0, supersedesId: uploadForm.supersedesId.trim() || undefined, category: uploadForm.category,
      rules: [{ section: 'Section 1.0', title: 'General Mandate', detail: 'Policy rules extracted by RAG engine.' }],
      documentText: `Ingested: ${uploadForm.title}. Authority: ${uploadForm.authority}.`,
    }
    setCircularList((prev) => [nc, ...prev])
    setShowUploadModal(false)
    setUploadForm({ id: '', title: '', authority: 'Reserve Bank of India', date: '', category: 'Cyber Security & IT Risk', supersedesId: '' })
    triggerToast(`Circular ${nc.id} indexed successfully.`)
  }

  const filtered = circularList.filter((c) => {
    const q = searchQuery.toLowerCase()
    const matchSearch = c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    const matchAuth = authorityFilter === 'All' || c.authority === authorityFilter
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchAuth && matchStatus
  })

  const activeCount = circularList.filter((c) => c.status === 'Active').length
  const supersededCount = circularList.filter((c) => c.status === 'Superseded').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 72, right: 24, background: '#047857', color: '#fff',
          padding: '0.7rem 1.1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 8px 20px rgba(4,120,87,0.25)', zIndex: 999,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <h1>Circulars & Rules</h1>
        <p>Browse indexed regulatory circulars, inspect rule hierarchies, and track supersession links.</p>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Indexed</span>
            <div className="metric-icon-wrap">📜</div>
          </div>
          <div className="metric-value">{circularList.length}</div>
          <div className="metric-sub">In RAG vector store</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active</span>
            <div className="metric-icon-wrap">✓</div>
          </div>
          <div className="metric-value">{activeCount}</div>
          <div className="metric-sub">Currently enforced</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Superseded</span>
            <div className="metric-icon-wrap">⚡</div>
          </div>
          <div className="metric-value">{supersededCount}</div>
          <div className="metric-sub" style={{ color: '#b45309' }}>Replaced by newer rules</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Citations</span>
            <div className="metric-icon-wrap">🔍</div>
          </div>
          <div className="metric-value">{circularList.reduce((a, c) => a + c.citations, 0).toLocaleString()}</div>
          <div className="metric-sub">Source-verified</div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap', minWidth: 260 }}>
            <input
              type="text" className="form-input" style={{ flex: 1, minWidth: 200 }}
              placeholder="Search circulars..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="form-input" style={{ width: 'auto' }} value={authorityFilter} onChange={(e) => setAuthorityFilter(e.target.value)}>
              <option value="All">All Authorities</option>
              <option value="Reserve Bank of India">RBI</option>
              <option value="SEBI">SEBI</option>
              <option value="Basel Committee">Basel Committee</option>
              <option value="IRDAI">IRDAI</option>
            </select>
            <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Superseded">Superseded</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ display: 'flex', border: '1px solid #eaecf0', borderRadius: '8px', overflow: 'hidden' }}>
              <button type="button" className="btn btn-sm"
                style={{ borderRadius: 0, background: viewMode === 'table' ? '#4f46e5' : '#fff', color: viewMode === 'table' ? '#fff' : 'var(--text-muted)', border: 'none' }}
                onClick={() => setViewMode('table')}>
                ☰ Table
              </button>
              <button type="button" className="btn btn-sm"
                style={{ borderRadius: 0, background: viewMode === 'cards' ? '#4f46e5' : '#fff', color: viewMode === 'cards' ? '#fff' : 'var(--text-muted)', border: 'none' }}
                onClick={() => setViewMode('cards')}>
                ⊞ Cards
              </button>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
              + Upload Circular
            </button>
          </div>
        </div>
      </div>

      {/* ── Table View ───────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="dashboard-section-card" style={{ marginBottom: 0 }}>
          <div className="circulars-table-wrapper">
            <table className="circulars-table">
              <thead>
                <tr>
                  <th>Circular ID</th>
                  <th>Title</th>
                  <th>Authority</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem', color: '#4f46e5' }}>{row.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{row.title}</div>
                      {row.supersedesId && (
                        <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: 2 }}>
                          Replaces {row.supersedesId}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.authority}</td>
                    <td>
                      <span style={{ fontSize: '0.76rem', background: '#f5f6fa', padding: '0.15rem 0.5rem', borderRadius: '999px', color: 'var(--text-muted)' }}>
                        {row.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${row.status === 'Active' ? 'badge-active' : 'badge-superseded'}`}>{row.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{row.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedCircular(row)}>
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No circulars match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card View ────────────────────────────────────────────────── */}
      {viewMode === 'cards' && (
        <div className="citations-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filtered.map((c) => (
            <div key={c.id} className="citation-card" style={{ padding: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5', fontSize: '0.85rem' }}>{c.id}</span>
                  <span className={`badge-status ${c.status === 'Active' ? 'badge-active' : 'badge-superseded'}`}>{c.status}</span>
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', lineHeight: 1.4 }}>{c.title}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  {c.authority} · {c.date}
                </div>
                {c.supersedesId && (
                  <div style={{ fontSize: '0.76rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.35rem 0.55rem', borderRadius: '6px', marginBottom: '0.6rem' }}>
                    Replaces: <strong>{c.supersedesId}</strong>
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f9fafb', padding: '0.5rem', borderRadius: '6px', border: '1px solid #eaecf0' }}>
                  <strong>{c.rules.length} rule{c.rules.length > 1 ? 's' : ''} extracted</strong>
                  <ul style={{ paddingLeft: '1rem', marginTop: '0.2rem' }}>
                    {c.rules.map((r) => <li key={r.section} style={{ fontSize: '0.78rem' }}>{r.section}: {r.title}</li>)}
                  </ul>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.85rem' }}
                onClick={() => setSelectedCircular(c)}>
                Inspect Rules →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload Modal ─────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upload New Circular</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUploadSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Circular ID *</label>
                <input type="text" className="form-input" placeholder="e.g. RBI/2026-27/105" value={uploadForm.id}
                  onChange={(e) => setUploadForm({ ...uploadForm, id: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Master Direction on Liquidity Coverage" value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Authority</label>
                  <select className="form-input" value={uploadForm.authority}
                    onChange={(e) => setUploadForm({ ...uploadForm, authority: e.target.value as Circular['authority'] })}>
                    <option value="Reserve Bank of India">RBI</option>
                    <option value="SEBI">SEBI</option>
                    <option value="Basel Committee">Basel Committee</option>
                    <option value="IRDAI">IRDAI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Effective Date</label>
                  <input type="date" className="form-input" value={uploadForm.date}
                    onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Supersedes Circular ID (optional)</label>
                <input type="text" className="form-input" placeholder="Leave blank if standalone" value={uploadForm.supersedesId}
                  onChange={(e) => setUploadForm({ ...uploadForm, supersedesId: e.target.value })} />
              </div>
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', background: '#f9fafb', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>📁</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Drag PDF here or click to browse</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Automatic metadata tagging and vector chunking</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Index Circular</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Inspect Modal ────────────────────────────────────────────── */}
      {selectedCircular && (
        <div className="modal-backdrop" onClick={() => setSelectedCircular(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`badge-status ${selectedCircular.status === 'Active' ? 'badge-active' : 'badge-superseded'}`} style={{ marginBottom: '0.25rem' }}>
                  {selectedCircular.status}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {selectedCircular.id} — {selectedCircular.title}
                </h3>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedCircular(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Supersession Tree */}
              <div style={{ background: '#f9fafb', border: '1px solid #eaecf0', borderRadius: '10px', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.7rem' }}>
                  Supersession Hierarchy
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ background: '#fff', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#047857', fontSize: '0.85rem' }}>{selectedCircular.id}</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, marginTop: 2 }}>{selectedCircular.title}</div>
                    </div>
                    <span className="badge-status badge-active">Active</span>
                  </div>
                  {selectedCircular.supersedesId && (
                    <>
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>↓ supersedes</div>
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#92400e', fontSize: '0.85rem' }}>{selectedCircular.supersedesId}</span>
                          <div style={{ fontSize: '0.82rem', color: '#78350f', marginTop: 2 }}>Legacy provisions</div>
                        </div>
                        <span className="badge-status badge-superseded">Superseded</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rules */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Extracted Compliance Mandates ({selectedCircular.rules.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedCircular.rules.map((rule) => (
                    <div key={rule.section} style={{ background: '#fff', border: '1px solid #eaecf0', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#4f46e5', marginBottom: 2 }}>{rule.section} — {rule.title}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{rule.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Text */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Document Excerpt
                </div>
                <div style={{ background: '#f9fafb', padding: '0.9rem', borderRadius: '8px', border: '1px solid #eaecf0', fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  {selectedCircular.documentText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
