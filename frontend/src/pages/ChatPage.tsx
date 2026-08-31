import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  ChatMessage,
  ChatSession,
  ChatSource,
  deleteSession,
  exportSessionAsPdf,
  getActiveSessionId,
  loadSessions,
  saveSession,
  setActiveSessionId,
  streamChatMessage,
} from '../services/chatService'

// ── Starter prompts ─────────────────────────────────────────────────────────
const STARTER_PROMPTS = [
  'What KYC requirement currently applies to high-value cash transactions?',
  'Which cyber security controls govern our payment infrastructure?',
  'How long must trade order audit logs be preserved under SEBI regulations?',
  'What are the current SOC monitoring requirements for financial entities?',
  'Explain the beneficiary cooling-off period for digital payment transfers.',
]

// ── Helpers ─────────────────────────────────────────────────────────────────
function newSession(): ChatSession {
  const id = crypto.randomUUID()
  return {
    id,
    title: 'New compliance session',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function deriveTitle(firstQuestion: string): string {
  return firstQuestion.length > 55 ? firstQuestion.slice(0, 52) + '...' : firstQuestion
}

function avgConfidence(sources: ChatSource[]): number | null {
  const active = sources.filter((s) => s.status === 'active')
  if (!active.length) return null
  return active.reduce((acc, s) => acc + s.confidence, 0) / active.length
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 85 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444'
  const label = pct >= 85 ? 'High confidence' : pct >= 65 ? 'Moderate' : 'Low confidence'
  return (
    <div className="chat-confidence-meter">
      <div className="chat-confidence-bar-track">
        <div className="chat-confidence-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="chat-confidence-label" style={{ color }}>
        {pct}% — {label}
      </span>
    </div>
  )
}

function SourceCard({ source }: { source: ChatSource }) {
  const [open, setOpen] = useState(false)
  const isSuperseded = source.status === 'superseded'
  return (
    <div className={`chat-source-card ${isSuperseded ? 'chat-source-superseded' : 'chat-source-active'}`}>
      <button
        type="button"
        className="chat-source-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="chat-source-toggle-left">
          <span className={`chat-source-status-dot ${isSuperseded ? 'dot-superseded' : 'dot-active'}`} />
          <span className="chat-source-id">{source.document_id}</span>
          {isSuperseded && <span className="chat-superseded-chip">⚠ SUPERSEDED</span>}
        </span>
        <span className="chat-source-toggle-right">
          <span className="chat-source-confidence">
            {Math.round(source.confidence * 100)}%
          </span>
          <span className="chat-source-chevron">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="chat-source-body">
          <div className="chat-source-meta-row">
            <span className="chat-source-title">{source.title}</span>
          </div>
          <div className="chat-source-meta-tags">
            {source.authority && <span className="chat-meta-tag">{source.authority}</span>}
            {source.section && <span className="chat-meta-tag">{source.section}</span>}
            {source.effective_date && <span className="chat-meta-tag">Eff. {source.effective_date}</span>}
          </div>
          {isSuperseded && (
            <div className="chat-superseded-warning">
              ⚠️ This document is <strong>superseded</strong> and must not be used as the current governing rule.
            </div>
          )}
          <blockquote className="chat-source-passage">"{source.passage}"</blockquote>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage & { isStreaming?: boolean } }) {
  const isUser = message.role === 'user'
  const hasSources = message.sources.length > 0
  const activeSourcesConf = avgConfidence(message.sources)
  const hasSuperseded = message.sources.some((s) => s.status === 'superseded')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content).catch(() => {})
  }

  return (
    <article className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
      <div className="chat-bubble-header">
        <span className="chat-bubble-avatar">{isUser ? '👤' : '🛡️'}</span>
        <span className="chat-bubble-role">{isUser ? 'You' : 'VeriRule Assistant'}</span>
        <span className="chat-bubble-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
        {!isUser && !message.isStreaming && (
          <button type="button" className="chat-copy-btn" onClick={copyToClipboard} title="Copy answer">
            📋
          </button>
        )}
      </div>

      <div className="chat-bubble-content">
        {message.content.split('\n').map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
        {message.isStreaming && <span className="chat-stream-cursor" aria-hidden="true" />}
      </div>

      {!isUser && !message.isStreaming && hasSources && (
        <>
          {hasSuperseded && (
            <div className="chat-conflict-banner">
              ⚠️ <strong>Superseded rule detected</strong> — at least one source in this answer is obsolete.
              Apply only the ACTIVE rules above.
            </div>
          )}

          {activeSourcesConf !== null && (
            <ConfidenceMeter value={activeSourcesConf} />
          )}

          <div className="chat-sources-section">
            <div className="chat-sources-label">
              📎 {message.sources.length} source{message.sources.length !== 1 ? 's' : ''} cited
            </div>
            {message.sources.map((src, i) => (
              <SourceCard key={`${src.document_id}-${i}`} source={src} />
            ))}
          </div>
        </>
      )}
    </article>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession>(newSession)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load persisted sessions
  useEffect(() => {
    const stored = loadSessions()
    setSessions(stored)
    const lastId = getActiveSessionId()
    if (lastId) {
      const last = stored.find((s) => s.id === lastId)
      if (last) setActiveSession(last)
    }
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession.messages])

  const persistSession = (session: ChatSession) => {
    saveSession(session)
    setActiveSessionId(session.id)
    setSessions(loadSessions())
  }

  const handleNewSession = () => {
    const s = newSession()
    setActiveSession(s)
    setActiveSessionId(s.id)
    setInput('')
    setError('')
  }

  const handleSelectSession = (s: ChatSession) => {
    setActiveSession(s)
    setActiveSessionId(s.id)
    setError('')
  }

  const handleDeleteSession = (id: string) => {
    deleteSession(id)
    const updated = loadSessions()
    setSessions(updated)
    if (activeSession.id === id) {
      if (updated.length > 0) {
        setActiveSession(updated[0])
        setActiveSessionId(updated[0].id)
      } else {
        handleNewSession()
      }
    }
  }

  const handleSend = async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim()
    if (!question || isStreaming) return

    setInput('')
    setError('')
    setIsStreaming(true)

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: question,
      sources: [],
      timestamp: new Date().toISOString(),
    }

    // Placeholder assistant message for streaming
    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: ChatMessage & { id?: string; isStreaming?: boolean } = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      sources: [],
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    const updatedMessages = [...activeSession.messages, userMsg, assistantMsg]
    const updatedSession: ChatSession = {
      ...activeSession,
      title: activeSession.messages.length === 0 ? deriveTitle(question) : activeSession.title,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    }
    setActiveSession(updatedSession)

    let accumulatedContent = ''
    let finalSources: ChatSource[] = []

    await streamChatMessage(
      activeSession.id,
      activeSession.messages,
      question,
      (token) => {
        accumulatedContent += token
        setActiveSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            (m as ChatMessage & { id?: string }).id === assistantMsgId
              ? { ...m, content: accumulatedContent }
              : m,
          ),
        }))
      },
      (sources) => {
        finalSources = sources
      },
      () => {
        // Done — finalize the assistant message
        setActiveSession((prev) => {
          const finalized: ChatSession = {
            ...prev,
            messages: prev.messages.map((m) => {
              const msg = m as ChatMessage & { id?: string; isStreaming?: boolean }
              if (msg.id === assistantMsgId) {
                const { id: _id, isStreaming: _is, ...rest } = msg
                return { ...rest, content: accumulatedContent, sources: finalSources }
              }
              return m
            }),
            updatedAt: new Date().toISOString(),
          }
          persistSession(finalized)
          return finalized
        })
        setIsStreaming(false)
      },
      (errMsg) => {
        setError(errMsg)
        setActiveSession((prev) => {
          const finalized: ChatSession = {
            ...prev,
            messages: prev.messages.map((m) => {
              const msg = m as ChatMessage & { id?: string; isStreaming?: boolean }
              if (msg.id === assistantMsgId) {
                const { id: _id, isStreaming: _is, ...rest } = msg
                return {
                  ...rest,
                  content: 'An error occurred while fetching your compliance answer. Please ensure the backend is running.',
                  sources: [],
                }
              }
              return m
            }),
          }
          persistSession(finalized)
          return finalized
        })
        setIsStreaming(false)
      },
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleExport = () => {
    if (activeSession.messages.length === 0) return
    exportSessionAsPdf(activeSession)
  }

  return (
    <div className="chat-page">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'chat-sidebar-open' : 'chat-sidebar-closed'}`}>
        <div className="chat-sidebar-header">
          <div>
            <span className="eyebrow">Compliance sessions</span>
            <h2>History</h2>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm chat-new-session-btn"
            onClick={handleNewSession}
            id="chat-new-session"
          >
            + New
          </button>
        </div>

        <div className="chat-session-list">
          {sessions.length === 0 ? (
            <p className="chat-no-sessions">No past sessions yet. Ask a compliance question to begin.</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={`chat-session-item ${activeSession.id === s.id ? 'chat-session-active' : ''}`}
                onClick={() => handleSelectSession(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectSession(s)}
              >
                <div className="chat-session-item-title">{s.title}</div>
                <div className="chat-session-item-meta">
                  {s.messages.length} message{s.messages.length !== 1 ? 's' : ''} ·{' '}
                  {new Date(s.updatedAt).toLocaleDateString()}
                </div>
                <button
                  type="button"
                  className="chat-session-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(s.id)
                  }}
                  title="Delete session"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main chat area ──────────────────────────────────────────── */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <button
            type="button"
            className="chat-sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Close session sidebar' : 'Open session sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="chat-header-info">
            <span className="eyebrow">VeriRule intelligence</span>
            <h1>Compliance Chat Assistant</h1>
          </div>
          <div className="chat-header-actions">
            <span className="engine-status">
              <span className="status-dot" /> Knowledge base online
            </span>
            {activeSession.messages.length > 0 && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleExport}
                  title="Export session as PDF"
                  id="chat-export-pdf"
                >
                  📄 Export PDF
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#dc2626' }}
                  onClick={handleNewSession}
                  id="chat-clear-session"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages thread */}
        <div className="chat-messages" role="log" aria-live="polite">
          {activeSession.messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <h2>Ask a compliance question</h2>
              <p>
                VeriRule will retrieve evidence from your indexed regulatory documents, synthesize a grounded
                answer, and show you exactly which sources support it.
              </p>

              <div className="chat-starters">
                <p className="chat-starters-label">Try a question</p>
                <div className="chat-starters-grid">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="chat-starter-btn"
                      onClick={() => handleSend(prompt)}
                      disabled={isStreaming}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            activeSession.messages.map((msg, i) => (
              <MessageBubble key={i} message={msg as ChatMessage & { isStreaming?: boolean }} />
            ))
          )}

          {error && (
            <div className="query-error chat-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="chat-composer">
          <div className="chat-composer-inner">
            <textarea
              ref={textareaRef}
              id="chat-input"
              className="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a compliance question... (Ctrl+Enter to send)"
              rows={2}
              disabled={isStreaming}
              aria-label="Compliance question input"
            />
            <div className="chat-composer-actions">
              <span className="chat-composer-hint">Ctrl+Enter to send</span>
              <button
                type="button"
                id="chat-send-btn"
                className="btn btn-primary chat-send-btn"
                onClick={() => handleSend()}
                disabled={isStreaming || !input.trim()}
              >
                {isStreaming ? (
                  <>
                    <span className="chat-loading-dot" />
                    <span className="chat-loading-dot" />
                    <span className="chat-loading-dot" />
                  </>
                ) : (
                  'Send →'
                )}
              </button>
            </div>
          </div>
          <p className="chat-disclaimer">
            Answers are grounded exclusively in your indexed regulatory documents. Always verify against source.
          </p>
        </div>
      </div>
    </div>
  )
}
