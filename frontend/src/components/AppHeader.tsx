interface AppHeaderProps {
  modelName: string
}

export function AppHeader({ modelName }: AppHeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-10 h-14 flex items-center border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-4">
        <span className="text-zinc-100 font-semibold tracking-tight">Lumen</span>
        <span className="text-xs text-zinc-500 font-mono">{modelName}</span>
      </div>
    </header>
  )
}
