export function SyncIndicator() {
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-sync-bar bg-emerald-500/80" />
    </div>
  )
}
