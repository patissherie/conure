'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck } from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/lib/useUser';
import { HuddleLogo } from '@/src/components/huddle-logo';
import { Button } from '@/src/components/ui/button';

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

  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);

  const [status, setStatus] = useState('going');
  const [selectedTime, setSelectedTime] = useState('');

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

  async function saveRSVP(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    setSaving(true);
    setError('');

    const payload = {
      event_id: eventId,
      user_id: user.id,
      status,
      selected_time:
        status === 'going'
          ? selectedTime
          : null,
    };

    const { error } = await supabase
      .from('rsvps')
      .upsert(payload);

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
                  {
                    value: 'going',
                    label: 'Going',
                  },
                  {
                    value: 'maybe',
                    label: 'Maybe',
                  },
                  {
                    value: 'not_going',
                    label: 'Not Going',
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-4"
                  >
                    <input
                      type="radio"
                      checked={
                        status === option.value
                      }
                      onChange={() =>
                        setStatus(option.value)
                      }
                    />

                    <span>
                      {option.label}
                    </span>

                  </label>
                ))}

              </div>

            </div>

            {status === 'going' && (

              <div>

                <label className="mb-2 block font-semibold">
                  Select Your Available Time
                </label>

                <p className="mb-3 text-sm text-muted-foreground">
                  Choose one time within the event window.
                </p>

                <input
                  type="datetime-local"
                  required
                  value={selectedTime}
                  onChange={(e) =>
                    setSelectedTime(
                      e.target.value
                    )
                  }
                  min={event.preferred_start_time.slice(
                    0,
                    16
                  )}
                  max={event.preferred_end_time.slice(
                    0,
                    16
                  )}
                  className="w-full rounded-xl border border-input px-4 py-3"
                />

              </div>

            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
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