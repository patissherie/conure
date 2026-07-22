'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { HuddleLogo } from '../../../src/components/huddle-logo'
import { MemberList, type Member } from '../../../src/components/member-list'
import { SyncProgress } from '../../../src/components/sync-progress'
import { MemberAvatar } from '../../../src/components/member-avatar'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function GroupDashboardPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) return

    async function loadGroup() {
      const { data, error } = await supabase
        .from('groups')
        .select('name, group_members(user_id, users(name))')
        .eq('id', groupId)
        .single()

      if (!error && data) {
        setGroupName(data.name)
        const memberList: Member[] = (data.group_members ?? []).map((m: any) => ({
          name: m.users?.name ?? 'Unknown',
          connected: true, // placeholder — no real "calendar connected" concept yet
        }))
        setMembers(memberList)
      }
      setLoading(false)
    }

    loadGroup()
  }, [groupId])

  if (loading) return <p className="p-8">Loading...</p>

  const connectedCount = members.filter((m) => m.connected).length
  const everyoneConnected = connectedCount === members.length

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <HuddleLogo className="h-10 w-10" />
          <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Huddle
          </span>
        </div>

        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card shadow-sm ring-1 ring-border">
          <MemberAvatar name="Matt" index={1} className="h-11 w-11 text-sm" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to dashboard
        </Link>

        <div className="rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8">
          <header className="mb-6">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-balance">
              {groupName}
            </h1>
            <p className="mt-1 text-muted-foreground">Plan your next hangout together.</p>
          </header>

          <div className="my-6 h-px bg-border" />

          <section aria-labelledby="members-title" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 id="members-title" className="font-serif text-lg font-bold text-foreground">
                Members
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">
                {members.length} people
              </span>
            </div>
            <MemberList members={members} />
          </section>

          <div className="my-6 h-px bg-border" />

          <SyncProgress connected={connectedCount} total={members.length} />

          <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/suggested-time?groupId=${groupId}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,96,76,0.6)] transition-all hover:brightness-105"
          >
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            Find Our Time
          </Link>
            {!everyoneConnected && (
              <p className="text-sm text-muted-foreground">
                Waiting for everyone to connect their calendars.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}