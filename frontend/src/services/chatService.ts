/**
 * chatService.ts
 * Handles the SSE streaming chat API and PDF session export.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface ChatSource {
  document_id: string
  title: string
  document_type: string
  authority?: string | null
  section?: string | null
  status: 'active' | 'superseded'
  effective_date?: string | null
  passage: string
  confidence: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources: ChatSource[]
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export type StreamChunkType = 'token' | 'sources' | 'done' | 'error'

export interface StreamChunk {
  type: StreamChunkType
  data: string
}

// ── SSE Streaming Chat ─────────────────────────────────────────────────────

export async function streamChatMessage(
  sessionId: string,
  history: ChatMessage[],
  question: string,
  onToken: (token: string) => void,
  onSources: (sources: ChatSource[]) => void,
  onDone: () => void,
  onError: (message: string) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      history: history.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
        sources: m.sources,
        timestamp: m.timestamp,
      })),
      question,
    }),
  })

  if (!response.ok) {
    onError(`Server error: ${response.status} ${response.statusText}`)
    return
  }

  if (!response.body) {
    onError('Response body is empty — streaming not supported.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const jsonStr = trimmed.slice(5).trim()
        if (!jsonStr) continue

        try {
          const chunk: StreamChunk = JSON.parse(jsonStr)
          if (chunk.type === 'token') {
            onToken(chunk.data)
          } else if (chunk.type === 'sources') {
            const sources: ChatSource[] = JSON.parse(chunk.data).map((s: string) =>
              typeof s === 'string' ? JSON.parse(s) : s,
            )
            onSources(sources)
          } else if (chunk.type === 'done') {
            onDone()
          } else if (chunk.type === 'error') {
            onError(chunk.data)
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } catch (err) {
    onError(`Stream error: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    reader.releaseLock()
  }
}

// ── Session Storage ────────────────────────────────────────────────────────

const SESSIONS_KEY = 'verirule_chat_sessions_v1'
const ACTIVE_SESSION_KEY = 'verirule_chat_active_session_v1'

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSession(session: ChatSession): void {
  try {
    const sessions = loadSessions()
    const idx = sessions.findIndex((s) => s.id === session.id)
    if (idx >= 0) {
      sessions[idx] = session
    } else {
      sessions.unshift(session)
    }
    // Keep max 20 sessions
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20)))
  } catch {
    // ignore storage errors
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = loadSessions().filter((s) => s.id !== sessionId)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // ignore
  }
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY)
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_SESSION_KEY, id)
}

// ── PDF Export ─────────────────────────────────────────────────────────────

export function exportSessionAsPdf(session: ChatSession): void {
  const timestamp = new Date().toLocaleString()
  const messageHtml = session.messages
    .map((msg) => {
      if (msg.role === 'user') {
        return `
          <div class="msg user-msg">
            <div class="msg-label">👤 Compliance Officer</div>
            <div class="msg-content">${escapeHtml(msg.content)}</div>
            <div class="msg-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>`
      }
      const sourcesHtml = msg.sources
        .map(
          (s) => `
          <div class="source ${s.status === 'superseded' ? 'source-superseded' : 'source-active'}">
            <span class="source-badge">${s.status === 'superseded' ? '⚠ SUPERSEDED' : '✓ ACTIVE'}</span>
            <strong>${escapeHtml(s.document_id)}</strong> — ${escapeHtml(s.title)}<br/>
            <em>${escapeHtml(s.section ?? 'N/A')} | Confidence: ${Math.round(s.confidence * 100)}%</em><br/>
            <blockquote>${escapeHtml(s.passage)}</blockquote>
          </div>`,
        )
        .join('')

      return `
        <div class="msg assistant-msg">
          <div class="msg-label">🛡️ VeriRule Compliance Assistant</div>
          <div class="msg-content">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div>
          ${sourcesHtml ? `<div class="sources-section"><h4>Source Evidence</h4>${sourcesHtml}</div>` : ''}
          <div class="msg-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
        </div>`
    })
    .join('<hr/>')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>VeriRule Compliance Chat — ${escapeHtml(session.title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 2rem; line-height: 1.6; }
    .header { border-bottom: 3px solid #4f46e5; padding-bottom: 1rem; margin-bottom: 2rem; }
    .header h1 { color: #4f46e5; font-size: 1.5rem; }
    .header p { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }
    .msg { margin-bottom: 1.5rem; padding: 1rem; border-radius: 8px; }
    .user-msg { background: #f0f4ff; border-left: 4px solid #4f46e5; }
    .assistant-msg { background: #f8fafc; border-left: 4px solid #10b981; }
    .msg-label { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
    .msg-content { white-space: pre-wrap; }
    .msg-time { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; }
    .sources-section { margin-top: 1rem; }
    .sources-section h4 { font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
    .source { padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.85rem; }
    .source-active { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .source-superseded { background: #fef2f2; border: 1px solid #fecaca; }
    .source-badge { font-size: 0.7rem; font-weight: 700; margin-bottom: 0.25rem; display: block; }
    blockquote { border-left: 3px solid #cbd5e1; padding-left: 0.75rem; margin-top: 0.5rem; color: #475569; font-style: italic; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
    .footer { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; font-size: 0.78rem; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ VeriRule — Compliance Chat Session Export</h1>
    <p><strong>Session:</strong> ${escapeHtml(session.title)} &nbsp;|&nbsp; <strong>Exported:</strong> ${timestamp}</p>
    <p><strong>Session ID:</strong> ${escapeHtml(session.id)} &nbsp;|&nbsp; <strong>Messages:</strong> ${session.messages.length}</p>
  </div>
  ${messageHtml}
  <div class="footer">
    VeriRule AI-Powered Compliance Intelligence — Audit Export. All answers are grounded in indexed regulatory documents.
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      win.print()
      URL.revokeObjectURL(url)
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
