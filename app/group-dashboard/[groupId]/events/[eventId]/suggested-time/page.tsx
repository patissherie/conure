'use client'

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, PartyPopper } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";

import { HuddleLogo } from "@/src/components/huddle-logo";
import { MemberAvatar } from "@/src/components/member-avatar";
import { Button } from "@/src/components/ui/button";

function TimeFoundContent() {
  const { user } = useUser()
  const params = useParams();

  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const [bestTime, setBestTime] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
  async function loadBestTime() {
    const { data } = await supabase
      .from("rsvps")
      .select("selected_time")
      .eq("event_id", eventId)
      .eq("status", "going");

    if (!data) return;

    const counts: Record<string, number> = {};

    data.forEach((r: any) => {
      if (!r.selected_time) return;

      counts[r.selected_time] =
        (counts[r.selected_time] || 0) + 1;
    });

    let best: string | null = null;
    let highest = 0;

    Object.entries(counts).forEach(([time, votes]) => {
      if (votes > highest) {
        highest = votes;
        best = time;
      }
    });

    setBestTime(best);
  }

  loadBestTime();
}, [eventId]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <HuddleLogo className="h-7 w-7" />
          <span className="font-serif text-xl font-bold text-foreground">
            Huddle
          </span>
        </div>

        <MemberAvatar
          name={user?.user_metadata?.full_name ?? 'User'}
          index={2}
          className="h-11 w-11 text-sm"
        />
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16">
        <div className="rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8">
          <Link
            href={`/group-dashboard/${groupId}`}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </Link>

          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <PartyPopper className="h-8 w-8" strokeWidth={2} />
            </span>

            <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-balance">
              🎉 We found your time!
            </h1>

            <p className="mt-1 text-muted-foreground">
              Based on everyone's availability, here's the best meeting time.
            </p>

            <p className="font-serif text-2xl font-bold">
                {bestTime
                    ? new Date(bestTime).toLocaleDateString(undefined, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    })
                    : "No common time"}
                </p>

                <p className="mt-2 font-serif text-4xl font-bold">
                {bestTime
                    ? new Date(bestTime).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                    })
                    : "--"}
            </p>

            <p className="mt-5 max-w-sm text-sm text-muted-foreground text-pretty">
              No more scheduling headaches. Now let&apos;s decide what to do
              together.
            </p>
          </div>

          <Button
            className="mt-8 w-full"
            onClick={async () => {
                if (!bestTime) return;

                await supabase
                .from("events")
                .update({
                    confirmed_time: bestTime,
                    status: "activity_selection",
                })
                .eq("id", eventId);

                router.push(
                `/group-dashboard/${groupId}/events/${eventId}/choose-category`
                );
            }}
            >
            Choose Activity
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function TimeFoundPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <TimeFoundContent />
    </Suspense>
  )
}