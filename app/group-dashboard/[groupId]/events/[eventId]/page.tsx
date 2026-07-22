'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { HuddleLogo } from '@/src/components/huddle-logo';
import { MemberAvatar } from '@/src/components/member-avatar';
import { Button } from '@/src/components/ui/button';
import { useUser } from '@/lib/useUser';

type Event = {
  id: string;
  title: string;
  description: string | null;
  preferred_start_time : string | null;
  preferred_end_time: string | null;
  confirmed_time: string | null;
  status: string;
  group_id: string;
};

type Member = {
  id: string;
  name: string;
  status: string;
  selected_time: string | null;
};

export default function EventDashboardPage() {
  const params = useParams();

  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const { user } = useUser();

  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventData) {
        setEvent(eventData);
      }

      // Load group members
        const { data: memberData } = await supabase
        .from("group_members")
        .select(`
            user_id,
            users(name)
        `)
        .eq("group_id", groupId);

        const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("user_id, status, selected_time")
        .eq("event_id", eventId);

      if (memberData) {
        setMembers(
            memberData.map((m: any) => {
                const rsvp = rsvpData?.find(
                (r: any) => r.user_id === m.user_id
                );

                return {
                id: m.user_id,
                name: m.users?.name ?? "Unknown",
                status: rsvp?.status ?? "pending",
                selected_time: rsvp?.selected_time ?? null,
                };
            })
        );
      }

      setLoading(false);
    }

    loadData();
  }, [eventId, groupId]);

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  if (!event) {
    return <p className="p-8">Event not found.</p>;
  }

  return (
    <div className="min-h-dvh bg-background">

      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <HuddleLogo className="h-9 w-9" />
          <span className="font-serif text-3xl font-bold">
            Huddle
          </span>
        </div>

        <MemberAvatar
          name={user?.user_metadata?.full_name ?? 'User'}
          index={1}
          className="h-11 w-11"
        />
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16">

        <Link
          href={`/group-dashboard/${groupId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Group
        </Link>

        <div className="rounded-3xl bg-card p-8 shadow-lg">

          <h1 className="font-serif text-4xl font-bold">
            {event.title}
          </h1>

          {event.description && (
            <p className="mt-3 text-muted-foreground">
              {event.description}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-secondary p-4">
              <Calendar className="mb-2 h-5 w-5 text-primary" />

              <p className="text-sm text-muted-foreground">
                Event Window
              </p>

            <p className="mt-1 font-semibold">
            {event.preferred_start_time && event.preferred_end_time
                ? `${new Date(event.preferred_start_time).toLocaleString()} → ${new Date(
                    event.preferred_end_time
                ).toLocaleString()}`
                : "Not set"}
            </p>
            </div>

            <div className="rounded-2xl bg-secondary p-4">
              <Clock className="mb-2 h-5 w-5 text-primary" />

              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <p className="mt-1 font-semibold capitalize">
                {event.status}
              </p>
            </div>

            <div className="rounded-2xl bg-secondary p-4">
              <Users className="mb-2 h-5 w-5 text-primary" />

              <p className="text-sm text-muted-foreground">
                Members
              </p>

              <p className="mt-1 font-semibold">
                {members.length}
              </p>
            </div>
          </div>

          {event.confirmed_time && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Confirmed Meeting Time
              </p>

              <p className="mt-1 text-lg font-bold text-green-800">
                {new Date(event.confirmed_time).toLocaleString()}
              </p>
            </div>
          )}

          <hr className="my-8" />

          <h2 className="font-serif text-2xl font-bold">
            Members
          </h2>

          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div>
                  <p className="font-medium">{member.name}</p>

                  {member.selected_time && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Selected:{" "}
                      {new Date(member.selected_time).toLocaleString()}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    member.status === "going"
                      ? "bg-green-100 text-green-700"
                      : member.status === "not_going"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {member.status === "going"
                    ? "Going"
                    : member.status === "not_going"
                    ? "Not Going"
                    : "Pending"}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-8" />

          <div className="grid gap-3">
            {event.status !== "completed" && (
              <Link
                href={`/group-dashboard/${groupId}/events/${eventId}/availability`}
              >
                <Button className="w-full">
                  RSVP & Submit Availability
                </Button>
              </Link>
            )}

            <Button variant="outline" className="w-full">
              Find Best Time
            </Button>

            <Button variant="outline" className="w-full">
              Choose Activity
            </Button>

            <Button variant="outline" className="w-full">
              Start Voting
            </Button>
          </div>

          <div className="mt-8 rounded-2xl bg-accent p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />

              <h3 className="font-semibold">
                Final Decision
              </h3>
            </div>

            {event.confirmed_time ? (
              <p className="mt-2 text-muted-foreground">
                Meeting confirmed for{" "}
                <span className="font-semibold">
                  {new Date(event.confirmed_time).toLocaleString()}
                </span>
                .
              </p>
            ) : (
              <p className="mt-2 text-muted-foreground">
                No venue has been selected yet.
              </p>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}