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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              VeriRule intelligence
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              color: '#111827',
            }}>
              AI Query Engine
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6B7280',
            }}>
              Ask a compliance question and trace the current rule back to approved evidence.
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#4B5563',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
            }} />
            Knowledge base online
          </div>
        </div>
      </div>

      {/* Query Composer */}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <label htmlFor="compliance-question" style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#111827',
          }}>
            What do you need to verify?
          </label>
          <span style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
            fontWeight: 600,
          }}>
            Natural language search
          </span>
        </div>

        <textarea
          id="compliance-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. What rule currently applies to a high-value cash transaction?"
          rows={3}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            color: '#111827',
            transition: 'all 150ms ease',
            marginBottom: '1rem',
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

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
          }}>
            Answers are grounded in indexed circulars, policies, and regulatory updates.
          </span>
          <button
            type="submit"
            disabled={isSearching || !question.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: isSearching || !question.trim() ? '#D1D5DB' : '#4D85FF',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: isSearching || !question.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (!isSearching && question.trim()) {
                e.currentTarget.style.background = '#3B6CE6';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSearching && question.trim()) {
                e.currentTarget.style.background = '#4D85FF';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isSearching ? 'Searching...' : 'Run compliance search'}
            {!isSearching && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </form>

      {/* Starter Questions */}
      <div style={{
        marginBottom: '2.5rem',
      }}>
        <p style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#4B5563',
          marginBottom: '1rem',
        }}>
          Try a question
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {starterQuestions.map((starterQuestion) => (
            <button
              key={starterQuestion}
              type="button"
              onClick={() => setQuestion(starterQuestion)}
              style={{
                padding: '1.25rem',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#111827',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
                lineHeight: '1.6',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {starterQuestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          color: '#991B1B',
          fontSize: '0.9rem',
          fontWeight: '600',
        }}>
          ⚠️ {error}
        </div>
      )}

      {!result ? (
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⌕</div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: '#111827',
          }}>
            Your evidence-backed answer will appear here
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: '#6B7280',
          }}>
            VeriRule will prioritize active rules, identify superseded guidance, and show the passages supporting its conclusion.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Answer Panel */}
          <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>
                Grounded answer
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0',
                  color: '#111827',
                }}>
                  Current rule identified
                </h2>
                {result.confidence !== null && (
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    padding: '0.5rem 1rem',
                    background: '#E0E7FF',
                    color: '#4D85FF',
                    borderRadius: '8px',
                  }}>
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: '#6B7280',
              fontStyle: 'italic',
              padding: '1rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              borderLeft: '3px solid #4D85FF',
              margin: '0 0 1.5rem 0',
            }}>
              "{result.question}"
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {result.status === 'insufficient_evidence' ? (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#991B1B',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>!</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Evidence is insufficient</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.answer}</p>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  color: '#065F46',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✓</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Current rule</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.answer}</p>
                  </div>
                </div>
              )}

              {result.authority && (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  color: '#4B5563',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🏛️</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Governing authority</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.authority}</p>
                  </div>
                </div>
              )}

              {result.risk_level && (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#FEF3C7',
                  borderRadius: '12px',
                  color: '#92400E',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Risk level</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.risk_level.toUpperCase()}</p>
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  color: '#4B5563',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>→</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Recommended action</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.recommendation}</p>
                  </div>
                </div>
              )}

              {result.historical_context && (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  color: '#4B5563',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>↗</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Historical context</strong>
                    <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5' }}>{result.historical_context}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Panel */}
          <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>
                Source trail
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0',
                  color: '#111827',
                }}>
                  Supporting evidence
                </h2>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.8rem',
                  background: '#E0E7FF',
                  color: '#4D85FF',
                  borderRadius: '6px',
                }}>
                  {result.sources.length} sources
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.sources.map((source, index) => {
                const isSuperseded = source.status.toLowerCase() === 'superseded';
                return (
                  <article key={`${source.document_id}-${source.section ?? 'source'}-${source.page ?? index}`} style={{
                    padding: '1.25rem',
                    background: isSuperseded ? '#FEF2F2' : '#F9FAFB',
                    border: `1px solid ${isSuperseded ? '#FECACA' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    transition: 'all 150ms ease',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isSuperseded ? '#991B1B' : '#111827',
                      }}>
                        {source.document_id}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        background: isSuperseded ? '#FECACA' : '#D1F9E6',
                        color: isSuperseded ? '#991B1B' : '#065F46',
                        borderRadius: '4px',
                      }}>
                        {source.status}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: '#111827',
                      margin: '0 0 0.5rem 0',
                    }}>
                      {source.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#6B7280',
                    }}>
                      {source.document_type && <span>📄 {source.document_type}</span>}
                      {source.section && <span>📍 {source.section}</span>}
                      {source.page && <span>📄 Page {source.page}</span>}
                    </div>

                    <p style={{
                      fontSize: '0.85rem',
                      color: '#4B5563',
                      fontStyle: 'italic',
                      margin: '0',
                      lineHeight: '1.6',
                    }}>
                      "{source.passage}"
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Queries History */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}>
              Workspace memory
            </div>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: '0',
            }}>
              Recent queries ({history.length})
            </h2>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
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
              Clear memory
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{
            color: '#9CA3AF',
            fontSize: '0.85rem',
            margin: '0',
          }}>
            No recent queries stored in session memory.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item.question)}
                style={{
                  padding: '1rem',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ fontSize: '1rem', color: '#10B981' }}>✓</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '0.2rem',
                  }}>
                    {item.question}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9CA3AF',
                  }}>
                    {item.answerSnippet}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#9CA3AF',
                  whiteSpace: 'nowrap',
                }}>
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
