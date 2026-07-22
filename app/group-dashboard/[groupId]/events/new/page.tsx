'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus } from 'lucide-react';

import { HuddleLogo } from '@/src/components/huddle-logo';
import { Button } from '@/src/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams();

  const groupId = params.groupId as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [preferredStart, setPreferredStart] = useState('');
  const [preferredEnd, setPreferredEnd] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();

    setError('');

    if (new Date(preferredEnd) <= new Date(preferredStart)) {
      setError('End date must be after the start date.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .insert({
        group_id: groupId,
        title: title.trim(),
        description: description.trim() || null,
        preferred_start_time: preferredStart,
        preferred_end_time: preferredEnd,
        status: 'voting',
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/group-dashboard/${groupId}/events/${data.id}`);
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
            href={`/group-dashboard/${groupId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <CalendarPlus className="h-8 w-8 text-primary" />

            <div>
              <h2 className="font-serif text-3xl font-bold">
                Create Event
              </h2>

              <p className="text-muted-foreground">
                Create an event and choose a date range your group can meet in.
              </p>
            </div>
          </div>

          <form
            onSubmit={createEvent}
            className="space-y-6"
          >
            {/* Title */}

            <div>
              <label className="mb-2 block font-semibold">
                Event Title
              </label>

              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Friday Dinner"
                className="w-full rounded-xl border border-input px-4 py-3"
              />
            </div>

            {/* Description */}

            <div>
              <label className="mb-2 block font-semibold">
                Description

                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this event about?"
                className="w-full resize-none rounded-xl border border-input px-4 py-3"
              />
            </div>

            {/* Event Window */}

            <div className="space-y-5">

              <div>
                <label className="mb-2 block font-semibold">
                  Event Window
                </label>

                <p className="mb-4 text-sm text-muted-foreground">
                  Members who RSVP "Going" will submit their availability within
                  this date range.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start
                </label>

                <input
                  type="datetime-local"
                  required
                  value={preferredStart}
                  onChange={(e) => setPreferredStart(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-input px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End
                </label>

                <input
                  type="datetime-local"
                  required
                  value={preferredEnd}
                  onChange={(e) => setPreferredEnd(e.target.value)}
                  min={preferredStart || new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-input px-4 py-3"
                />
              </div>

            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </Button>

          </form>

        </div>
      </main>
    </div>
  );
}