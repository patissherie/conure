import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getGroupMembers,
  pickPrimarySuburb,
  getGroupSwipeAffinitySignals,
  getGroupSavedBeenAffinitySignals,
} from './queries'
import {
  buildAffinityMap,
  computeTotalScore,
  getCategoryBucket,
  type CandidatePlace,
  type CategoryBucket,
  type MemberPrefs,
} from './scoring'

export type PlaceRow = {
  id: string
  name: string
  category: string | null
  price_level: number | null
  lat: number | null
  lng: number | null
  address: string | null
  photo_url: string | null
}

export type Recommendation = {
  id: string
  name: string
  category: string
  rating: number
  description: string
  location: string
  price: string
  image: string
  scores: { preference: number; budget: number; history: number; total: number }
}

const PRICE_SYMBOLS = ['$', '$$', '$$$', '$$$$']

/**
 * Builds the top `limit` place recommendations for a group, filtered to
 * `bucket` ('food' | 'activity'), or unfiltered for 'surprise'.
 */
export async function getTopRecommendations(
  supabase: SupabaseClient,
  groupId: string,
  bucket: CategoryBucket | 'surprise',
  limit = 5,
): Promise<Recommendation[]> {
  const members = await getGroupMembers(supabase, groupId)
  if (members.length === 0) return []

  const primarySuburb = pickPrimarySuburb(members)

  let placesQuery = supabase
    .from('places')
    .select('id, name, category, price_level, lat, lng, address, photo_url')

  // Best-effort proximity: `address` is free text, so this is a loose
  // substring match on the group's most common suburb — not real geo-distance.
  // Swap for a lat/lng radius query once you're storing verified coordinates
  // for users (today `users` only has a suburb name, not lat/lng).
  if (primarySuburb) {
    placesQuery = placesQuery.ilike('address', `%${primarySuburb}%`)
  }

  const { data: allPlaces, error } = await placesQuery
  if (error) throw error

  const candidates: PlaceRow[] =
    bucket === 'surprise'
      ? (allPlaces as PlaceRow[])
      : (allPlaces as PlaceRow[]).filter((p) => getCategoryBucket(p.category) === bucket)

  if (candidates.length === 0) return []

  const [swipeSignals, savedBeenSignals] = await Promise.all([
    getGroupSwipeAffinitySignals(supabase, groupId),
    getGroupSavedBeenAffinitySignals(supabase, groupId),
  ])
  const affinity = buildAffinityMap([...swipeSignals, ...savedBeenSignals])

  const memberPrefs: MemberPrefs[] = members.map((m) => ({
    budget_min: m.budget_min,
    budget_max: m.budget_max,
    cuisine_tags: m.cuisine_tags,
    activity_tags: m.activity_tags,
  }))

  const scored = candidates.map((place) => {
    const candidate: CandidatePlace = { category: place.category, price_level: place.price_level }
    const scores = computeTotalScore(candidate, memberPrefs, affinity)
    return { place, scores }
  })

  scored.sort((a, b) => b.scores.total - a.scores.total)

  return scored.slice(0, limit).map(({ place, scores }) => ({
    id: place.id,
    name: place.name,
    category: place.category ?? 'Uncategorized',
    // Total score is already a 0-1 blend of preference/budget/history fit —
    // reusing it as a 1-5 "rating" for the UI rather than inventing a
    // separate number. Swap this out if you add real place ratings later.
    rating: Math.max(1, Math.min(5, Math.round(scores.total * 5) || 1)),
    // Places has no description column today, so this is generated copy,
    // not a fact about the place — replace with a real column if you add one.
    description: `A ${(place.category ?? 'local').toLowerCase()} pick your group is likely to enjoy.`,
    location: place.address ?? '',
    price: place.price_level ? PRICE_SYMBOLS[Math.min(Math.max(place.price_level, 1), 4) - 1] : '',
    image: place.photo_url || '/placeholder.svg',
    scores,
  }))
}