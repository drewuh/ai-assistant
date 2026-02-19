import type { Message } from '../types'
import { EmptyState } from './EmptyState'
import { MessageList } from './MessageList'

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
}

export function ChatWindow({ messages, isStreaming }: ChatWindowProps): React.JSX.Element {
  return (
    // min-h-0 is LOAD-BEARING — flex children default to min-height: auto which
    // causes this element to grow instead of scroll. min-h-0 enables overflow-y-auto.
    <main className="flex-1 overflow-y-auto min-h-0">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} isStreaming={isStreaming} />
      )}
    </main>
  )
}
