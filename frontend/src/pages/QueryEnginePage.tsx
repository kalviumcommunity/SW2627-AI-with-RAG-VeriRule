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

      // Add to query history
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
    <div className="query-engine-page">
      <div className="dashboard-welcome query-engine-heading">
        <div>
          <span className="eyebrow">VeriRule intelligence</span>
          <h1>AI Query Engine</h1>
          <p>Ask a compliance question and trace the current rule back to approved evidence.</p>
        </div>
        <span className="engine-status"><span className="status-dot" /> Knowledge base online</span>
      </div>

      <form className="query-composer" onSubmit={handleSubmit}>
        <div className="query-composer-topline">
          <label htmlFor="compliance-question">What do you need to verify?</label>
          <span>Natural language search</span>
        </div>
        <textarea
          id="compliance-question"
          className="query-input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. What rule currently applies to a high-value cash transaction?"
          rows={3}
        />
        <div className="query-composer-footer">
          <span className="query-helper">Answers are grounded in indexed circulars, policies, and regulatory updates.</span>
          <button type="submit" className="btn btn-primary" disabled={isSearching || !question.trim()}>
            {isSearching ? 'Searching...' : 'Run compliance search'}
            {!isSearching && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </form>

      <div className="starter-questions">
        <span>Try a question</span>
        {starterQuestions.map((starterQuestion) => (
          <button key={starterQuestion} type="button" onClick={() => setQuestion(starterQuestion)}>
            {starterQuestion}
          </button>
        ))}
      </div>

      {error && <div className="query-error" role="alert">{error}</div>}

      {!result ? (
        <div className="query-empty-state dashboard-section-card">
          <div className="empty-state-icon">⌕</div>
          <h2>Your evidence-backed answer will appear here</h2>
          <p>VeriRule will prioritize active rules, identify superseded guidance, and show the passages supporting its conclusion.</p>
        </div>
      ) : (
        <div className="query-results">
          <div className="answer-panel dashboard-section-card">
            <div className="result-heading">
              <div>
                <span className="eyebrow">Grounded answer</span>
                <h2>Current rule identified</h2>
              </div>
              {result.confidence !== null && <span className="confidence-badge">{Math.round(result.confidence * 100)}% confidence</span>}
            </div>
            <p className="asked-question">“{result.question}”</p>
            {result.status === 'insufficient_evidence' ? (
              <div className="insufficient-evidence"><span>!</span><div><strong>Evidence is insufficient</strong><p>{result.answer}</p></div></div>
            ) : (
              <div className="current-rule"><span className="rule-check">✓</span><div><strong>Current rule</strong><p>{result.answer}</p></div></div>
            )}
            {result.historical_context && <div className="historical-note"><span>↗</span><div><strong>Historical context</strong><p>{result.historical_context}</p></div></div>}
          </div>

          <div className="dashboard-section-card evidence-panel">
            <div className="result-heading">
              <div><span className="eyebrow">Source trail</span><h2>Supporting evidence</h2></div>
              <span className="source-count">{result.sources.length} sources</span>
            </div>
            <div className="source-list">
              {result.sources.map((source) => (
                <article key={source.document_id} className={`source-card ${source.status.toLowerCase() === 'superseded' ? 'source-card-old' : ''}`}>
                  <div className="source-card-topline"><span className="source-id">{source.document_id}</span><span className={`badge-status ${source.status.toLowerCase() === 'active' ? 'badge-active' : 'badge-superseded'}`}>{source.status}</span></div>
                  <h3>{source.title}</h3>
                  <div className="source-meta"><span>{source.document_type}</span>{source.section && <span>{source.section}</span>}{source.page && <span>Page {source.page}</span>}</div>
                  <p>“{source.passage}”</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent Session Memory ─────────────────────────────── */}
      <div className="query-history dashboard-section-card">
        <div className="result-heading">
          <div><span className="eyebrow">Workspace memory</span><h2>Recent queries ({history.length})</h2></div>
          {history.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={handleClearHistory}>
              Clear memory
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>No recent queries stored in session memory.</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="history-row"
              onClick={() => handleSelectHistory(item.question)}
              style={{ cursor: 'pointer' }}
            >
              <span className="history-icon">✓</span>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{item.question}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.answerSnippet}</span>
              </div>
              <span className="history-time">{item.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}