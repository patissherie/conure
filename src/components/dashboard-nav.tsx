import Image from "next/image"
import { HuddleLogo } from "@/src/components/huddle-logo"

export function DashboardNav() {
  return (
    <header className="flex items-center justify-between">
      <a href="/dashboard" className="flex items-center gap-2.5">
        <HuddleLogo className="h-9 w-9" />
        <span className="font-serif text-2xl font-bold tracking-tight text-foreground">Huddle</span>
      </a>
      <button
        type="button"
        aria-label="Open your profile"
        className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-card shadow-sm transition-transform hover:scale-105"
      >
        <Image
          src="/avatars/matt.png"
          alt="Matt's avatar"
          fill
          sizes="44px"
          className="object-cover"
        />
      </button>
    </header>
  )
}
