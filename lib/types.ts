// Mirrors 01_schema.sql — keep these in sync if the schema changes

export type User = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  budget_min: number
  budget_max: number
  cuisine_tags: string[]
  activity_tags: string[]
  created_at: string
}

export type Group = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export type Place = {
  id: string
  name: string
  category: string | null
  price_level: number | null
  lat: number | null
  lng: number | null
  address: string | null
  photo_url: string | null
  external_source: string | null
  external_id: string | null
  created_at: string
}

export type EventRow = {
  id: string
  group_id: string
  title: string
  proposed_times: string[]
  confirmed_time: string | null
  confirmed_place_id: string | null
  status: 'planning' | 'time_locked' | 'place_locked' | 'done'
  created_at: string
}

export type Rsvp = {
  event_id: string
  user_id: string
  status: 'pending' | 'yes' | 'no' | 'maybe'
  available_times: string[]
  responded_at: string
}

export type SwipeOption = {
  id: string
  event_id: string
  place_id: string
  rank_order: number | null
  created_at: string
  places?: Place
  swipes?: Swipe[]
}

export type Swipe = {
  option_id: string
  user_id: string
  vote: boolean
  swiped_at: string
}

export type SavedWantToGo = {
  id: string
  group_id: string
  place_id: string
  added_by: string
  added_at: string
  places?: Place
}

export type SavedBeen = {
  id: string
  group_id: string
  place_id: string
  photo_urls: string[]
  rating: number | null
  note: string | null
  visited_at: string | null
  added_by: string
  created_at: string
  places?: Place
}

export type Message = {
  id: string
  event_id: string
  user_id: string
  content: string
  created_at: string
  users?: User
}
