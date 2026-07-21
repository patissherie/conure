"use client"

import { Plus } from "lucide-react"
import { DashboardNav } from "@/src/components/dashboard-nav"
import { GroupCard, type Group } from "@/src/components/group-card"
import { EmptyGroups } from "@/src/components/empty-groups"
import { JoinGroupModal } from "@/src/components/join-group-modal"

const GROUPS: Group[] = [
  {
    name: "Coffee Lovers",
    members: 5,
    memberNames: ["Tino", "Aditri", "Matt", "Sherleen"],
    stage: "finding",
    message: "3 of 5 members submitted availability.",
  },
  {
    name: "Friday Fun",
    members: 6,
    memberNames: ["Tino", "Aditri", "Matt", "Sherleen"],
    stage: "voting",
    message: "Everyone is free! Time to vote on an activity.",
  },
  {
    name: "Foodies",
    members: 4,
    memberNames: ["Tino", "Aditri", "Sherleen"],
    stage: "confirmed",
    message: "Hangout confirmed for Friday at 7:00 PM.",
  },
]

export function DashboardHome() {
  const hasGroups = GROUPS.length > 0

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <DashboardNav />

      <section className="mt-10">
        <h1 className="text-pretty font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Good afternoon, Matt{" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h1>

        <p className="mt-2 text-base text-muted-foreground">
          Ready to plan your next hangout?
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <a
          href="/groups/new"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_12px_26px_-10px_rgba(232,96,76,0.65)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </a>

        <JoinGroupModal />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Your Groups
        </h2>

        {hasGroups ? (
          <div className="mt-4 flex flex-col gap-4">
            {GROUPS.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        ) : (
          <EmptyGroups />
        )}
      </section>
    </main>
  )
}