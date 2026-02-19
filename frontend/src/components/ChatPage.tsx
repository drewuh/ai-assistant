import { useRef } from 'react'
import { AppHeader } from './AppHeader'
import { ChatWindow } from './ChatWindow'
import { InputBar } from './InputBar'
import type { InputBarHandle } from './InputBar'
import { useChat } from '../hooks/useChat'

const MODEL_NAME =
  (import.meta.env.VITE_DEFAULT_MODEL as string | undefined) ??
  'meta-llama/llama-3.3-70b-instruct:free'

export function ChatPage(): React.JSX.Element {
  const inputBarRef = useRef<InputBarHandle>(null)
  const { messages, isStreaming, sendMessage } = useChat({
    onStreamEnd: () => inputBarRef.current?.focus(),
  })

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <AppHeader modelName={MODEL_NAME} />
      {/*
        Inner div constrains content width while the header border spans the full viewport.
        Also needs min-h-0 so the nested ChatWindow can scroll within this flex child.
      */}
      <div className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full">
        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <InputBar ref={inputBarRef} onSubmit={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  )
}
