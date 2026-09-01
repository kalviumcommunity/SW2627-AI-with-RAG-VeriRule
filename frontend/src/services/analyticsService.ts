import axios from 'axios'

const API_BASE = 'http://localhost:8000/analytics'

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
 * Fetch analytics dashboard data
 */
export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  try {
    const response = await axios.get<AnalyticsDashboard>(`${API_BASE}/dashboard`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch analytics dashboard:', error)
    throw error
  }
}

/**
 * Generate an analytics report
 */
export async function generateAnalyticsReport(
  request: AnalyticsReportRequest
): Promise<AnalyticsReportResponse> {
  try {
    const response = await axios.post<AnalyticsReportResponse>(`${API_BASE}/report`, request)
    return response.data
  } catch (error) {
    console.error('Failed to generate analytics report:', error)
    throw error
  }
}

/**
 * Export report as CSV
 */
export async function downloadReportCSV(reportData: AnalyticsReportResponse): void {
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
