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


const GROUPS: Group[] = [
  {
    name: "Coffee Lovers",
    members: 4,
    memberNames: ["Tino", "Aditri", "Matt", "Sherleen"],
    stage: "voting",
    message: "Everyone is free! Time to vote on an activity.",
  },
  {
    name: "Friday Fun",
    members: 5,
    memberNames: ["Tino", "Aditri", "Matt", "Sherleen", "Random"],
    stage: "finding",
    message: "3 of 5 members submitted availability.",
  },
  {
    name: "Foodies",
    members: 3,
    memberNames: ["Tino", "Aditri", "Sherleen"],
    stage: "confirmed",
    message: "Hangout confirmed for Friday at 7:00 PM.",
  },
]

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
    const { data, error } = await supabase
      .from('group_members')
      .select('groups(id, name, group_members(user_id, users(name, avatar_url)))')
      .eq('user_id', user?.id)
    
    if (error || !data) {
      setLoading(false)
      return
    }
    const shaped: Group[] = data.map((row: any) => {
      const g = row.groups
      return {
        name: g.name,
        members: g.group_members?.length ?? 0,
        memberNames: g.group_members?.map((m: any) => m.users?.name).filter(Boolean) ?? [],
        avatars: g.group_members?.map((m: any) => m.users?.avatar_url).filter(Boolean) ?? [],
        stage: "finding",   // placeholder — you don't have a "stage" concept in your schema yet
        message: "",         // placeholder — same issue
      }
    })

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