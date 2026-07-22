'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Copy, Check, UserPlus } from 'lucide-react';
import { HuddleLogo } from '../../../src/components/huddle-logo';
import { MemberList, type Member } from '../../../src/components/member-list';
import { SyncProgress } from '../../../src/components/sync-progress';
import { MemberAvatar } from '../../../src/components/member-avatar';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/lib/useUser';

type Event = {
  id: string;
  title: string;
  status: string;
};

export default function GroupDashboardPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!groupId) return;

    async function loadGroup() {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          name,
          description,
          group_code,
          group_members(
            user_id,
            users(name)
          )
        `)
        .eq('id', groupId)
        .single();

        if (!error && data) {
          setGroupName(data.name);
          setDescription(data.description ?? '')
          setInviteCode(data.group_code ?? '');
          const memberList: Member[] = (data.group_members ?? []).map(
            (m: any) => ({
              name: m.users?.name ?? 'Unknown',
              connected: true, // placeholder — no real "calendar connected" concept yet
            }),
          );
          setMembers(memberList);
        }

        const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, title, status")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

        if (!eventError && eventData) {
          setEvents(eventData);
        }

        setLoading(false);
    }

    loadGroup();
  }, [groupId]);

  if (loading) return <p className='p-8'>Loading...</p>;

  const connectedCount = members.filter((m) => m.connected).length;
  const everyoneConnected = connectedCount === members.length;

  async function copyInviteCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className='min-h-dvh bg-background text-foreground'>
      <header className='mx-auto flex max-w-2xl items-center justify-between px-5 py-6'>
        <div className='flex items-center gap-3'>
          <HuddleLogo className='h-10 w-10' />
          <span className='font-serif text-3xl font-bold tracking-tight text-foreground'>
            Huddle
          </span>
        </div>

        <div className='flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card shadow-sm ring-1 ring-border'>
          <MemberAvatar
            name={user?.user_metadata?.full_name ?? 'User'}
            index={1}
            className='h-11 w-11 text-sm'
          />
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl px-5 pb-16'>
        <Link
          href='/dashboard'
          className='mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' strokeWidth={2.5} />
          Back to dashboard
        </Link>

        <div className='rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8'>
          <header className='mb-6'>
            <h1 className='font-serif text-3xl font-bold tracking-tight text-balance'>
              {groupName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {description || "Plan your next hangout together."}
            </p>

            <div className='mt-6 rounded-2xl border border-border bg-secondary/60 p-5'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <UserPlus className='h-5 w-5 text-primary' />
                    <h2 className='font-serif text-lg font-bold'>
                      Invite Friends
                    </h2>
                  </div>

                  <p className='mt-1 text-sm text-muted-foreground'>
                    Share this code so others can join the group.
                  </p>
                </div>

                <button
                  onClick={copyInviteCode}
                  disabled={!inviteCode}
                  className='rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <span className='flex items-center gap-2'>
                    {copied ? (
                      <>
                        <Check className='h-4 w-4 text-green-600' />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4' />
                        Copy
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className='mt-5 rounded-xl border-2 border-dashed border-primary bg-card py-5 text-center'>
                <p className='text-xs uppercase tracking-widest text-muted-foreground'>
                  Group Code
                </p>

                <p className='mt-2 font-mono text-3xl font-bold tracking-[0.25em] text-primary'>
                  {inviteCode || '——————'}
                </p>
              </div>
            </div>

            <div className='my-6 h-px bg-border' />
          </header>

          <div className='my-6 h-px bg-border' />

          <section
            aria-labelledby='members-title'
            className='flex flex-col gap-4'
          >
            <div className='flex items-center justify-between'>
              <h2
                id='members-title'
                className='font-serif text-lg font-bold text-foreground'
              >
                Members
              </h2>
              <span className='text-sm font-semibold text-muted-foreground'>
                {members.length} people
              </span>
            </div>
            <MemberList members={members} />
          </section>

          <div className='my-6 h-px bg-border' />

          <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">
              Events
            </h2>

            <Link
              href={`/group-dashboard/${groupId}/events/new`}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              + New Event
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/event-dashboard/${event.id}`}
                className="block rounded-2xl border border-border bg-secondary p-4 hover:bg-accent"
              >
                <h3 className="font-semibold">
                  {event.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {event.status}
                </p>
              </Link>
            ))}

            {events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No events yet.
              </p>
            )}
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
