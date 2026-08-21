import { FormEvent, useState } from 'react'
import { submitQuery, QueryResponse } from '../services/queryService'

const starterQuestions = [
  'What KYC requirement currently applies to high-value cash transactions?',
  'Which cyber security controls govern our payment infrastructure?',
  'What evidence is required before onboarding a high-risk customer?',
]

export default function QueryEnginePage() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) return

    setIsSearching(true)
    setError('')
    try {
      const response = await submitQuery(question.trim())
      setResult(response)
    } catch {
      setError('The query service is unavailable. Check that the backend is running and try again.')
      setResult(null)
    } finally {
      setIsSearching(false)
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

      <div className="query-history dashboard-section-card">
        <div className="result-heading"><div><span className="eyebrow">Workspace memory</span><h2>Recent queries</h2></div><span className="source-count">This session</span></div>
        <div className="history-row"><span className="history-icon">✓</span><span>Which cyber security controls govern our payment infrastructure?</span><span className="history-time">Today, 10:42</span></div>
        <div className="history-row"><span className="history-icon">✓</span><span>What evidence is required before onboarding a high-risk customer?</span><span className="history-time">Yesterday, 16:18</span></div>
      </div>
    </div>
  )
}