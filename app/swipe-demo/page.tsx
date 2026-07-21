'use client'

// EXAMPLE / STARTER PAGE — copy this into app/swipe/[eventId]/page.tsx
// and adapt. This proves the DB connection + swipe flow work end to end.
//
// Uses the seeded demo event: cccccccc-0000-0000-0000-000000000001
// which already has 5 options and partial swipes (Taco Libre is at 3/3 yes).

import { useEffect, useState } from 'react'
import { getSwipeOptions, castSwipe, subscribeToSwipes } from '@/lib/queries'
import type { SwipeOption } from '@/lib/types'

const DEMO_EVENT_ID = 'cccccccc-0000-0000-0000-000000000001'
const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111' // "Alex Chen"

export default function ExampleSwipePage() {
  const [options, setOptions] = useState<SwipeOption[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await getSwipeOptions(DEMO_EVENT_ID)
    setOptions(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const unsubscribe = subscribeToSwipes(DEMO_EVENT_ID, load)
    return unsubscribe
  }, [])

  async function handleSwipe(optionId: string, vote: boolean) {
    await castSwipe(optionId, DEMO_USER_ID, vote)
    // realtime subscription will refresh the list automatically
  }

  if (loading) return <p className="p-8">Loading options...</p>

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Swipe Round (demo)</h1>
      <div className="space-y-4">
        {options.map((opt) => {
          const yesCount = (opt.swipes ?? []).filter((s) => s.vote).length
          const noCount = (opt.swipes ?? []).filter((s) => !s.vote).length
          return (
            <div key={opt.id} className="border rounded-lg p-4 flex items-center gap-4">
              <img
                src={opt.places?.photo_url ?? ''}
                alt={opt.places?.name}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{opt.places?.name}</p>
                <p className="text-sm text-gray-500">
                  {opt.places?.category} · {'$'.repeat(opt.places?.price_level ?? 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {yesCount} yes · {noCount} no
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSwipe(opt.id, false)}
                  className="px-3 py-1 rounded bg-red-100 text-red-600"
                >
                  ✕
                </button>
                <button
                  onClick={() => handleSwipe(opt.id, true)}
                  className="px-3 py-1 rounded bg-green-100 text-green-600"
                >
                  ✓
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
