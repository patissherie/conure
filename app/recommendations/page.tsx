'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Heart,
  ThumbsDown,
  Star,
} from 'lucide-react';
import { HuddleLogo } from '../../src/components/huddle-logo';
import { MemberAvatar } from '../../src/components/member-avatar';
import { useUser } from '@/lib/useUser';

type Recommendation = {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  location: string;
  price: string;
  image: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className='flex items-center gap-0.5'
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? 'fill-honey text-honey' : 'fill-muted text-muted'
          }
          width={16}
          height={16}
        />
      ))}
    </div>
  );
}

function RecommendationsContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  // TODO: adjust this to however your app already tracks the active group
  // (e.g. context, a hook, or a different search param name) — for now this
  // assumes it's forwarded through the URL the same way `category` is.
  const groupId = searchParams.get('groupId');

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      setLoadError('Missing groupId — cannot load recommendations.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const params = new URLSearchParams({ groupId });
    if (category) params.set('category', category);

    fetch(`/api/recommendations?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? 'Failed to load recommendations');
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRecommendations(data.recommendations ?? []);
        setIndex(0);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message ?? 'Failed to load recommendations');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, category]);

  const current = recommendations[index];

  function handleVote(vote: 'yes' | 'no') {
    if (leaving || !current) return;
    setLeaving(vote);
    // NOTE: this doesn't yet persist the vote to `swipes` — hook this up to
    // your swipe_options/swipes tables if you want future affinity scoring
    // to actually learn from these votes.
    window.setTimeout(() => {
      if (index + 1 >= recommendations.length) {
        router.push('/voting-results');
      } else {
        setIndex((i) => i + 1);
        setLeaving(null);
      }
    }, 250);
  }

  return (
    <div className='min-h-dvh bg-background text-foreground'>
      <header className='mx-auto flex max-w-2xl items-center justify-between px-5 py-6'>
        <div className='flex items-center gap-2'>
          <HuddleLogo className='h-7 w-7' />
          <span className='font-serif text-xl font-bold text-foreground'>
            Huddle
          </span>
        </div>
        <MemberAvatar
          name={user?.user_metadata?.full_name ?? 'User'}
          index={2}
          className='h-11 w-11 text-sm'
        />
      </header>

      <main className='mx-auto w-full max-w-2xl px-5 pb-16'>
        <div className='rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8'>
          <div className='mb-5 flex items-center justify-between'>
            <button
              type='button'
              onClick={() => {
                if (index > 0) {
                  setIndex((i) => i - 1);
                } else {
                  router.push('/choose-category');
                }
              }}
              className='inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground'
            >
              <ArrowLeft className='h-4 w-4' strokeWidth={2.5} />
              Back
            </button>
            {recommendations.length > 0 && (
              <span className='text-sm font-semibold text-muted-foreground'>
                {index + 1} of {recommendations.length}
              </span>
            )}
          </div>

          {loading && (
            <p className='py-16 text-center text-muted-foreground'>
              Finding places your group will like…
            </p>
          )}

          {!loading && loadError && (
            <p className='py-16 text-center text-muted-foreground'>
              {loadError}
            </p>
          )}

          {!loading && !loadError && recommendations.length === 0 && (
            <p className='py-16 text-center text-muted-foreground'>
              No matching places yet — try a different category, or add more
              places to your group's area.
            </p>
          )}

          {!loading && !loadError && current && (
            <>
              <div
                className={`transition-all duration-200 ${
                  leaving === 'yes'
                    ? 'translate-x-6 rotate-2 opacity-0'
                    : leaving === 'no'
                      ? '-translate-x-6 -rotate-2 opacity-0'
                      : 'translate-x-0 rotate-0 opacity-100'
                }`}
              >
                <div className='relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary'>
                  <Image
                    src={current.image || '/placeholder.svg'}
                    alt={current.name}
                    fill
                    sizes='(max-width: 640px) 100vw, 600px'
                    className='object-cover'
                  />
                </div>

                <div className='mt-5'>
                  <p className='text-xs font-bold uppercase tracking-wide text-primary'>
                    {current.category}
                  </p>
                  <h1 className='mt-1 font-serif text-3xl font-bold tracking-tight text-balance'>
                    {current.name}
                  </h1>
                  <div className='mt-2'>
                    <StarRating rating={current.rating} />
                  </div>
                  <p className='mt-3 leading-relaxed text-muted-foreground text-pretty'>
                    {current.description}
                  </p>

                  <div className='mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground'>
                    {current.location && (
                      <span className='inline-flex items-center gap-1.5'>
                        <MapPin className='h-4 w-4 text-primary' />
                        {current.location}
                      </span>
                    )}
                    {current.price && (
                      <span className='inline-flex items-center gap-1.5'>
                        <DollarSign className='h-4 w-4 text-primary' />
                        {current.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className='mt-8 grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  onClick={() => handleVote('no')}
                  className='inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-6 py-4 text-base font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 active:scale-[0.99]'
                >
                  <ThumbsDown className='h-5 w-5' />
                  No
                </button>
                <button
                  type='button'
                  onClick={() => handleVote('yes')}
                  className='inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,96,76,0.6)] transition-all hover:brightness-105 active:scale-[0.99]'
                >
                  <Heart className='h-5 w-5 fill-current' />
                  Yes
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className='min-h-dvh bg-background' />}>
      <RecommendationsContent />
    </Suspense>
  );
}
