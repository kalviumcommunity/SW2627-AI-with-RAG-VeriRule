import api from './api'

export interface SourceReference {
  document_id: string
  title: string
  document_type: string
  section: string | null
  page: number | null
  status: string
  effective_date: string | null
  passage: string
}

export interface QueryResponse {
  query_id: string
  question: string
  answer: string
  status: string
  sources: SourceReference[]
  confidence: number | null
  authority: string | null
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null
  recommendation: string | null
  historical_context: string | null
}

export async function submitQuery(question: string): Promise<QueryResponse> {
  const response = await api.post<QueryResponse>('/queries', { question })
  return response.data
}
