'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck } from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/lib/useUser';
import { HuddleLogo } from '@/src/components/huddle-logo';
import { Button } from '@/src/components/ui/button';


type Slot = {
id: string;
date: string;
time: string;
};

type Event = {
  id: string;
  title: string;
  preferred_start_time: string;
  preferred_end_time: string;
};

export default function AvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [dragging, setDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);

  const [status, setStatus] = useState('going');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from('events')
        .select(
          'id, title, preferred_start_time, preferred_end_time'
        )
        .eq('id', eventId)
        .single();

      if (!error && data) {
        setEvent(data);
      }

      setLoading(false);
    }

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    const stopDragging = () => setDragging(false);

    window.addEventListener("mouseup", stopDragging);

    return () =>
        window.removeEventListener("mouseup", stopDragging);
    }, []);

  async function saveRSVP(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    if (status === "going" && selectedSlots.length === 0) {
        setError("Please select at least one available time.");
        return;
    }
    setSaving(true);
    setError('');

    const payload = {
      event_id: eventId,
      user_id: user.id,
      status,
    };

    const { error } = await supabase
      .from('rsvps')
      .upsert(payload);

    const { error: deleteError } = await supabase
        .from("availability_slots")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

        if (deleteError) {
        setSaving(false);
        setError(deleteError.message);
        return;
        }

    if (status === "going") {
    const { error: slotError } = await supabase
        .from("availability_slots")
        .insert(
        selectedSlots.map((slot) => ({
            event_id: eventId,
            user_id: user.id,
            slot_time: slot,
        }))
        );

    if (slotError) {
        setSaving(false);
        setError(slotError.message);
        return;
    }
    }

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(
      `/group-dashboard/${groupId}/events/${eventId}`
    );
  }

  if (loading || !event) {
    return <p className="p-8">Loading...</p>;
  }

  function generateSlots(start: Date, end: Date) {
  const slots: Slot[] = [];

  // Walk day-by-day across the whole date range, and on each day lay
  // down the full 06:00-23:30 grid. The exact time-of-day on
  // preferred_start_time/preferred_end_time only determines which
  // calendar days are included, not which hours are selectable -
  // every visible cell should have a real, clickable slot behind it.
  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endDate = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const current = new Date(startDate);

  while (current <= endDate) {
    for (let hour = 6; hour <= 23; hour++) {
      for (const minute of [0, 30]) {
        const slotDate = new Date(current);
        slotDate.setHours(hour, minute, 0, 0);

        const year = slotDate.getFullYear();
        const month = (slotDate.getMonth() + 1).toString().padStart(2, "0");
        const day = slotDate.getDate().toString().padStart(2, "0");

        slots.push({
          id: slotDate.toISOString(),
          date: `${year}-${month}-${day}`,
          time: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

function getSlot(date: string, time: string) {
  return slots.find(
    slot =>
        slot.date === date &&
        slot.time === time
  );
}

const slots = generateSlots(
  new Date(event.preferred_start_time),
  new Date(event.preferred_end_time)
);

const dates = [...new Set(slots.map(slot => slot.date))];

const times: string[] = [];

for (let hour = 6; hour <= 23; hour++) {
  times.push(
    `${hour.toString().padStart(2, "0")}:00`
  );
  times.push(
    `${hour.toString().padStart(2, "0")}:30`
  );
}

  return (
    <div className="min-h-dvh bg-background">

      <header className="mx-auto flex max-w-xl items-center gap-3 px-6 py-6">
        <HuddleLogo className="h-8 w-8" />

        <h1 className="font-serif text-2xl font-bold">
          Huddle
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-6 pb-10">

        <div className="rounded-3xl bg-card p-8 shadow-lg">

          <Link
            href={`/group-dashboard/${groupId}/events/${eventId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mb-8 flex items-center gap-3">

            <CalendarCheck className="h-8 w-8 text-primary" />

            <div>
              <h2 className="font-serif text-3xl font-bold">
                RSVP
              </h2>

              <p className="text-muted-foreground">
                {event.title}
              </p>
            </div>

          </div>

          <div className="mb-8 rounded-2xl bg-secondary p-5">

            <p className="text-sm text-muted-foreground">
              Event Window
            </p>

            <p className="mt-2 font-semibold">
              {new Date(
                event.preferred_start_time
              ).toLocaleString()}
            </p>

            <p className="mt-1">
              to
            </p>

            <p className="font-semibold">
              {new Date(
                event.preferred_end_time
              ).toLocaleString()}
            </p>

          </div>

          <form
            onSubmit={saveRSVP}
            className="space-y-6"
          >

            <div>

            <label className="mb-3 block font-semibold">
            Will you attend?
            </label>

            <div className="space-y-3">
            {[
                { value: "going", label: "Going" },
                { value: "not_going", label: "Not Going" },
            ].map((option) => (
                <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-4"
                >
                <input
                    type="radio"
                    checked={status === option.value}
                    onChange={() => setStatus(option.value)}
                />
                <span>{option.label}</span>
                </label>
            ))}
            </div>

            {status === "going" && (
            <>
            <label className="mt-6 mb-2 block font-semibold">
                Select Your Available Time
            </label>

            <p className="mb-4 text-sm text-muted-foreground">
                Click or drag across the grid to mark when you're available.
            </p>

            <div
                className="overflow-auto rounded-xl border"
                onMouseLeave={() => setDragging(false)}
            >
                <table className="w-full border-collapse text-center">
                <thead>
                    <tr>
                    <th className="sticky left-0 top-0 z-20 bg-card p-2"></th>

                    {dates.map((date) => (
                        <th
                        key={date}
                        className="sticky top-0 z-10 bg-card p-2 text-sm font-semibold"
                        >
                        {new Date(date + "T00:00:00").toLocaleDateString([], {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                        })}
                        </th>
                    ))}
                    </tr>
                </thead>

                <tbody>
                {times.map((time) => (
                    <tr key={time}>
                    <td className="sticky left-0 z-10 bg-card p-1 font-medium">
                        {time}
                    </td>

                    {dates.map((date) => {
                        const slot = getSlot(date, time);

                        if (!slot) {
                            return (
                                <td key={date} className="p-1">
                                <div className="h-8 w-8 border border-border bg-gray-100" />
                                </td>
                            );
                        }

                        const selected =
                        selectedSlots.includes(slot.id);

                        return (
                        <td key={date} className="p-1">
                            <button
                            type="button"
                            onMouseDown={() => {
                                setDragging(true);

                                if (selected) {
                                    setDragMode("remove");

                                    setSelectedSlots(prev =>
                                        prev.filter(s => s !== slot.id)
                                    );
                                } else {
                                    setDragMode("add");

                                    setSelectedSlots(prev =>
                                        prev.includes(slot.id)
                                            ? prev
                                            : [...prev, slot.id]
                                    );
                                }
                            }}
                            onMouseEnter={() => {
                                if (!dragging) return;

                                if (dragMode === "add") {
                                    if (!selected) {
                                        setSelectedSlots(prev =>
                                            prev.includes(slot.id)
                                                ? prev
                                                : [...prev, slot.id]
                                        );
                                    }
                                } else {
                                    if (selected) {
                                        setSelectedSlots(prev =>
                                            prev.filter(s => s !== slot.id)
                                        );
                                    }
                                }
                            }}
                            onMouseUp={() =>
                                setDragging(false)
                            }
                            className={`h-8 w-8 border border-border transition-colors ${
                                selected
                                    ? "bg-green-500 border-green-500"
                                    : "bg-card hover:bg-green-100"
                            }`}
                            />
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

            </>
            )}

            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                saving ||
                (status === "going" && selectedSlots.length === 0)
              }
              className="w-full"
            >
              {saving
                ? 'Saving...'
                : 'Save RSVP'}
            </Button>

          </form>

        </div>

      </main>

    </div>
  );
}