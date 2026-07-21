import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, MapPin, X, Plus } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { HuddleLogo } from "../../src/components/huddle-logo"
import { MemberAvatar } from "../../src/components/member-avatar"

// Hardcoded demo data — frontend only.
const savedPlaces = [
  {
    id: 1,
    name: "Grill'd",
    category: "Burgers",
    rating: 4,
    location: "Bondi Junction, NSW",
    image: "/grilld-venue.png",
  },
  {
    id: 2,
    name: "Sushi Hub",
    category: "Japanese",
    rating: 5,
    location: "Town Hall, Sydney",
    image: "/sushi-hub.png",
  },
  {
    id: 3,
    name: "Pancakes on the Rocks",
    category: "Dessert",
    rating: 4,
    location: "The Rocks, Sydney",
    image: "/pancakes.png",
  },
  {
    id: 4,
    name: "Escape Room",
    category: "Activity",
    rating: 5,
    location: "Darling Harbour, Sydney",
    image: "/escape-room.png",
  },
]

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
          {savedPlaces.map((place) => (
            <li
              key={place.id}
              className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-[0_16px_48px_-28px_rgba(58,42,34,0.35)] sm:p-4"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
                <Image
                  src={place.image || "/placeholder.svg"}
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
                <div className="mt-1">
                  <Rating value={place.rating} name={place.name} />
                </div>
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
