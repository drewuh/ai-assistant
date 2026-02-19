import { useState, useRef, useCallback } from 'react'
import { streamChat } from '../api/client'
import type { Message } from '../types'

interface UseChatOptions {
  onStreamEnd?: () => void
}

interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  sendMessage: (text: string) => void
}

export function useChat(options?: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingContentRef = useRef('')

  const sendMessage = useCallback(
    (text: string) => {
      // Cancel any in-flight stream
      abortControllerRef.current?.abort()

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      const placeholder: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      streamingContentRef.current = ''
      setMessages((prev) => [...prev, userMessage, placeholder])
      setIsStreaming(true)

      const controller = new AbortController()
      abortControllerRef.current = controller

      // Build history at call time — includes the just-appended user message.
      // messages is captured from the dependency array (not stale).
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      streamChat(
        history,
        {
          onToken: (delta) => {
            streamingContentRef.current += delta
            setMessages((prev) => {
              const next = [...prev]
              const last = next[next.length - 1]
              if (last?.role === 'assistant') {
                next[next.length - 1] = { ...last, content: streamingContentRef.current }
              }
              return next
            })
          },
          onDone: () => {
            setIsStreaming(false)
            options?.onStreamEnd?.()
          },
          onError: (errorMessage) => {
            setIsStreaming(false)
            const errMsg: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: errorMessage,
              timestamp: new Date(),
              isError: true,
            }
            setMessages((prev) => {
              const next = [...prev]
              next[next.length - 1] = errMsg
              return next
            })
          },
        },
        controller.signal,
      ).catch((err: unknown) => {
        // AbortError is expected when user sends a new message mid-stream — ignore it
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('streamChat threw:', err)
          setIsStreaming(false)
        }
      })
    },
    [messages], // messages in deps — required to avoid stale closure dropping history
  )

  return { messages, isStreaming, sendMessage }
}
