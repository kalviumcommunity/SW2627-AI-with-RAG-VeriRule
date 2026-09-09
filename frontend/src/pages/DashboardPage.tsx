import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchDocuments, DocumentSummary } from '../services/documentService'

const authorities = [
  { name: 'Reserve Bank of India (RBI)', pct: 44, color: '#4f46e5' },
  { name: 'Securities and Exchange Board (SEBI)', pct: 32, color: '#7c3aed' },
  { name: 'Basel Committee (BCBS)', pct: 15, color: '#0d9488' },
  { name: 'Insurance Regulatory (IRDAI)', pct: 9, color: '#d97706' },
]

interface RiskCell {
  category: string
  label: string
  activeRules: number
  supersededRules: number
  riskLevel: 'low' | 'medium' | 'high'
  scenario: string
}

const RISK_HEATMAP: RiskCell[] = [
  {
    category: 'Cyber Security & IT Risk',
    label: 'Cyber Security',
    activeRules: 8,
    supersededRules: 4,
    riskLevel: 'high',
    scenario: '24x7 Security Operations Centre (SOC) Infrastructure',
  },
  {
    category: 'Digital Payments',
    label: 'Digital Payments',
    activeRules: 6,
    supersededRules: 1,
    riskLevel: 'medium',
    scenario: 'Digital Payment Beneficiary Transfer (₹5,00,000)',
  },
  {
    category: 'Market Infrastructure',
    label: 'Market Infra',
    activeRules: 11,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Stock Broker Trade Authentication & Log Storage',
  },
  {
    category: 'Capital & Risk Governance',
    label: 'Capital Risk',
    activeRules: 5,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Operational Resilience ICT Recovery Assessment',
  },
  {
    category: 'Internal Risk Governance',
    label: 'Internal Audit',
    activeRules: 3,
    supersededRules: 0,
    riskLevel: 'low',
    scenario: 'Internal Audit SOC Coverage',
  },
  {
    category: 'KYC & AML Compliance',
    label: 'KYC / AML',
    activeRules: 4,
    supersededRules: 2,
    riskLevel: 'medium',
    scenario: 'High-value customer onboarding KYC',
  },
]

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' }
    case 'medium':
      return { bg: '#fffbeb', border: '#fef3c7', text: '#92400e', dot: '#f59e0b' }
    case 'low':
      return { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' }
    default:
      return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', dot: '#9ca3af' }
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user.name ? user.name.split(' ')[0] : 'User'
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await fetchDocuments()
        setDocuments(data)
      } catch {
        // fallback to empty
      } finally {
        setLoading(false)
      }
    }
    loadDocs()
  }, [])

  // Compute live metrics from document repository
  const totalDocs = documents.length
  const activeCount = documents.filter((d) => d.status === 'active').length
  const supersededCount = documents.filter((d) => d.status === 'superseded').length
  const totalChunks = documents.reduce((acc, d) => acc + d.chunk_count, 0)

  const liveMetrics = [
    { title: 'Indexed Documents', value: loading ? '...' : String(totalDocs), sub: 'In vector repository', icon: '📜' },
    { title: 'Active Rules', value: loading ? '...' : String(activeCount), sub: 'Currently enforced', icon: '✓' },
    { title: 'Superseded', value: loading ? '...' : String(supersededCount), sub: 'Historical conflicts', icon: '⚡' },
    { title: 'Vector Chunks', value: loading ? '...' : String(totalChunks), sub: 'Embedded passages', icon: '🔍' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* Welcome Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 800,
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #111827, #4D85FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Welcome back, {firstName}
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#4B5563',
          marginBottom: '1.5rem',
        }}>
          Your regulatory compliance intelligence dashboard
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {liveMetrics.map((m) => (
          <div key={m.title} style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            transition: 'all 250ms ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.title}
              </span>
              <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Risk Heatmap */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2.5rem',
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
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.3rem',
            }}>
              Compliance Risk Heatmap
            </h2>
            <p style={{
              fontSize: '0.85rem',
              color: '#6B7280',
            }}>
              At-a-glance compliance exposure by transaction category
            </p>
          </div>
          <Link to="/dashboard/rule-verifier" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.2rem',
            background: 'white',
            border: '1.5px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4D85FF',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4D85FF';
              e.currentTarget.style.background = 'rgba(77, 133, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = 'white';
            }}
          >
            Open Rule Verifier →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          {RISK_HEATMAP.map((cell) => {
            const colors = getRiskColor(cell.riskLevel)
            return (
              <Link
                key={cell.category}
                to="/dashboard/rule-verifier"
                style={{
                  background: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: colors.text,
                  }}>
                    {cell.label}
                  </span>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: colors.dot,
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#10B981',
                    }}>
                      {cell.activeRules}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.text,
                      fontWeight: 600,
                    }}>
                      Active
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: cell.supersededRules > 0 ? '#EF4444' : '#9CA3AF',
                    }}>
                      {cell.supersededRules}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.text,
                      fontWeight: 600,
                    }}>
                      Superseded
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: colors.text,
                  background: colors.border,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  {cell.riskLevel === 'high'
                    ? '⚠ Conflict Detected'
                    : cell.riskLevel === 'medium'
                      ? '⏳ Pending Review'
                      : '✓ Compliant'}
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #E5E7EB',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4B5563' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            Compliant — No unresolved conflicts
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4B5563' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            Pending Review — Recent regulatory updates
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4B5563' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
            Conflict Detected — Active + superseded rules coexist
          </div>
        </div>
      </div>

      {/* Two-Column Section: Authority Coverage & Quick Access */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
      }}>
        {/* Authority Distribution */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}>
            Regulatory Authority Coverage
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authorities.map((a) => (
              <div key={a.name}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{a.name}</span>
                  <span style={{ fontWeight: 700, color: '#4D85FF' }}>{a.pct}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#F3F4F6',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${a.pct}%`,
                    height: '100%',
                    background: a.color,
                    borderRadius: '999px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Quick Access
          </h2>
          <Link
            to="/dashboard/rule-verifier"
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
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
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.2rem',
              }}>
                Rule Verifier
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Verify transaction compliance
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/rule-timeline"
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
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
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.2rem',
              }}>
                Rule Timeline
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Trace regulatory changes
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/chat"
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
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
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.2rem',
              }}>
                Compliance Chat
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Ask AI compliance questions
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* ── Recently Indexed Documents (live) ──────────────────────── */}
      <div
        className="dashboard-section-card"
        style={{ marginBottom: 0 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
          }}
        >
          <h2
            className="section-card-title"
            style={{ margin: 0 }}
          >
            Recently Indexed Documents
          </h2>

          <Link
            to="/dashboard/documents"
            className="btn btn-ghost btn-sm"
          >
            View all →
          </Link>
        </div>

        <div className="circulars-table-wrapper">
          <table className="circulars-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Title</th>
                <th>Authority</th>
                <th>Status</th>
                <th>Effective Date</th>
              </tr>
            </thead>

            <tbody>
              {(loading ? [] : documents.slice(0, 5)).map((doc) => (
                <tr key={doc.document_id}>
                  <td
                    style={{
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.82rem',
                      color: '#4f46e5',
                    }}
                  >
                    {doc.document_id}
                  </td>

                  <td style={{ fontWeight: 500 }}>
                    {doc.title}
                  </td>

                  <td style={{ color: 'var(--text-muted)' }}>
                    {doc.authority || 'N/A'}
                  </td>

                  <td>
                    <span
                      className={`badge-status ${doc.status === 'active'
                          ? 'badge-active'
                          : 'badge-superseded'
                        }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.84rem',
                    }}
                  >
                    {doc.effective_date || 'N/A'}
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Loading document inventory...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}