export function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
      <span className="text-4xl font-semibold text-zinc-700">Lumen</span>
      <span className="text-sm text-zinc-600">Ask me anything.</span>
    </div>
  )
}
