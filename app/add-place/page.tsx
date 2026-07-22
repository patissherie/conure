"use client"

import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { HuddleLogo } from "../../src/components/huddle-logo"
import { MemberAvatar } from "../../src/components/member-avatar"
import { useUser } from "@/lib/useUser"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

const categories = [
  "Burgers",
  "Japanese",
  "Italian",
  "Dessert",
  "Café",
  "Activity",
  "Other",
]

const fieldClasses =
  "h-12 w-full rounded-xl border border-border bg-secondary px-4 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"

export default function AddPlacePage() {
  const { user } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [mapsUrl, setMapsUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError("You must be logged in.")
      return
    }
    if (!name || !category) {
      setError("Place name and category are required.")
      return
    }

    setSaving(true)

    // 1. Create the place itself
    const { data: place, error: placeError } = await supabase
      .from("places")
      .insert({
        name,
        category,
        address: location || null,
        external_source: "manual",
        // storing the maps URL isn't in the current schema —
        // add a `maps_url` column if you want to persist this field
      })
      .select()
      .single()

    if (placeError || !place) {
      setError(placeError?.message ?? "Failed to save place.")
      setSaving(false)
      return
    }

    // 2. Link it into the shared wishlist
    const { error: saveError } = await supabase.from("saved_want_to_go").insert({
      place_id: place.id,
      added_by: user.id,
      group_id: null, // wishlist is global now, not group-scoped
    })

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    router.push("/saved-places")
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <HuddleLogo className="h-10 w-10" />
          <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Huddle
          </span>
        </div>

        <MemberAvatar name="Matt" index={2} className="h-11 w-11 text-sm" />
      </header>

      <main className="mx-auto w-full max-w-xl px-6 pb-16">
        <Link
          href="/saved-places"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div className="mt-6">
          <h1 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Add New Place
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            {"Save a place you'd like to visit with your friends."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-card p-6 shadow-[0_16px_48px_-28px_rgba(58,42,34,0.35)] sm:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="place-name" className="text-sm font-semibold text-foreground">
                Place Name
              </label>
              <input
                id="place-name"
                type="text"
                placeholder="e.g. Grill'd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-semibold text-foreground">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${fieldClasses} appearance-none pr-11`}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm font-semibold text-foreground">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Bondi Junction, NSW"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="maps-url" className="text-sm font-semibold text-foreground">
                Google Maps URL{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="maps-url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="mt-8 h-12 w-full rounded-xl text-base font-semibold"
          >
            {saving ? "Saving..." : "Save Place"}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Saved places can be used for future group hangouts.
          </p>
        </form>
      </main>
    </div>
  )
}
