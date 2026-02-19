const API_BASE = 'http://localhost:8000'

interface StreamCallbacks {
  onToken: (delta: string) => void
  onDone: () => void
  onError: (message: string) => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message =
      (body as { detail?: { error?: { message?: string } } })?.detail?.error?.message ??
      `HTTP ${response.status}`
    callbacks.onError(message)
    return
  }

  if (!response.body) {
    callbacks.onError('Response body is empty.')
    return
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += value
    const lines = buffer.split('\n')
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()

      if (data === '[DONE]') {
        callbacks.onDone()
        return
      }

      try {
        const parsed = JSON.parse(data) as { delta?: string; error?: { message: string } }
        if (parsed.error) {
          callbacks.onError(parsed.error.message)
          return
        }
        if (parsed.delta) {
          callbacks.onToken(parsed.delta)
        }
      } catch {
        // Malformed JSON line — ignore and continue
      }
    }
  }

  // Stream ended without [DONE] — treat as complete
  callbacks.onDone()
}
