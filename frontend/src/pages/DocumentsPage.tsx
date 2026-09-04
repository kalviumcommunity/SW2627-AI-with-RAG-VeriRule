import { useCallback, useEffect, useState } from 'react'
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  fetchDocumentChunks,
  DocumentChunkReference,
  DocumentSummary,
} from '../services/documentService'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [authorityFilter, setAuthorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedDoc, setSelectedDoc] = useState<DocumentSummary | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [documentChunks, setDocumentChunks] = useState<DocumentChunkReference[]>([])
  const [chunksLoading, setChunksLoading] = useState(false)
  const [chunksError, setChunksError] = useState<string | null>(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDocuments({
        search: searchQuery.trim() || undefined,
        authority: authorityFilter !== 'All' ? authorityFilter : undefined,
      })
      setDocuments(data)
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }, [authorityFilter, searchQuery])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  useEffect(() => {
    if (!selectedDoc) {
      setDocumentChunks([])
      setChunksError(null)
      return
    }

    setChunksLoading(true)
    setChunksError(null)
    fetchDocumentChunks(selectedDoc.document_id)
      .then(setDocumentChunks)
      .catch(() => setChunksError('Unable to load indexed passages from the vector repository.'))
      .finally(() => setChunksLoading(false))
  }, [selectedDoc])

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)
    setUploadMessage(`Parsing, chunking, and embedding '${file.name}' into vector repository...`)

    try {
      const res = await uploadDocument(file)
      setUploadMessage(res.message)
      await loadDocs()
      setTimeout(() => setUploadMessage(null), 4000)
    } catch (err) {
      setUploadMessage('Document ingestion failed. Check backend service.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete document '${docId}' from vector repository?`)) {
      return
    }

    try {
      await deleteDocument(docId)
      await loadDocs()
      if (selectedDoc?.document_id === docId) {
        setSelectedDoc(null)
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const filteredDocs = documents.filter((doc) => {
    if (categoryFilter !== 'All' && doc.document_type !== categoryFilter) {
      return false
    }
    return true
  })

  return (
    <div className="documents-page">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="dashboard-welcome docs-heading">
        <div>
          <span className="eyebrow">Knowledge Base Architecture</span>
          <h1>Document Repository & Ingestion Pipeline</h1>
          <p>
            Ingest master directions, regulatory circulars, internal audit reports, and policy updates into Chroma DB vector store for grounded compliance queries.
          </p>
        </div>

        <div className="doc-header-stats">
          <div className="header-stat-chip">
            <span>Indexed Documents</span>
            <strong>{documents.length}</strong>
          </div>
          <div className="header-stat-chip">
            <span>Vector Chunks</span>
            <strong>{documents.reduce((acc, d) => acc + d.chunk_count, 0)}</strong>
          </div>
        </div>
      </div>

      {/* ── Drag & Drop Upload Zone ────────────────────────────────────── */}
      <div
        className={`dashboard-section-card upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="dropzone-inner">
          <div className="upload-icon">📥</div>
          <div className="upload-text">
            <h3>Drag & Drop Regulatory Files or Internal Audit Reports</h3>
            <p>Supports .pdf, .txt, .md, and .json files for automatic rule extraction & vector embedding.</p>
          </div>

          <label className="btn btn-primary btn-sm upload-btn">
            {isUploading ? 'Ingesting File...' : 'Browse Files to Upload'}
            <input
              type="file"
              accept=".txt,.pdf,.md,.json"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadMessage && (
          <div className="upload-progress-banner">
            <span className="pulse-dot" />
            <span>{uploadMessage}</span>
          </div>
        )}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div className="dashboard-section-card doc-filter-card">
        <div className="filter-row">
          <div className="category-pills">
            {[
              { id: 'All', label: 'All Sources' },
              { id: 'Master Direction', label: 'Master Directions' },
              { id: 'Circular', label: 'Circulars' },
              { id: 'Internal Audit Report', label: 'Internal Audit Reports' },
              { id: 'Regulatory Update', label: 'Regulatory Updates' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`pill-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <select
              className="audit-select"
              value={authorityFilter}
              onChange={(e) => setAuthorityFilter(e.target.value)}
              aria-label="Filter authority"
            >
              <option value="All">All Authorities</option>
              <option value="Reserve Bank of India">Reserve Bank of India</option>
              <option value="SEBI">SEBI</option>
              <option value="Basel Committee">Basel Committee</option>
              <option value="Internal Bank Audit Committee">Internal Bank Audit</option>
            </select>

            <div className="audit-search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="audit-search-input"
                placeholder="Search document repository..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Document Repository Table ───────────────────────────────── */}
      <div className="dashboard-section-card doc-table-card">
        <div className="audit-list-header">
          <h2>Document Inventory ({filteredDocs.length})</h2>
          <span className="live-indicator">
            <span className="pulse-dot" /> ChromaDB Vector Store Synchronized
          </span>
        </div>

        {loading ? (
          <div className="audit-loading-state">
            <div className="spinner" />
            <p>Loading document inventory...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="audit-empty-state">
            <div className="empty-icon">📜</div>
            <h3>No documents match your filters</h3>
            <p>Upload a new regulatory circular or reset your search query.</p>
          </div>
        ) : (
          <div className="circulars-table-wrapper">
            <table className="circulars-table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Title & Classification</th>
                  <th>Authority</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Chunks / Rules</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.document_id}
                    onClick={() => setSelectedDoc(doc)}
                    style={{ cursor: 'pointer' }}
                    className={selectedDoc?.document_id === doc.document_id ? 'selected-row' : ''}
                  >
                    <td style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#4f46e5' }}>
                      {doc.document_id}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{doc.title}</span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{doc.category}</span>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.84rem' }}>{doc.authority || 'N/A'}</td>

                    <td>
                      <span className="meta-tag doc-tag">{doc.document_type}</span>
                    </td>

                    <td>
                      <span className={`badge-status ${doc.status === 'active' ? 'badge-active' : 'badge-superseded'}`}>
                        {doc.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', display: 'flex', gap: '0.4rem' }}>
                        <span className="meta-tag latency-tag">{doc.chunk_count} chunks</span>
                        <span className="meta-tag section-tag">{doc.rules_count} rules</span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#dc2626' }}
                        onClick={(e) => handleDeleteDoc(doc.document_id, e)}
                        title="Delete from Vector Store"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Document Chunk & Vector Inspector Drawer ──────────────────── */}
      {selectedDoc && (
        <div className="audit-drawer-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="audit-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Vector Inspection Record</span>
                <h2>{selectedDoc.title}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className="audit-id-badge">{selectedDoc.document_id}</span>
                  <span className={`badge-status ${selectedDoc.status === 'active' ? 'badge-active' : 'badge-superseded'}`}>
                    {selectedDoc.status}
                  </span>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setSelectedDoc(null)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Document Metadata</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Authority</span>
                    <span className="detail-val">{selectedDoc.authority || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-val">{selectedDoc.document_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Effective Date</span>
                    <span className="detail-val">{selectedDoc.effective_date || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Version</span>
                    <span className="detail-val">{selectedDoc.version || '1.0'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vector Passages</span>
                    <span className="detail-val">{selectedDoc.chunk_count} chunks</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Extracted Rules</span>
                    <span className="detail-val">{selectedDoc.rules_count} active rules</span>
                  </div>
                </div>
              </div>

              {selectedDoc.supersedes_id && (
                <div className="drawer-section" style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <h4 style={{ color: '#b45309', margin: '0 0 0.25rem 0' }}>Supersession Lineage Link</h4>
                  <p style={{ color: '#92400e', fontSize: '0.84rem', margin: 0 }}>
                    This Master Direction automatically supersedes historical circular <strong>{selectedDoc.supersedes_id}</strong>.
                  </p>
                </div>
              )}

              <div className="drawer-section">
                <h4>Extracted Vector Passages</h4>
                {chunksLoading ? (
                  <div className="audit-loading-state"><div className="spinner" /><p>Loading indexed passages...</p></div>
                ) : chunksError ? (
                  <div className="audit-empty-state"><h3>Passages unavailable</h3><p>{chunksError}</p></div>
                ) : documentChunks.length === 0 ? (
                  <div className="audit-empty-state"><h3>No indexed passages</h3><p>This document has metadata but no stored vector chunks.</p></div>
                ) : (
                  documentChunks.map((chunk) => (
                    <div className="passage-box" style={{ marginBottom: '0.65rem' }} key={chunk.chunk_id}>
                      <strong>{chunk.chunk_id}</strong>
                      <p style={{ margin: '0.35rem 0 0' }}>{chunk.passage}</p>
                      <small>{chunk.section ? `Section ${chunk.section}` : 'Unsectioned'}{chunk.page ? ` · Page ${chunk.page}` : ''}</small>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#dc2626' }}
                onClick={(e) => handleDeleteDoc(selectedDoc.document_id, e)}
              >
                Remove from Vector Repository
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
