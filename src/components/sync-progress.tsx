export function SyncProgress({
  connected,
  total,
}: {
  connected: number
  total: number
}) {
  const percent = total === 0 ? 0 : Math.round((connected / total) * 100)

  return (
    <section aria-labelledby="sync-progress-title" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="sync-progress-title" className="font-serif text-lg font-bold text-foreground">
          Calendar Sync Progress
        </h2>
        <span className="text-sm font-semibold text-muted-foreground">
          {connected} of {total} members connected
        </span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={connected}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${connected} of ${total} members connected`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        When everyone has connected their Google Calendar, Huddle will automatically find the best
        time for everyone.
      </p>
    </section>
  )
}
