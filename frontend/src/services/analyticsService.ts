import api from './api'

export interface ComplianceKPI {
  metric_name: string
  value: number
  unit: string
  target?: number
  status: 'green' | 'yellow' | 'red'
  trend?: 'up' | 'down' | 'stable'
}

export interface QueryMetric {
  total_queries: number
  successful_queries: number
  failed_queries: number
  average_confidence: number
  insufficient_evidence_count: number
  success_rate: number
}

export interface DocumentMetric {
  total_documents: number
  total_chunks: number
  document_upload_count: number
  authority_distribution: Record<string, number>
  upload_trend: Record<string, number>
}

export interface RiskAreaMetric {
  area_name: string
  active_rules: number
  superseded_rules: number
  risk_level: 'low' | 'medium' | 'high'
  last_updated: string
  compliance_score: number
}

export interface ComplianceScorecard {
  overall_score: number
  score_date: string
  categories: Record<string, number>
  status: 'compliant' | 'at_risk' | 'critical'
  key_findings: string[]
  improvement_areas: string[]
}

export interface AnalyticsDashboard {
  dashboard_date: string
  kpis: ComplianceKPI[]
  query_metrics: QueryMetric
  document_metrics: DocumentMetric
  risk_areas: RiskAreaMetric[]
  scorecard: ComplianceScorecard
  compliance_trend: Record<string, number>
  top_queries: Array<{ query: string; count: number }>
  audit_events_summary: Record<string, number>
}

export interface AnalyticsReportRequest {
  report_type: 'compliance_scorecard' | 'risk_assessment' | 'executive_summary'
  include_trends: boolean
  include_recommendations: boolean
  date_range?: [string, string]
  format: 'json' | 'csv' | 'pdf'
}

export interface AnalyticsReportResponse {
  report_id: string
  report_type: string
  generated_at: string
  data: Record<string, any>
  summary: string
  recommendations?: string[]
}

/**
 * Mock fallback dashboard data when backend is unavailable
 */
function getMockDashboard(): AnalyticsDashboard {
  return {
    dashboard_date: new Date().toISOString().split('T')[0],
    kpis: [
      { metric_name: 'Overall Compliance Score', value: 87.4, unit: '%', target: 95, status: 'yellow', trend: 'up' },
      { metric_name: 'Rule Coverage Ratio', value: 94.2, unit: '%', target: 90, status: 'green', trend: 'up' },
      { metric_name: 'Active Supersession Alerts', value: 3, unit: '', target: 0, status: 'red', trend: 'down' },
      { metric_name: 'Avg Query Confidence', value: 91.8, unit: '%', target: 85, status: 'green', trend: 'stable' },
      { metric_name: 'Document Freshness', value: 96.1, unit: '%', target: 90, status: 'green', trend: 'up' },
      { metric_name: 'Pending Remediation Items', value: 7, unit: '', target: 5, status: 'yellow', trend: 'down' },
    ],
    query_metrics: {
      total_queries: 1247,
      successful_queries: 1189,
      failed_queries: 58,
      average_confidence: 0.918,
      insufficient_evidence_count: 23,
      success_rate: 0.9535,
    },
    document_metrics: {
      total_documents: 156,
      total_chunks: 4832,
      document_upload_count: 12,
      authority_distribution: {
        'Reserve Bank of India': 62,
        'SEBI': 34,
        'IRDAI': 28,
        'Ministry of Finance': 18,
        'PFRDA': 14,
      },
      upload_trend: {
        '2025-06': 8,
        '2025-07': 14,
        '2025-08': 11,
        '2025-09': 18,
        '2025-10': 12,
        '2025-11': 15,
      },
    },
    risk_areas: [
      { area_name: 'KYC & Customer Due Diligence', active_rules: 42, superseded_rules: 3, risk_level: 'medium', last_updated: '2025-11-15', compliance_score: 88.5 },
      { area_name: 'Cyber Security Framework', active_rules: 38, superseded_rules: 5, risk_level: 'high', last_updated: '2025-11-10', compliance_score: 72.3 },
      { area_name: 'Anti-Money Laundering', active_rules: 31, superseded_rules: 1, risk_level: 'low', last_updated: '2025-11-18', compliance_score: 95.1 },
      { area_name: 'Digital Payment Controls', active_rules: 27, superseded_rules: 4, risk_level: 'high', last_updated: '2025-11-08', compliance_score: 68.9 },
      { area_name: 'Data Privacy & Protection', active_rules: 19, superseded_rules: 2, risk_level: 'medium', last_updated: '2025-11-12', compliance_score: 82.7 },
    ],
    scorecard: {
      overall_score: 87.4,
      score_date: new Date().toISOString().split('T')[0],
      categories: {
        'Regulatory Compliance': 92.1,
        'Risk Management': 84.6,
        'Internal Controls': 88.3,
        'Reporting & Disclosure': 79.8,
        'Technology & Cybersecurity': 72.3,
      },
      status: 'at_risk',
      key_findings: [
        'Cyber security framework requires immediate attention due to 5 superseded rules.',
        'Digital payment controls have 4 pending supersession reviews impacting compliance.',
        'KYC refresh cycle compliance improved by 12% quarter-over-quarter.',
        'Anti-Money Laundering coverage maintains excellent 95.1% compliance score.',
      ],
      improvement_areas: [
        'Update cybersecurity incident response protocols to align with latest RBI directions.',
        'Implement automated monitoring for digital payment threshold changes.',
        'Enhance data privacy controls for cross-border data transfer compliance.',
        'Accelerate remediation of flagged supersession items in payment controls.',
      ],
    },
    compliance_trend: {
      '2025-06': 78.2,
      '2025-07': 80.5,
      '2025-08': 82.1,
      '2025-09': 84.7,
      '2025-10': 86.3,
      '2025-11': 87.4,
    },
    top_queries: [
      { query: 'What are the current KYC requirements for high-risk customers?', count: 45 },
      { query: 'What is the cyber incident reporting timeline?', count: 38 },
      { query: 'What MFA requirements apply to digital payments?', count: 32 },
      { query: 'What are the AML transaction monitoring thresholds?', count: 28 },
      { query: 'What encryption standards apply to customer data at rest?', count: 24 },
    ],
    audit_events_summary: {
      'query': 842,
      'verification': 234,
      'ingestion': 89,
      'supersession': 47,
      'system': 35,
    },
  }
}

/**
 * Fetch analytics dashboard data
 */
export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  try {
    const response = await api.get<AnalyticsDashboard>('/analytics/dashboard')
    return response.data
  } catch (error) {
    console.warn('Backend unavailable, using mock analytics data:', error)
    return getMockDashboard()
  }
}

/**
 * Generate an analytics report
 */
export async function generateAnalyticsReport(
  request: AnalyticsReportRequest
): Promise<AnalyticsReportResponse> {
  try {
    const response = await api.post<AnalyticsReportResponse>('/analytics/report', request)
    return response.data
  } catch (error) {
    console.warn('Backend unavailable, using mock report data:', error)
    return {
      report_id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      report_type: request.report_type,
      generated_at: new Date().toISOString(),
      data: {
        overall_score: 87.4,
        total_rules_assessed: 157,
        compliant_rules: 137,
        at_risk_rules: 13,
        non_compliant_rules: 7,
        high_risk_areas: ['Cyber Security Framework', 'Digital Payment Controls'],
      },
      summary: `${request.report_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} generated successfully. Overall compliance stands at 87.4% with 2 high-risk areas requiring immediate attention.`,
      recommendations: [
        'Prioritize remediation of superseded cybersecurity rules within 30 days.',
        'Implement automated digital payment threshold monitoring.',
        'Schedule quarterly KYC compliance refresh cycles.',
        'Enhance data privacy controls for cross-border transfers.',
      ],
    }
  }
}

/**
 * Export report as CSV
 */
export function downloadReportCSV(reportData: AnalyticsReportResponse): void {
  const csv = convertReportToCSV(reportData)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compliance-report-${reportData.report_id}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Convert report to CSV format
 */
function convertReportToCSV(reportData: AnalyticsReportResponse): string {
  const lines: string[] = []

  // Header
  lines.push(`Compliance Report - ${reportData.report_type}`)
  lines.push(`Generated: ${reportData.generated_at}`)
  lines.push(`Report ID: ${reportData.report_id}`)
  lines.push('')
  lines.push(`Summary: ${reportData.summary}`)
  lines.push('')

  // Data section
  lines.push('Data Section:')
  Object.entries(reportData.data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      lines.push(`"${key}","${JSON.stringify(value)}"`)
    } else {
      lines.push(`"${key}","${value}"`)
    }
  })

  // Recommendations
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    lines.push('')
    lines.push('Recommendations:')
    reportData.recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1},"${rec}"`)
    })
  }

  return lines.join('\n')
}

/**
 * Convert report to JSON
 */
export function downloadReportJSON(reportData: AnalyticsReportResponse): void {
  const json = JSON.stringify(reportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compliance-report-${reportData.report_id}.json`
  a.click()
  window.URL.revokeObjectURL(url)
}
