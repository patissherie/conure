"use client"

import { useEffect, useState } from 'react'
import { Plus, User, Users } from "lucide-react"
import { DashboardNav } from "@/src/components/dashboard-nav"
import { GroupCard, type Group } from "@/src/components/group-card"
import { EmptyGroups } from "@/src/components/empty-groups"
import { JoinGroupModal } from "@/src/components/join-group-modal"
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { useUser } from '@/lib/useUser'
import { supabase } from '@/lib/supabaseClient'

export function DashboardHome() {
  const { user } = useUser()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    
    // const user_name = user.user_metadata
    async function loadGroups() {
    if (!user) return
  
    const { data, error } = await supabase
      .from('group_members')
      .select('groups(id, name, group_members(user_id, users(name, avatar_url)))')
      .eq('user_id', user.id)
  
    if (error || !data) {
      setLoading(false)
      return
    }
  
    // For each group, fetch its most recent event (if any) + rsvps + confirmed place
    const shaped: Group[] = await Promise.all(
      data.map(async (row: any) => {
        const g = row.groups
        const memberCount = g.group_members?.length ?? 0
        const memberNames = g.group_members?.map((m: any) => m.users?.name).filter(Boolean) ?? []
        const avatars = g.group_members?.map((m: any) => m.users?.avatar_url).filter(Boolean) ?? []
  
        // Get the most recent event for this group
        const { data: events } = await supabase
          .from('events')
          .select('*, rsvps(status), places:confirmed_place_id(name)')
          .eq('group_id', g.id)
          .order('created_at', { ascending: false })
          .limit(1)
  
        const event = events?.[0]
  
        let stage: Group['stage'] = 'finding'
        let message = 'No hangout planned yet — start one!'
  
        if (event) {
          const rsvps = event.rsvps ?? []
          const yesCount = rsvps.filter((r: any) => r.status === 'yes').length
  
          if (event.status === 'planning') {
            stage = 'finding'
            message = `${yesCount} of ${memberCount} members submitted availability.`
          } else if (event.status === 'time_locked') {
            stage = 'voting'
            message = 'Everyone is free! Time to vote on an activity.'
          } else if (event.status === 'place_locked' || event.status === 'done') {
            stage = 'confirmed'
            const placeName = event.places?.name
            const when = event.confirmed_time
              ? new Date(event.confirmed_time).toLocaleString(undefined, {
                  weekday: 'long',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : ''
            message = placeName
              ? `Hangout confirmed at ${placeName}${when ? ` on ${when}` : ''}.`
              : `Hangout confirmed${when ? ` for ${when}` : ''}.`
          }
        }
  
        return {
          id: g.id,
          name: g.name,
          members: memberCount,
          memberNames,
          avatars,
          stage,
          message,
        }
      })
    )


    setGroups(shaped)
    setLoading(false)
  }

    loadGroups()
  }, [loading, user, router])
  if (loading || !user) return <p className="p-8">Loading...</p>
  

  const hasGroups = groups.length > 0

  return (
      
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <DashboardNav />

      <section className="mt-10">
        
        <h1 className="text-pretty font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Good afternoon, {user?.user_metadata?.full_name.split(' ')[0]} {" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h1>

        <p className="mt-2 text-base text-muted-foreground">
          Ready to plan your next hangout?
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <a
          href="/groups/new"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_12px_26px_-10px_rgba(232,96,76,0.65)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </a>

        <JoinGroupModal />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Your Groups
        </h2>

        {hasGroups ? (
          <div className="mt-4 flex flex-col gap-4">
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        ) : (
          <EmptyGroups />
        )}
      </section>
      <Button
        onClick={handleLogout}
        
        className="mt-2 h-20 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(232,96,76,0.6)] hover:bg-primary/90"
      >
        
        Log Out
      </Button>
    </main>
  )
}