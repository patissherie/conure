# DB Setup — Group Hangout App

## How to run this (2 minutes)

1. Go to your Supabase project → **SQL Editor**
2. Paste and run `01_schema.sql` first
3. Paste and run `02_seed.sql` second
4. Go to **Table Editor** to eyeball the data — you should see 2 groups, 5 users, 8 places, 2 events, swipes, messages, etc.

## Handing off to Person A (frontend)

Give them:
- The Supabase project URL + anon key (Project Settings → API)
- This schema file, so they know table/column names
- These two IDs to hardcode while building, so they don't need auth working yet:
  - Group: `aaaaaaaa-0000-0000-0000-000000000001` ("Friday Crew")
  - Event: `cccccccc-0000-0000-0000-000000000001` ("Friday Night Hangout" — mid-swipe, good for testing the match UI)

Example query they can start with immediately:
```js
const { data } = await supabase
  .from('swipe_options')
  .select('*, places(*), swipes(*)')
  .eq('event_id', 'cccccccc-0000-0000-0000-000000000001')
```

## Notes on the seed data

- **Option 4** in the swipe round (Taco Libre) already has 3/3 "yes" votes — use this as your instant "it's a match!" demo case, no need to swipe live during judging.
- The **hike event** is marked `done` and already has a `saved_been` entry with photos/rating/note — good for demoing the "group memory" journal feature without needing to create one live.
- Budgets are on a 1–4 scale (like $ to $$$$) to match Google Places' `price_level` field, so real API data will slot in later without a schema change.

## Turning on Row Level Security (do this once auth is wired up, skip for now)

For the hackathon, RLS can stay **off** so Person A isn't fighting policies while there's no real auth yet. Before final demo, at minimum lock down group-scoped tables:

```sql
alter table events enable row level security;
create policy "members can view group events" on events
  for select using (
    group_id in (select group_id from group_members where user_id = auth.uid())
  );
```

Apply the same pattern to `rsvps`, `messages`, `saved_want_to_go`, `saved_been`. Not required for a working demo — just do it if you have 10 spare minutes.
