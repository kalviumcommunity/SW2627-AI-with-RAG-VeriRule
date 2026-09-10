import { FormEvent, useEffect, useState } from 'react'
import { submitQuery, QueryResponse } from '../services/queryService'

const starterQuestions = [
  'What KYC requirement currently applies to high-value cash transactions?',
  'Which cyber security controls govern our payment infrastructure?',
  'What evidence is required before onboarding a high-risk customer?',
]

interface HistoryItem {
  id: string
  question: string
  timestamp: string
  status: string
  answerSnippet: string
}

const STORAGE_KEY = 'verirule_query_history_v1'

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: 'h-1',
    question: 'Which cyber security controls govern our payment infrastructure?',
    timestamp: 'Today, 10:42',
    status: 'active_rule_verified',
    answerSnippet: 'Master Direction RBI/2023-24/108 Section 3.1.2 mandates 24x7 SOC continuous telemetry...',
  },
  {
    id: 'h-2',
    question: 'What evidence is required before onboarding a high-risk customer?',
    timestamp: 'Yesterday, 16:18',
    status: 'active_rule_verified',
    answerSnippet: 'Enhanced Due Diligence (EDD) with beneficial ownership verification required.',
  },
]

export default function QueryEnginePage() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      } else {
        setHistory(DEFAULT_HISTORY)
      }
    } catch {
      setHistory(DEFAULT_HISTORY)
    }
  }, [])

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) return

    setIsSearching(true)
    setError('')
    try {
      const response = await submitQuery(question.trim())
      setResult(response)

      const now = new Date()
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      const newItem: HistoryItem = {
        id: `h-${Date.now()}`,
        question: question.trim(),
        timestamp: `Today, ${timeStr}`,
        status: response.status,
        answerSnippet: response.answer.substring(0, 90) + '...',
      }

      const updated = [newItem, ...history.filter((h) => h.question !== question.trim())].slice(0, 10)
      saveHistory(updated)
    } catch {
      setError('The query service is unavailable. Check that the backend is running and try again.')
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectHistory = (q: string) => {
    setQuestion(q)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* ── Enterprise Page Header ────────────────────────────────────────────── */}
      <div className="enterprise-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="enterprise-category-tag">
            <span>🔍 GROUNDED RAG INTELLIGENCE</span>
          </div>
          <h1 className="enterprise-header-title">AI Compliance Query Engine</h1>
          <p className="enterprise-header-subtitle">
            Ask complex natural language compliance questions and get source-cited, ChromaDB-grounded answers with supersession detection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="enterprise-badge enterprise-badge-success">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            ChromaDB Vector Engine Online
          </span>
        </div>
      </div>

      {/* ── Search Box ───────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="qe-search-box">
          <label className="qe-label" htmlFor="compliance-question">What do you need to verify?</label>
          <textarea
            id="compliance-question"
            className="qe-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What rule currently applies to a high-value cash transaction over ₹10 lakhs?"
            rows={3}
          />
          <div className="qe-footer">
            <span className="qe-hint">🔒 Answers grounded in indexed circulars, policies & regulatory updates</span>
            <button type="submit" className="qe-submit-btn" disabled={isSearching || !question.trim()}>
              {isSearching ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Searching...
                </>
              ) : (
                <>Run Compliance Search →</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Starter Pills ─────────────────────────────────────────────────────── */}
      <div className="qe-pills" style={{ marginBottom: '2rem' }}>
        <span className="qe-pill-label">Try</span>
        {starterQuestions.map((q) => (
          <button key={q} type="button" className="qe-pill" onClick={() => setQuestion(q)}>
            {q.length > 55 ? q.slice(0, 55) + '…' : q}
          </button>
        ))}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="enterprise-callout-warning animate-in" role="alert" style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.9rem', color: '#991B1B' }}>⚠ Service Unavailable</strong>
          <p style={{ fontSize: '0.85rem', color: '#7F1D1D', marginTop: '0.3rem' }}>{error}</p>
        </div>
      )}

      {/* ── Empty state / Results ─────────────────────────────────────────────── */}
      {!result ? (
        <div className="panel-card animate-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>⌕</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            Your evidence-backed answer will appear here
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 480, margin: '0 auto' }}>
            VeriRule prioritizes active rules, identifies superseded guidance, and shows passages supporting its conclusion.
          </p>
        </div>
      ) : (
        <div className="animate-in" style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Answer */}
          <div className="panel-card">
            <div className="panel-card-header">
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.25rem' }}>Grounded Answer</p>
                <h2>Current Rule Identified</h2>
              </div>
              {result.confidence !== null && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              )}
            </div>
            <div className="panel-card-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', borderLeft: '3px solid #4D85FF' }}>
                "{result.question}"
              </p>

              {result.status === 'insufficient_evidence' ? (
                <div className="enterprise-callout-warning">
                  <strong>Evidence is insufficient</strong>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>{result.answer}</p>
                </div>
              ) : (
                <div className="enterprise-callout-active">
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#059669' }}>✓</span> Current Rule
                  </strong>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.9rem', color: '#134E4A', lineHeight: 1.7 }}>{result.answer}</p>
                </div>
              )}

              {result.authority && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '1rem' }}>
                  <span>🏛️</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>Governing Authority</strong>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>{result.authority}</span>
                  </div>
                </div>
              )}

              {result.risk_level && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', marginTop: '0.75rem' }}>
                  <span>⚠️</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#92400E', display: 'block', marginBottom: '0.2rem' }}>Risk Level</strong>
                    <span className={`enterprise-badge ${result.risk_level === 'high' ? 'enterprise-badge-danger' : result.risk_level === 'medium' ? 'enterprise-badge-warning' : 'enterprise-badge-success'}`}>
                      {result.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', marginTop: '0.75rem' }}>
                  <span>→</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#1E40AF', display: 'block', marginBottom: '0.2rem' }}>Recommended Action</strong>
                    <span style={{ fontSize: '0.85rem', color: '#1D4ED8' }}>{result.recommendation}</span>
                  </div>
                </div>
              )}

              {result.historical_context && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '12px', marginTop: '0.75rem' }}>
                  <span>↗</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#5B21B6', display: 'block', marginBottom: '0.2rem' }}>Historical Context</strong>
                    <span style={{ fontSize: '0.85rem', color: '#6D28D9' }}>{result.historical_context}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source Evidence */}
          <div className="panel-card">
            <div className="panel-card-header">
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4D85FF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.25rem' }}>Source Trail</p>
                <h2>Supporting Evidence</h2>
              </div>
              <span className="enterprise-badge enterprise-badge-info">{result.sources.length} sources</span>
            </div>
            <div style={{ padding: '1.25rem 1.75rem', display: 'grid', gap: '0.875rem' }}>
              {result.sources.map((source, index) => (
                <article
                  key={`${source.document_id}-${source.section ?? 'source'}-${source.page ?? index}`}
                  className="qe-source-card"
                  style={source.status.toLowerCase() === 'superseded' ? { borderColor: '#FECACA', background: '#FEF2F2', opacity: 0.85 } : {}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5' }}>{source.document_id}</span>
                    <span className={`enterprise-badge ${source.status.toLowerCase() === 'active' ? 'enterprise-badge-success' : 'enterprise-badge-danger'}`}>
                      {source.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>{source.title}</h3>
                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span>{source.document_type}</span>
                    {source.section && <><span style={{ color: '#CBD5E1' }}>·</span><span>{source.section}</span></>}
                    {source.page && <><span style={{ color: '#CBD5E1' }}>·</span><span>Page {source.page}</span></>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #E2E8F0', paddingLeft: '0.75rem' }}>"{source.passage}"</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Session Memory ────────────────────────────────────────────────────── */}
      <div className="panel-card animate-in" style={{ marginTop: '2rem' }}>
        <div className="panel-card-header">
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.25rem' }}>Workspace Memory</p>
            <h2>Recent Queries ({history.length})</h2>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              className="enterprise-btn-secondary"
              style={{ color: '#DC2626', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
              onClick={handleClearHistory}
            >
              Clear Memory
            </button>
          )}
        </div>
        <div style={{ padding: '0.5rem 0.75rem' }}>
          {history.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', padding: '1.5rem 1rem', textAlign: 'center' }}>No recent queries stored in session memory.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item.question)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'background 150ms ease', border: '1px solid transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, rgba(77,133,255,0.1), rgba(20,184,166,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4D85FF', fontSize: '0.9rem', flexShrink: 0 }}>✓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.question}</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.answerSnippet}</p>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#94A3B8', flexShrink: 0, paddingTop: '0.1rem' }}>{item.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}