import { HuddleLogo } from "@/src/components/huddle-logo"
import { MemberAvatar } from "@/src/components/member-avatar"
import { useUser } from "@/lib/useUser"

export function DashboardNav() {
  const { user } = useUser()
  return (
    <header className="flex items-center justify-between">
      <a href="/dashboard" className="flex items-center gap-2.5">
        <HuddleLogo className="h-9 w-9" />
        <span className="font-serif text-2xl font-bold tracking-tight text-foreground">Huddle</span>
      </a>
      <button
        type="button"
        aria-label="Open your profile"
        className="transition-transform hover:scale-105"
      >
        <MemberAvatar
          name={user?.user_metadata?.full_name ?? "User"}
          className="h-11 w-11 text-sm shadow-sm ring-2 ring-card"
        />
      </button>
    </header>
  )
}
