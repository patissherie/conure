import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "../../src/components/ui/button"
import { HuddleLogo } from "../../src/components/huddle-logo"
import { MemberAvatar } from "../../src/components/member-avatar"

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
          href="/saved-places"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Add New Place
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            {"Save a place you'd like to visit with your friends."}
          </p>
        </div>

        {/* Form card */}
        <form className="mt-8 rounded-2xl bg-card p-6 shadow-[0_16px_48px_-28px_rgba(58,42,34,0.35)] sm:p-8">
          <div className="flex flex-col gap-5">
            {/* Place Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="place-name" className="text-sm font-semibold text-foreground">
                Place Name
              </label>
              <input
                id="place-name"
                type="text"
                placeholder="e.g. Grill'd"
                className={fieldClasses}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-semibold text-foreground">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  defaultValue=""
                  className={`${fieldClasses} appearance-none pr-11`}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm font-semibold text-foreground">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Bondi Junction, NSW"
                className={fieldClasses}
              />
            </div>

            {/* Google Maps URL */}
            <div className="flex flex-col gap-2">
              <label htmlFor="maps-url" className="text-sm font-semibold text-foreground">
                Google Maps URL{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="maps-url"
                type="url"
                placeholder="https://maps.google.com/..."
                className={fieldClasses}
              />
            </div>
          </div>

          {/* Save button */}
          <Button
            type="submit"
            size="lg"
            className="mt-8 h-12 w-full rounded-xl text-base font-semibold"
          >
            Save Place
          </Button>

          {/* Note */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Saved places can be used for future group hangouts.
          </p>
        </form>
      </main>
    </div>
  )
}
