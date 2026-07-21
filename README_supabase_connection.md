# Starter Connection Code

Pairs with `01_schema.sql` + `02_seed.sql` from before. This is the frontend-side
code that talks to Supabase.


## What's in `queries.ts`

Grouped by feature so you're not writing raw Supabase calls in your components:

- **Events** — `getEvent`, `getGroupEvents`
- **RSVPs** (auto-find-the-time) — `getEventRsvps`, `submitRsvp`
- **Swipe round** — `getSwipeOptions`, `castSwipe`, `getMatchedOptions`, `subscribeToSwipes`
- **Saved collections** — `getWantToGo`, `addWantToGo`, `getBeenTo`, `addBeenEntry`
- **Huddle chat** — `getMessages`, `sendMessage`, `subscribeToMessages`

Everything returns typed data (see `types.ts`) so you get autocomplete on
`place.name`, `event.status`, etc.

## Realtime notes

`subscribeToSwipes` and `subscribeToMessages` return an unsubscribe function —
always call it in your `useEffect` cleanup or you'll leak channels:

```ts
useEffect(() => {
  const unsubscribe = subscribeToSwipes(eventId, refetch)
  return unsubscribe
}, [eventId])
```

## Next steps once auth is wired up

Right now every query function takes a raw `userId`/`groupId` as an argument —
once you have Supabase Auth working, swap the hardcoded demo IDs
(`DEMO_USER_ID`, `DEMO_EVENT_ID` in the example page) for `supabase.auth.getUser()`.
