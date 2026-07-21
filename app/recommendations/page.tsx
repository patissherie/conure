'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MapPin, DollarSign, Car, Heart, ThumbsDown, Star } from 'lucide-react'
import { HuddleLogo } from '../../src/components/huddle-logo'
import { MemberAvatar } from '../../src/components/member-avatar'

type Recommendation = {
  name: string
  category: string
  rating: number
  description: string
  location: string
  price: string
  distance: string
  image: string
}

const FOOD: Recommendation[] = [
  {
    name: "Grill'd",
    category: 'Burgers',
    rating: 4,
    description: 'Healthy burgers made with local produce and a relaxed, feel-good vibe.',
    location: 'Bondi Junction',
    price: '$$',
    distance: '1.2 km',
    image: '/juicy-gourmet-burger.png',
  },
  {
    name: "Betty's Burgers",
    category: 'Burgers',
    rating: 5,
    description: 'Classic shack-style burgers, crinkle-cut fries and thick creamy shakes.',
    location: 'Surry Hills',
    price: '$$',
    distance: '2.4 km',
    image: '/classic-cheeseburger-and-fries.png',
  },
  {
    name: 'Sushi Hub',
    category: 'Japanese',
    rating: 4,
    description: 'Fresh sushi rolls, sashimi and bento boxes made to order all day.',
    location: 'CBD',
    price: '$',
    distance: '0.8 km',
    image: '/fresh-sushi-platter.png',
  },
  {
    name: 'Vapiano',
    category: 'Italian',
    rating: 4,
    description: 'Made-to-order pasta and pizza in a lively, casual dining space.',
    location: 'Darling Harbour',
    price: '$$',
    distance: '3.1 km',
    image: '/fresh-pasta-and-pizza.png',
  },
  {
    name: 'Pancakes on the Rocks',
    category: 'Desserts',
    rating: 5,
    description: 'Iconic sweet and savoury pancakes served in a cosy heritage setting.',
    location: 'The Rocks',
    price: '$$',
    distance: '4.0 km',
    image: '/stack-of-pancakes-with-syrup.png',
  },
]

const ACTIVITY: Recommendation[] = [
  {
    name: 'Escape Room',
    category: 'Puzzle',
    rating: 5,
    description: 'Team up to crack clues and escape a themed room before time runs out.',
    location: 'Newtown',
    price: '$$',
    distance: '2.0 km',
    image: '/mysterious-escape-room.png',
  },
  {
    name: 'Bowling',
    category: 'Sport',
    rating: 4,
    description: 'Ten-pin bowling lanes with arcade games and shared snacks nearby.',
    location: 'Moore Park',
    price: '$$',
    distance: '3.5 km',
    image: '/bowling-alley-lanes.png',
  },
  {
    name: 'Mini Golf',
    category: 'Outdoor',
    rating: 4,
    description: 'Playful 18-hole mini golf course with fun obstacles for everyone.',
    location: 'Darling Harbour',
    price: '$',
    distance: '3.0 km',
    image: '/colorful-mini-golf-course.png',
  },
  {
    name: 'Karaoke',
    category: 'Music',
    rating: 5,
    description: 'Private karaoke rooms with thousands of songs and table service.',
    location: 'CBD',
    price: '$$',
    distance: '1.0 km',
    image: '/karaoke-room-with-neon-lights.png',
  },
  {
    name: 'Axe Throwing',
    category: 'Adventure',
    rating: 4,
    description: 'Coached axe-throwing lanes for some friendly, competitive fun.',
    location: 'Alexandria',
    price: '$$',
    distance: '4.5 km',
    image: '/axe-throwing-target.png',
  },
]

function getRecommendations(category: string | null): Recommendation[] {
  if (category === 'activity') return ACTIVITY
  if (category === 'surprise') {
    return [FOOD[0], ACTIVITY[0], FOOD[2], ACTIVITY[2], FOOD[4]]
  }
  return FOOD
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? 'fill-honey text-honey' : 'fill-muted text-muted'}
          width={16}
          height={16}
        />
      ))}
    </div>
  )
}

function RecommendationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  const recommendations = useMemo(() => getRecommendations(category), [category])
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState<'yes' | 'no' | null>(null)

  const current = recommendations[index]

  function handleVote(vote: 'yes' | 'no') {
    if (leaving) return
    setLeaving(vote)
    window.setTimeout(() => {
      if (index + 1 >= recommendations.length) {
        router.push('/voting-results')
      } else {
        setIndex((i) => i + 1)
        setLeaving(null)
      }
    }, 250)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <HuddleLogo className="h-7 w-7" />
          <span className="font-serif text-xl font-bold text-foreground">Huddle</span>
        </div>
        <MemberAvatar name="Matt" index={2} className="h-11 w-11 text-sm" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16">
        <div className="rounded-3xl bg-card p-6 shadow-[0_20px_50px_-20px_rgba(61,43,36,0.25)] sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <button
            type="button"
            onClick={() => {
                if (index > 0) {
                setIndex((i) => i - 1)
                } else {
                router.push("/choose-category")
                }
            }}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
            </button>
            <span className="text-sm font-semibold text-muted-foreground">
              {index + 1} of {recommendations.length}
            </span>
          </div>

          <div
            className={`transition-all duration-200 ${
              leaving === 'yes'
                ? 'translate-x-6 rotate-2 opacity-0'
                : leaving === 'no'
                  ? '-translate-x-6 -rotate-2 opacity-0'
                  : 'translate-x-0 rotate-0 opacity-100'
            }`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary">
              <Image
                src={current.image || '/placeholder.svg'}
                alt={current.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {current.category}
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-balance">
                {current.name}
              </h1>
              <div className="mt-2">
                <StarRating rating={current.rating} />
              </div>
              <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
                {current.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {current.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {current.price}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-primary" />
                  {current.distance}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleVote('no')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-6 py-4 text-base font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 active:scale-[0.99]"
            >
              <ThumbsDown className="h-5 w-5" />
              No
            </button>
            <button
              type="button"
              onClick={() => handleVote('yes')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,96,76,0.6)] transition-all hover:brightness-105 active:scale-[0.99]"
            >
              <Heart className="h-5 w-5 fill-current" />
              Yes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <RecommendationsContent />
    </Suspense>
  )
}
