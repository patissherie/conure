'use client'

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, PartyPopper, Calendar, Clock, MapPin, Heart } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { HuddleLogo } from "../../src/components/huddle-logo"
import { MemberAvatar } from "../../src/components/member-avatar"
import { useUser } from "@/lib/useUser"

// Hardcoded demo data — replace with real backend data later.
const result = {
  day: "Friday",
  time: "7:00 PM",
  venue: "Grill'd",
  image: "/juicy-gourmet-burger.png",
  totalMembers: 5,
  yesVotes: 5,
  mapsUrl: "https://www.google.com/maps/search/Grill'd",
}

export default function VotingResultsPage() {
  const { user } = useUser()
  const everyoneVotedYes = result.yesVotes === result.totalMembers
  const votingSummary = everyoneVotedYes
    ? "Everyone voted Yes"
    : `${result.yesVotes} out of ${result.totalMembers} members voted Yes`

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
            <HuddleLogo className="h-10 w-10" />
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Huddle
            </span>
        </div>

        <MemberAvatar
            name={user?.user_metadata?.full_name ?? "User"}
            index={2}
            className="h-11 w-11 text-sm"
        />
      </header>

      <main className="mx-auto w-full max-w-xl px-6 pb-16">
        <section className="rounded-3xl bg-card p-6 shadow-[0_20px_60px_-24px_rgba(58,42,34,0.35)] sm:p-8">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          {/* Celebration */}
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent">
              <PartyPopper className="size-8 text-primary" />
            </div>
            <h1 className="mt-5 text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
              {"It's decided! \u{1F389}"}
            </h1>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              Everyone has finished voting.
            </p>
          </div>

          {/* Result card */}
          <div className="mt-8 rounded-2xl border border-border bg-secondary/60 p-5">
            <dl className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-primary" aria-hidden="true" />
                <dt className="sr-only">Day</dt>
                <dd className="text-lg font-semibold text-foreground">{result.day}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-primary" aria-hidden="true" />
                <dt className="sr-only">Time</dt>
                <dd className="text-lg font-semibold text-foreground">{result.time}</dd>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
                <dt className="sr-only">Venue</dt>
                <dd className="text-lg font-semibold text-foreground">{result.venue}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Heart className="size-4 fill-primary text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{votingSummary}</p>
            </div>
          </div>

          {/* Winning venue image */}
          <div className="mt-6 overflow-hidden rounded-2xl">
            <Image
              src={result.image || "/placeholder.svg"}
              alt={`Photo of ${result.venue}`}
              width={800}
              height={480}
              className="h-56 w-full object-cover sm:h-64"
              priority
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              className="h-12 w-full rounded-xl text-base font-semibold"
              render={
                <a href={result.mapsUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MapPin className="size-5" />
              Open in Google Maps
            </Button>
            <Button
            size="lg"
            nativeButton={false}
            className="h-12 w-full rounded-xl text-base font-semibold"
            render={
                <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE"
                target="_blank"
                rel="noopener noreferrer"
                />
            }
            >
              <Calendar className="size-5" />
              Save to Google Calendar
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
