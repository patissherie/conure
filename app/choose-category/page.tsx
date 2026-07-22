'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { HuddleLogo } from '../../src/components/huddle-logo';
import { MemberAvatar } from '../../src/components/member-avatar';

type Category = 'food' | 'activity' | 'surprise';

const OPTIONS: {
  id: Category;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    id: 'food',
    emoji: '🍔',
    title: 'Food',
    description: 'Restaurants, cafés and places to eat.',
  },
  {
    id: 'activity',
    emoji: '🎯',
    title: 'Activity',
    description: 'Fun things to do together.',
  },
  {
    id: 'surprise',
    emoji: '🎲',
    title: 'Surprise Me',
    description: 'Let Huddle choose anything.',
  },
];

function ChooseCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: adjust to however groupId actually reaches this page today (route
  // param, context, a hook) — this assumes it's already in the URL, the same
  // way `category` is passed forward to /recommendations below.
  const groupId = searchParams.get('groupId');
  const [selected, setSelected] = useState<Category | null>(null);

  function handleContinue() {
    if (!selected) return;
    const params = new URLSearchParams({ category: selected });
    if (groupId) params.set('groupId', groupId);
    router.push(`/recommendations?${params.toString()}`);
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
        <MemberAvatar name='Matt' index={2} className='h-11 w-11 text-sm' />
      </header>

      <main className='mx-auto w-full max-w-2xl px-5 pb-16'>
        <div className='rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8'>
          <Link
            href='/suggested-time'
            className='mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' strokeWidth={2.5} />
            Back
          </Link>

          <div className='text-center'>
            <h1 className='font-serif text-3xl font-bold tracking-tight text-balance'>
              What are you in the mood for?
            </h1>
            <p className='mt-2 text-muted-foreground text-pretty'>
              Choose what Huddle should recommend for your group.
            </p>
          </div>

          <div className='mt-8 flex flex-col gap-4'>
            {OPTIONS.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => setSelected(option.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-16px_rgba(61,43,36,0.4)] ${
                    isSelected
                      ? 'border-primary bg-secondary'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span
                    className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl'
                    aria-hidden='true'
                  >
                    {option.emoji}
                  </span>
                  <span className='flex-1'>
                    <span className='block font-serif text-xl font-bold text-foreground'>
                      {option.title}
                    </span>
                    <span className='mt-0.5 block text-sm text-muted-foreground'>
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}
                    aria-hidden='true'
                  >
                    {isSelected && (
                      <span className='h-2.5 w-2.5 rounded-full bg-primary-foreground' />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type='button'
            onClick={handleContinue}
            disabled={!selected}
            className='mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,96,76,0.6)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ChooseCategoryPage() {
  return (
    <Suspense fallback={<div className='min-h-dvh bg-background' />}>
      <ChooseCategoryContent />
    </Suspense>
  );
}
