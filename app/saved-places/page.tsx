"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, MapPin, X, Plus } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { HuddleLogo } from "../../src/components/huddle-logo"
import { MemberAvatar } from "../../src/components/member-avatar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type SavedPlace = {
  savedId: string
  placeId: string
  name: string
  category: string | null
  location: string | null
  image: string | null
  addedByName: string | null
}

function Rating({ value, name }: { value: number; name: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars for ${name}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < value ? "size-4 fill-primary text-primary" : "size-4 fill-muted text-muted"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default function SavedPlacesPage() {
  const [places, setPlaces] = useState<SavedPlace[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPlaces() {
    const { data, error } = await supabase
      .from('saved_want_to_go')
      .select('id, place_id, places(name, category, address, photo_url), users:added_by(name)')
      .order('added_at', { ascending: false })

    if (!error && data) {
      const shaped: SavedPlace[] = data.map((row: any) => ({
        savedId: row.Id,
        placeId: row.place_id,
        name: row.places?.name ?? 'Unknown place',
        category: row.places?.category ?? '',
        location: row.places?.address ?? '',
        image: row.places?.photo_url ?? null,
        addedByName: row.users?.name ?? null,
      }))
      setPlaces(shaped)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPlaces()
  }, [])

  async function handleRemove(savedId: string) {
    const { error } = await supabase.from('saved_want_to_go').delete().eq('id', savedId)
    if (!error) {
      setPlaces((prev) => prev.filter((p) => p.savedId !== savedId))
    }
  }

  if (loading) return <p className="p-8">Loading...</p>

  if (loading) return <p className="p-8">Loading...</p>
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
            <HuddleLogo className="h-10 w-10" />
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Huddle
            </span>
        </div>

        <MemberAvatar
            name="Matt"
            index={2}
            className="h-11 w-11 text-sm"
        />
      </header>

      <main className="mx-auto w-full max-w-xl px-6 pb-16">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Saved Places
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            {"Places you've saved for future hangouts."}
          </p>
        </div>

        {/* List of saved places */}
        <ul className="mt-8 flex flex-col gap-4">
          {places.map((place) => (
            <li
              key={place.placeId}
              className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-[0_16px_48px_-28px_rgba(58,42,34,0.35)] sm:p-4"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
                <Image
                  src={place.image || "/location-placeholder.svg"}
                  alt={`Photo of ${place.name}`}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-serif text-lg font-bold text-foreground">
                  {place.name}
                </h2>
                <p className="text-sm font-medium text-primary">{place.category}</p>
                {/* <div className="mt-1">
                  <Rating value={place} name={place.name} />
                </div> */}
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{place.location}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={`Remove ${place.name}`}
                onClick={() => handleRemove(place.savedId)}
              >
                <X className="size-5" />
              </Button>
            </li>
          ))}
        </ul>

        {/* Add new place */}
        <Link href="/add-place">
            <Button
                size="lg"
                className="mt-8 h-12 w-full rounded-xl text-base font-semibold"
            >
                <Plus className="size-5" />
                Add New Place
            </Button>
        </Link>
      </main>
    </div>
  )
}
