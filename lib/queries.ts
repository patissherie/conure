import { supabase } from './supabaseClient';
import type { ExternalPlace } from './googlePlaces';
import type {
  SwipeOption,
  SavedWantToGo,
  SavedBeen,
  Message,
  EventRow,
  Rsvp,
  Place,
} from './types';

// ---------------------------------------------------------
// EVENTS
// ---------------------------------------------------------
export async function getEvent(eventId: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data;
}

export async function getGroupEvents(groupId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------
// RSVPS  ("auto-find-the-time")
// ---------------------------------------------------------
export async function getEventRsvps(eventId: string): Promise<Rsvp[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return data ?? [];
}

export async function submitRsvp(eventId: string, userId: string, status: Rsvp['status'], availableTimes: string[]) {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert({ event_id: eventId, user_id: userId, status, available_times: availableTimes })
    .select()
    .single()
  if (error) throw error

  // Check if everyone in the group has now responded
  const { data: event } = await supabase.from('events').select('group_id').eq('id', eventId).single()
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', event?.group_id)
  const { count: rsvpCount } = await supabase
    .from('rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .neq('status', 'pending')

  if (rsvpCount === memberCount) {
    await supabase.from('events').update({ status: 'time_locked' }).eq('id', eventId)
  }

  return data
}

// ---------------------------------------------------------
// SWIPE ROUND
// ---------------------------------------------------------
export async function getSwipeOptions(eventId: string): Promise<SwipeOption[]> {
  const { data, error } = await supabase
    .from('swipe_options')
    .select('*, places(*), swipes(*)')
    .eq('event_id', eventId)
    .order('rank_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function castSwipe(optionId: string, userId: string, vote: boolean, eventId: string, requiredVoterIds: string[]) {
  const { data, error } = await supabase
    .from('swipes')
    .upsert({ option_id: optionId, user_id: userId, vote })
    .select()
    .single()
  if (error) throw error

  const matched = await getMatchedOptions(eventId, requiredVoterIds)
  if (matched.length > 0) {
    await supabase
      .from('events')
      .update({ status: 'place_locked', confirmed_place_id: matched[0].place_id })
      .eq('id', eventId)
  }

  return data
}

// Returns options where every RSVP'd "yes" member also swiped yes
export async function getMatchedOptions(
  eventId: string,
  requiredVoterIds: string[]
) {
  const options = await getSwipeOptions(eventId);
  return options.filter((opt) => {
    const yesVoters = (opt.swipes ?? [])
      .filter((s) => s.vote)
      .map((s) => s.user_id);
    return requiredVoterIds.every((id) => yesVoters.includes(id));
  });
}

// Live updates while everyone swipes — call this from a useEffect
export function subscribeToSwipes(eventId: string, onChange: () => void) {
  const channel = supabase
    .channel(`swipes-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'swipes' },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------
// SAVED COLLECTIONS
// ---------------------------------------------------------
export async function getWantToGo(groupId: string): Promise<SavedWantToGo[]> {
  const { data, error } = await supabase
    .from('saved_want_to_go')
    .select('*, places(*)')
    .eq('group_id', groupId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addWantToGo(
  groupId: string,
  placeId: string,
  addedBy: string
) {
  const { data, error } = await supabase
    .from('saved_want_to_go')
    .insert({ group_id: groupId, place_id: placeId, added_by: addedBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBeenTo(groupId: string): Promise<SavedBeen[]> {
  const { data, error } = await supabase
    .from('saved_been')
    .select('*, places(*)')
    .eq('group_id', groupId)
    .order('visited_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addBeenEntry(entry: {
  groupId: string;
  placeId: string;
  photoUrls: string[];
  rating: number;
  note: string;
  visitedAt: string;
  addedBy: string;
}) {
  const { data, error } = await supabase
    .from('saved_been')
    .insert({
      group_id: entry.groupId,
      place_id: entry.placeId,
      photo_urls: entry.photoUrls,
      rating: entry.rating,
      note: entry.note,
      visited_at: entry.visitedAt,
      added_by: entry.addedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------
// HUDDLE (chat)
// ---------------------------------------------------------
export async function getMessages(eventId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, users(*)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(
  eventId: string,
  userId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ event_id: eventId, user_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(
  eventId: string,
  onNewMessage: (msg: Message) => void
) {
  const channel = supabase
    .channel(`messages-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => onNewMessage(payload.new as Message)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------
// PLACES
// ---------------------------------------------------------

// Insert a place if new, or return the existing row if we've seen this
// external_source + external_id combo before. Never creates duplicates.
export async function upsertPlaceFromExternal(
  place: ExternalPlace
): Promise<Place> {
  const { data, error } = await supabase
    .from('places')
    .upsert(
      {
        name: place.name,
        category: place.category,
        price_level: place.price_level,
        lat: place.lat,
        lng: place.lng,
        address: place.address,
        photo_url: place.photo_url,
        external_source: place.external_source,
        external_id: place.external_id,
      },
      {
        onConflict: 'external_source,external_id',
        ignoreDuplicates: false, // if it exists, update it with fresh data instead of skipping
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Convenience: upsert a whole batch of search results at once
export async function upsertPlacesFromExternal(
  places: ExternalPlace[]
): Promise<Place[]> {
  const results: Place[] = [];
  for (const place of places) {
    const saved = await upsertPlaceFromExternal(place);
    results.push(saved);
  }
  return results;
}
