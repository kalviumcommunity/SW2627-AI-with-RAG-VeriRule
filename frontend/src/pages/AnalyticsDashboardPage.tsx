import { useEffect, useState } from 'react'
import {
  fetchAnalyticsDashboard,
  generateAnalyticsReport,
  downloadReportCSV,
  downloadReportJSON,
  AnalyticsDashboard,
  AnalyticsReportResponse,
} from '../services/analyticsService'

export default function AnalyticsDashboardPage() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'compliance_scorecard' | 'risk_assessment' | 'executive_summary'>('compliance_scorecard')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [report, setReport] = useState<AnalyticsReportResponse | null>(null)

  // Load dashboard on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const data = await fetchAnalyticsDashboard()
        setDashboard(data)
      } catch (err) {
        setError('Failed to load analytics dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)
      const response = await generateAnalyticsReport({
        report_type: reportType,
        include_trends: true,
        include_recommendations: true,
        format: 'json',
      })
      setReport(response)
    } catch (err) {
      setError('Failed to generate report')
      console.error(err)
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Analytics Dashboard...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#dc2626' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>No data available</h2>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard-page" style={{ padding: '0 0 2rem 0' }}>
      {/* ── Enterprise Page Header ────────────────────────────────────────────── */}
      <div className="enterprise-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="enterprise-category-tag">
            <span>📈 EXECUTIVE ANALYTICS</span>
          </div>
          <h1 className="enterprise-header-title">Compliance Analytics Dashboard</h1>
          <p className="enterprise-header-subtitle">
            Comprehensive quantitative compliance metrics, risk scorecards, RAG latency benchmarks, and trend forecasts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={handleGenerateReport} className="enterprise-btn-primary" disabled={generatingReport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            {generatingReport ? 'Analyzing...' : 'Generate Executive Report'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* KPI Cards */}
        <div className="enterprise-grid-4" style={{ marginBottom: '2rem' }}>
          {dashboard.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="enterprise-stat-card"
              style={{
                '--card-accent': kpi.status === 'green' ? 'linear-gradient(90deg, #10B981, #059669)' : kpi.status === 'yellow' ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #B91C1C)',
              } as React.CSSProperties}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="enterprise-stat-label">{kpi.metric_name}</span>
                <span className={`enterprise-badge ${kpi.status === 'green' ? 'enterprise-badge-success' : kpi.status === 'yellow' ? 'enterprise-badge-warning' : 'enterprise-badge-danger'}`}>
                  {kpi.status.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="enterprise-stat-val">{kpi.value.toFixed(1)}{kpi.unit}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
                  <span>Target: {kpi.target}{kpi.unit}</span>
                  <span style={{ fontWeight: 600 }}>Trend: {kpi.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Scorecard */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Compliance Scorecard
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: dashboard.scorecard.status === 'compliant' ? '#10b981' :
                         dashboard.scorecard.status === 'at_risk' ? '#f59e0b' : '#ef4444',
                }}>
                  {dashboard.scorecard.overall_score.toFixed(1)}/100
                </div>
                <p style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: dashboard.scorecard.status === 'compliant' ? '#10b981' :
                         dashboard.scorecard.status === 'at_risk' ? '#f59e0b' : '#ef4444',
                  marginTop: '0.5rem',
                }}>
                  {dashboard.scorecard.status.toUpperCase()}
                </p>
              </div>
            </div>
            <div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Risk Area Scores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(dashboard.scorecard.categories).slice(0, 4).map(([area, score]) => (
                  <div key={area}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem' }}>{area}</span>
                      <span style={{ fontWeight: 'bold' }}>{score.toFixed(0)}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${score}%`,
                        backgroundColor: score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings & Improvements */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📊 Key Findings</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {dashboard.scorecard.key_findings.map((finding, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem', color: '#333', fontSize: '0.875rem' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> {finding}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🎯 Improvement Areas</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {dashboard.scorecard.improvement_areas.map((area, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem', color: '#333', fontSize: '0.875rem' }}>
                  <span style={{ marginRight: '0.5rem' }}>→</span> {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Query Metrics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Query Metrics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            <div>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>Total Queries</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                {dashboard.query_metrics.total_queries}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>Successful</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#10b981' }}>
                {dashboard.query_metrics.successful_queries}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>Failed</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef4444' }}>
                {dashboard.query_metrics.failed_queries}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>Avg Confidence</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                {(dashboard.query_metrics.average_confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Risk Areas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Risk Assessment by Area
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Area</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                    Active Rules
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                    Superseded Rules
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                    Risk Level
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                    Compliance Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboard.risk_areas.map((area, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white',
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{area.area_name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{area.active_rules}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{area.superseded_rules}</td>
                    <td style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: area.risk_level === 'low' ? '#10b981' :
                             area.risk_level === 'medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {area.risk_level.toUpperCase()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                      {area.compliance_score.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Queries */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Top Compliance Queries
          </h2>
          <div>
            {dashboard.top_queries.map((query, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: idx < dashboard.top_queries.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    {idx + 1}. {query.query}
                  </p>
                </div>
                <span style={{
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                }}>
                  {query.count} queries
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Generation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Generate Report
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            >
              <option value="compliance_scorecard">Compliance Scorecard</option>
              <option value="risk_assessment">Risk Assessment</option>
              <option value="executive_summary">Executive Summary</option>
            </select>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: generatingReport ? 'not-allowed' : 'pointer',
              opacity: generatingReport ? 0.7 : 1,
              marginBottom: '1rem',
            }}
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </button>

          {report && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginTop: '1rem',
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Report Generated</h3>
              <p style={{ marginBottom: '1rem', color: '#333' }}>{report.summary}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => downloadReportJSON(report)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Download JSON
                </button>
                <button
                  onClick={() => downloadReportCSV(report)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
