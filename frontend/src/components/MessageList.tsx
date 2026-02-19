import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(messages.length)

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return

    if (messages.length > prevLengthRef.current) {
      // New message appended — smooth scroll
      el.scrollIntoView({ behavior: 'smooth' })
    } else if (isStreaming) {
      // Token appended to existing message — instant scroll to follow
      el.scrollIntoView({ behavior: 'instant' })
    }

    prevLengthRef.current = messages.length
  }, [messages, isStreaming])

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
