import Link from 'next/link'
import { ArrowLeft, PartyPopper } from 'lucide-react'
import { HuddleLogo } from '../../src/components/huddle-logo'
import { MemberAvatar } from '../../src/components/member-avatar'

export default function TimeFoundPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <HuddleLogo className="h-7 w-7" />
          <span className="font-serif text-xl font-bold text-foreground">Huddle</span>
        </div>
        <MemberAvatar name="Matt" index={2} className="h-11 w-11 text-sm" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16">
        <div className="rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8">
          <button
            type="button"
            className="mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <PartyPopper className="h-8 w-8" strokeWidth={2} />
            </span>

            <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-balance">
              {'🎉 We found your time!'}
            </h1>
            <p className="mt-1 text-muted-foreground">Everyone is available.</p>

            <div className="mt-6 w-full rounded-2xl border-2 border-primary bg-secondary px-6 py-8">
              <p className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                Friday, 12 June
              </p>
              <p className="mt-2 font-serif text-4xl font-bold text-primary sm:text-5xl">7:00 PM</p>
            </div>

            <p className="mt-5 max-w-sm text-sm text-muted-foreground text-pretty">
              No more scheduling headaches. Now let&apos;s decide what to do together.
            </p>
          </div>

          <Link
            href="/choose-category"
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,96,76,0.6)] transition-all hover:brightness-105 active:scale-[0.99]"
          >
            Choose an Activity
          </Link>
        </div>
      </main>
    </div>
  )
}
