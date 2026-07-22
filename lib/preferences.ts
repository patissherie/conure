import type { SupabaseClient } from '@supabase/supabase-js';
import type { MemberPrefs, AffinitySignal } from './scoring';

export async function getGroupMembers(
  supabase: SupabaseClient,
  groupId: string,
) {
  const { data: memberRows, error: mErr } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  if (mErr) throw mErr;

  const userIds = memberRows.map((r) => r.user_id);
  if (userIds.length === 0)
    return [] as (MemberPrefs & {
      id: string;
      location_suburb: string | null;
    })[];

  const { data: users, error: uErr } = await supabase
    .from('users')
    .select(
      'id, budget_min, budget_max, cuisine_tags, activity_tags, location_suburb',
    )
    .in('id', userIds);
  if (uErr) throw uErr;
  return users;
}

/** Most common non-null suburb among members, used to anchor the Places search. */
export function pickPrimarySuburb(
  members: { location_suburb: string | null }[],
): string | null {
  const counts = new Map<string, number>();
  for (const m of members) {
    if (!m.location_suburb) continue;
    counts.set(m.location_suburb, (counts.get(m.location_suburb) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [suburb, count] of counts) {
    if (count > bestCount) {
      best = suburb;
      bestCount = count;
    }
  }
  return best;
}

/** Builds affinity signals from this group's past swipes (via swipe_options -> places). */
export async function getGroupSwipeAffinitySignals(
  supabase: SupabaseClient,
  groupId: string,
): Promise<AffinitySignal[]> {
  const { data: events, error: eErr } = await supabase
    .from('events')
    .select('id')
    .eq('group_id', groupId);
  if (eErr) throw eErr;
  const eventIds = events.map((e) => e.id);
  if (eventIds.length === 0) return [];

  const { data: options, error: oErr } = await supabase
    .from('swipe_options')
    .select('id, place_id')
    .in('event_id', eventIds);
  if (oErr) throw oErr;
  const optionToPlace = new Map(
    options.filter((o) => o.place_id).map((o) => [o.id, o.place_id as string]),
  );
  if (optionToPlace.size === 0) return [];

  const { data: swipes, error: sErr } = await supabase
    .from('swipes')
    .select('option_id, vote')
    .in('option_id', [...optionToPlace.keys()]);
  if (sErr) throw sErr;

  const placeIds = [...new Set([...optionToPlace.values()])];
  const { data: places, error: pErr } = await supabase
    .from('places')
    .select('id, category, price_level')
    .in('id', placeIds);
  if (pErr) throw pErr;
  const placesById = new Map(places.map((p) => [p.id, p]));

  return swipes
    .map((s) => {
      const placeId = optionToPlace.get(s.option_id);
      const place = placeId ? placesById.get(placeId) : undefined;
      if (!place) return null;
      return {
        category: place.category,
        price_level: place.price_level,
        weight: s.vote ? 1 : -1,
      };
    })
    .filter((s): s is AffinitySignal => s !== null);
}

/** Builds affinity signals from saved_been ratings (rating 1-5 -> weight -1..+1). */
export async function getGroupSavedBeenAffinitySignals(
  supabase: SupabaseClient,
  groupId: string,
): Promise<AffinitySignal[]> {
  const { data: saved, error } = await supabase
    .from('saved_been')
    .select('place_id, rating, places(category, price_level)')
    .eq('group_id', groupId);
  if (error) throw error;

  return saved
    .filter((s) => s.rating != null && s.places)
    .map((s) => {
      const place = Array.isArray(s.places) ? s.places[0] : s.places;
      return {
        category: place?.category ?? null,
        price_level: place?.price_level ?? null,
        weight: ((s.rating as number) - 3) / 2,
      };
    });
}

/** Each member's individually saved want-to-go categories, used as extra preference signal. */
export async function getMemberWantToGoCategories(
  supabase: SupabaseClient,
  memberIds: string[],
): Promise<string[]> {
  if (memberIds.length === 0) return [];
  const { data, error } = await supabase
    .from('saved_want_to_go')
    .select('added_by, places(category)')
    .in('added_by', memberIds);
  if (error) throw error;

  return data
    .map((row) => {
      const place = Array.isArray(row.places) ? row.places[0] : row.places;
      return place?.category ?? null;
    })
    .filter((c): c is string => c !== null);
}
