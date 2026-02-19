import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { SendButton } from './SendButton'

interface InputBarProps {
  onSubmit: (text: string) => void
  disabled: boolean
}

export interface InputBarHandle {
  focus: () => void
}

const LINE_HEIGHT_PX = 24 // matches text-sm leading-relaxed at 16px font-size
const MAX_LINES = 5

export const InputBar = forwardRef<InputBarHandle, InputBarProps>(function InputBar(
  { onSubmit, disabled },
  ref,
) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    // setTimeout defers the focus call to after React's current render cycle,
    // ensuring the textarea is no longer disabled before we attempt to focus it.
    focus: () => setTimeout(() => textareaRef.current?.focus(), 0),
  }))

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, LINE_HEIGHT_PX * MAX_LINES)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
    // Explicitly reset height — useEffect fires after paint, this collapses instantly
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <div className="border-t border-zinc-800/60 px-4 py-3">
      <div className="max-w-3xl mx-auto w-full flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 focus-within:border-violet-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Lumen..."
          rows={1}
          className="flex-1 bg-transparent text-zinc-100 text-sm leading-relaxed placeholder:text-zinc-500 resize-none outline-none min-h-[24px] overflow-y-auto disabled:opacity-50"
          aria-label="Message input"
        />
        <SendButton disabled={disabled || !value.trim()} onClick={handleSubmit} />
      </div>
    </div>
  )
})
