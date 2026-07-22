'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Info, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { generateGroupCode } from '@/lib/groupCode';

const MAX_CODE_ATTEMPTS = 5;

export function CreateGroupCard() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Who's creating this group? Needed for created_by + the
      // creator's own group_members row.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You need to be signed in to create a group.');
        return;
      }

      // 2. Insert the group itself, generating a unique 6-character invite
      // code. On the rare chance of a collision (unique_violation, Postgres
      // code 23505), regenerate and retry rather than failing outright.
      // NOTE: `description` isn't in the schema you showed me earlier
      // (groups: id, name, created_by, created_at). Either run the
      // migration mentioned previously to add it, or delete the
      // `description` line below if you don't need it yet.
      let group: { id: string; [key: string]: unknown } | null = null;
      let groupError: { code?: string; message?: string } | null = null;

      for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
        const { data, error } = await supabase
          .from('groups')
          .insert({
            name: trimmedName,
            description: description.trim() || null,
            created_by: user.id,
            group_code: generateGroupCode(),
          })
          .select()
          .single();

        if (!error) {
          group = data;
          groupError = null;
          break;
        }

        groupError = error;
        if (error.code !== '23505') break; // only retry on code collisions
      }

      if (groupError || !group) {
        throw groupError ?? new Error('Group was not created.');
      }

      // 3. Add the creator as the group's first member. Without this,
      // the group would exist but the creator wouldn't be in it.
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) {
        // Group row already exists at this point but membership failed -
        // surface the error rather than silently leaving an orphaned,
        // memberless group.
        throw memberError;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('[create-group] failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong creating the group.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='w-full max-w-lg rounded-[24px] bg-card px-8 py-10 shadow-[0_24px_60px_-20px_rgba(61,43,36,0.35)] sm:px-10'>
      <div className='mb-8 text-center'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent'>
          <Users className='h-7 w-7 text-primary' />
        </div>
        <h1 className='font-serif text-3xl font-bold text-foreground text-balance'>
          Create a New Group
        </h1>
        <p className='mt-2 text-base text-muted-foreground text-pretty'>
          Start planning your next hangout with friends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1.5'>
          <label
            htmlFor='groupName'
            className='text-sm font-semibold text-foreground'
          >
            {'Group Name '}
            <span className='text-primary'>*</span>
          </label>
          <input
            id='groupName'
            type='text'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Coffee Lovers'
            className='h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30'
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <label
            htmlFor='description'
            className='text-sm font-semibold text-foreground'
          >
            {'Description '}
            <span className='font-normal text-muted-foreground'>
              (optional)
            </span>
          </label>
          <textarea
            id='description'
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='What is this group for?'
            className='w-full resize-none rounded-2xl border border-input bg-muted/40 px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30'
          />
        </div>

        {error && (
          <div className='rounded-xl bg-destructive/10 px-3.5 py-3 text-sm font-medium text-destructive'>
            {error}
          </div>
        )}

        <div className='flex items-center gap-2 rounded-xl bg-accent/60 px-3.5 py-3'>
          <Info className='h-4 w-4 shrink-0 text-primary' />
          <p className='text-sm text-muted-foreground'>
            You can invite friends after creating your group.
          </p>
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='mt-1 h-14 w-full gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(232,96,76,0.6)] hover:bg-primary/90 disabled:opacity-70'
        >
          {isSubmitting ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <Plus className='h-5 w-5' />
          )}
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </Button>

        <a
          href='/dashboard'
          className='mx-auto text-sm font-semibold text-muted-foreground transition hover:text-foreground'
        >
          Cancel
        </a>
      </form>
    </div>
  );
}
