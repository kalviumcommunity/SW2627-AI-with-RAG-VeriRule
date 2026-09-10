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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '1rem',
      padding: '0.75rem',
      background: 'rgba(77, 133, 255, 0.05)',
      borderRadius: '8px',
    }}>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#E5E7EB',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '999px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color,
        whiteSpace: 'nowrap',
      }}>
        {pct}% — {label}
      </span>
    </div>
  )
}

function SourceCard({ source }: { source: ChatSource }) {
  const [open, setOpen] = useState(false)
  const isSuperseded = source.status === 'superseded'
  const bgColor = isSuperseded ? '#fef2f2' : '#ecfdf5'
  const borderColor = isSuperseded ? '#fecaca' : '#a7f3d0'
  const textColor = isSuperseded ? '#991b1b' : '#065f46'
  const dotColor = isSuperseded ? '#ef4444' : '#10b981'

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      marginBottom: '0.75rem',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, textAlign: 'left' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: textColor,
          }}>
            {source.document_id}
          </span>
          {isSuperseded && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.25rem 0.5rem',
              background: '#ef4444',
              color: 'white',
              borderRadius: '4px',
            }}>
              ⚠ SUPERSEDED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: textColor,
          }}>
            {Math.round(source.confidence * 100)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: textColor }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {open && (
        <div style={{
          padding: '1rem',
          borderTop: `1px solid ${borderColor}`,
          background: 'rgba(0, 0, 0, 0.02)',
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: textColor,
              marginBottom: '0.5rem',
            }}>
              {source.title}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {source.authority && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.6rem',
                  background: borderColor,
                  color: textColor,
                  borderRadius: '4px',
                }}>
                  {source.authority}
                </span>
              )}
              {source.section && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.6rem',
                  background: borderColor,
                  color: textColor,
                  borderRadius: '4px',
                }}>
                  {source.section}
                </span>
              )}
              {source.effective_date && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.6rem',
                  background: borderColor,
                  color: textColor,
                  borderRadius: '4px',
                }}>
                  Eff. {source.effective_date}
                </span>
              )}
            </div>
          </div>
          {isSuperseded && (
            <div style={{
              fontSize: '0.85rem',
              color: textColor,
              background: borderColor,
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '0.75rem',
              fontWeight: 600,
            }}>
              ⚠️ This document is <strong>superseded</strong> and must not be used as the current governing rule.
            </div>
          )}
          <blockquote style={{
            fontSize: '0.85rem',
            color: textColor,
            fontStyle: 'italic',
            margin: '0',
            paddingLeft: '1rem',
            borderLeft: `3px solid ${dotColor}`,
            lineHeight: '1.6',
          }}>
            "{source.passage}"
          </blockquote>
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
    <article style={{
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        maxWidth: isUser ? '70%' : '85%',
        background: isUser ? '#4D85FF' : '#F9FAFB',
        border: isUser ? 'none' : '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: isUser ? '0 2px 8px rgba(77, 133, 255, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: isUser ? 'rgba(255, 255, 255, 0.9)' : '#4B5563',
        }}>
          <span style={{ fontSize: '1.1rem' }}>
            {isUser ? '👤' : '🛡️'}
          </span>
          <span>
            {isUser ? 'You' : 'VeriRule Assistant'}
          </span>
          <span style={{ color: isUser ? 'rgba(255, 255, 255, 0.6)' : '#9CA3AF', fontSize: '0.75rem' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && !message.isStreaming && (
            <button
              type="button"
              onClick={copyToClipboard}
              title="Copy answer"
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                opacity: 0.7,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
            >
              📋
            </button>
          )}
        </div>

        <div style={{
          color: isUser ? 'white' : '#111827',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content}
          {message.isStreaming && (
            <span style={{
              display: 'inline-block',
              width: '3px',
              height: '1em',
              background: isUser ? 'white' : '#4D85FF',
              marginLeft: '4px',
              animation: 'pulse 1s infinite',
            }} />
          )}
        </div>

        {!isUser && !message.isStreaming && hasSources && (
          <div style={{ marginTop: '1rem' }}>
            {hasSuperseded && (
              <div style={{
                fontSize: '0.85rem',
                color: '#991b1b',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: 600,
              }}>
                ⚠️ <strong>Superseded rule detected</strong> — at least one source in this answer is obsolete.
                Apply only the ACTIVE rules above.
              </div>
            )}

            {activeSourcesConf !== null && (
              <ConfidenceMeter value={activeSourcesConf} />
            )}

            <div style={{ marginTop: '1rem' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.75rem',
              }}>
                📎 {message.sources.length} source{message.sources.length !== 1 ? 's' : ''} cited
              </div>
              {message.sources.map((src, i) => (
                <SourceCard key={`${src.document_id}-${i}`} source={src} />
              ))}
            </div>
          </div>
        )}
      </div>
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
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'white',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '300px' : '0',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        transition: 'width 300ms ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Compliance sessions
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0' }}>History</h2>
          </div>
          <button
            type="button"
            onClick={handleNewSession}
            id="chat-new-session"
            style={{
              padding: '0.5rem 1rem',
              background: '#4D85FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3B6CE6';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4D85FF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            + New
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {sessions.length === 0 ? (
            <p style={{
              fontSize: '0.85rem',
              color: '#9CA3AF',
              textAlign: 'center',
              paddingTop: '2rem',
            }}>
              No past sessions yet. Ask a compliance question to begin.
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectSession(s)}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: activeSession.id === s.id ? '#E0E7FF' : '#F9FAFB',
                  border: activeSession.id === s.id ? '1.5px solid #4D85FF' : '1px solid transparent',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (activeSession.id !== s.id) {
                    e.currentTarget.style.background = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSession.id !== s.id) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
              >
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '0.3rem',
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9CA3AF',
                }}>
                  {s.messages.length} message{s.messages.length !== 1 ? 's' : ''} · {new Date(s.updatedAt).toLocaleDateString()}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(s.id)
                  }}
                  title="Delete session"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '24px',
                    height: '24px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#9CA3AF',
                    opacity: 0.5,
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = '#EF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.5';
                    e.currentTarget.style.color = '#9CA3AF';
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1rem 2rem',
          borderBottom: '1px solid #E5E7EB',
          background: 'white',
        }}>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Close session sidebar' : 'Open session sidebar'}
            style={{
              width: '36px',
              height: '36px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#111827',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div style={{ flex: 1 }}>
            <div className="enterprise-category-tag" style={{ marginBottom: '0.25rem' }}>
              <span>💬 REAL-TIME AI CONVERSATION</span>
            </div>
            <h1 className="enterprise-header-title" style={{ fontSize: '1.4rem' }}>Compliance Chat Assistant</h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div className="enterprise-badge enterprise-badge-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              ChromaDB Vector Store Connected
            </div>

            {activeSession.messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExport}
                  title="Export session as PDF"
                  id="chat-export-pdf"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#111827',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E5E7EB';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  📄 Export PDF
                </button>
                <button
                  type="button"
                  onClick={handleNewSession}
                  id="chat-clear-session"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#EF4444',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                    e.currentTarget.style.borderColor = '#FECACA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages thread */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
        }} role="log" aria-live="polite">
          {activeSession.messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ask a compliance question</h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#6B7280',
                maxWidth: '500px',
                marginBottom: '2rem',
              }}>
                VeriRule will retrieve evidence from your indexed regulatory documents, synthesize a grounded
                answer, and show you exactly which sources support it.
              </p>

              <div style={{
                width: '100%',
                maxWidth: '800px',
              }}>
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#4B5563',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  Try a question
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}>
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      disabled={isStreaming}
                      style={{
                        padding: '1rem',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: '#111827',
                        cursor: isStreaming ? 'not-allowed' : 'pointer',
                        transition: 'all 150ms ease',
                        textAlign: 'left',
                        lineHeight: '1.5',
                      }}
                      onMouseEnter={(e) => {
                        if (!isStreaming) {
                          e.currentTarget.style.background = '#F3F4F6';
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
            <div role="alert" style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              color: '#991B1B',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #E5E7EB',
          background: 'white',
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '0.75rem',
          }}>
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a compliance question... (Ctrl+Enter to send)"
              rows={2}
              disabled={isStreaming}
              aria-label="Compliance question input"
              style={{
                flex: 1,
                padding: '1rem',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'none',
                color: '#111827',
                transition: 'all 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4D85FF';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77, 133, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              id="chat-send-btn"
              onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              style={{
                padding: '1rem 1.5rem',
                background: isStreaming || !input.trim() ? '#D1D5DB' : '#4D85FF',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
              }}
              onMouseEnter={(e) => {
                if (!isStreaming && input.trim()) {
                  e.currentTarget.style.background = '#3B6CE6';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4D85FF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isStreaming ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    margin: '0 2px',
                    animation: 'pulse 1s infinite',
                  }} />
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    margin: '0 2px',
                    animation: 'pulse 1s infinite 0.2s',
                  }} />
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    margin: '0 2px',
                    animation: 'pulse 1s infinite 0.4s',
                  }} />
                </>
              ) : (
                'Send →'
              )}
            </button>
          </div>
          <p style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
            margin: '0',
            textAlign: 'center',
          }}>
            Answers are grounded exclusively in your indexed regulatory documents. Always verify against source.
          </p>
        </div>
      </div>
    </div>
  )
}
