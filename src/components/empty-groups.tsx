export function EmptyGroups() {
  return (
    <div className="mt-4 flex flex-col items-center rounded-3xl bg-card px-6 py-10 text-center shadow-[0_12px_30px_-18px_rgba(61,43,36,0.45)] ring-1 ring-black/[0.03]">
      <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
        No groups yet{" "}
        <span role="img" aria-label="party popper">
          🎉
        </span>
      </h3>
      <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        Create a group or join one with an invite code to start planning together.
      </p>
    </div>
  )
}
