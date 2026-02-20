import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'
import { StreamingCursor } from './StreamingCursor'

interface MessageItemProps {
  message: Message
  isStreaming: boolean
}

export function MessageItem({ message, isStreaming }: MessageItemProps): React.JSX.Element {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[75%] bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-2.5 rounded-2xl text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] prose prose-invert prose-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        {isStreaming && <StreamingCursor />}
      </div>
    </div>
  )
}
