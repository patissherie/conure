-- =========================================================
-- GROUP HANGOUT APP — SCHEMA
-- Run this first in Supabase SQL Editor
-- =========================================================

-- Clean slate (safe to re-run while developing)
drop table if exists messages cascade;
drop table if exists saved_been cascade;
drop table if exists saved_want_to_go cascade;
drop table if exists swipes cascade;
drop table if exists swipe_options cascade;
drop table if exists rsvps cascade;
drop table if exists events cascade;
drop table if exists places cascade;
drop table if exists group_members cascade;
drop table if exists groups cascade;
drop table if exists users cascade;

-- ---------------------------------------------------------
-- USERS
-- Basic profile + preference questionnaire results
-- ---------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  avatar_url text,
  budget_min int default 1,       -- 1-4 scale, like $ to $$$$
  budget_max int default 4,
  cuisine_tags text[] default '{}',   -- e.g. {"italian","thai","vegan"}
  activity_tags text[] default '{}',  -- e.g. {"outdoors","games","chill"}
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- GROUPS
-- ---------------------------------------------------------
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- ---------------------------------------------------------
-- PLACES
-- Cached results from Places API (or manually added)
-- ---------------------------------------------------------
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,              -- "restaurant", "activity", "bar", etc.
  price_level int,            -- 1-4
  lat double precision,
  lng double precision,
  address text,
  photo_url text,
  external_source text,       -- "google_places", "manual", etc.
  external_id text,           -- id from that source, for dedup
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- EVENTS
-- A single planned hangout for a group
-- ---------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  title text default 'Untitled Hangout',
  proposed_times timestamptz[] default '{}',  -- candidate times before locking one in
  confirmed_time timestamptz,                 -- set once "auto-find-the-time" resolves
  confirmed_place_id uuid references places(id),
  status text default 'planning',  -- planning | time_locked | place_locked | done
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- RSVPS
-- Who's coming + their availability for an event
-- ---------------------------------------------------------
create table rsvps (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text default 'pending',  -- pending | yes | no | maybe
  available_times timestamptz[] default '{}',
  responded_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- ---------------------------------------------------------
-- SWIPE OPTIONS
-- The 5-10 candidate places/activities proposed for an event
-- ---------------------------------------------------------
create table swipe_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  place_id uuid references places(id),
  rank_order int,  -- order it was presented in, if you want to track it
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- SWIPES
-- Each user's yes/no vote on a swipe option
-- ---------------------------------------------------------
create table swipes (
  option_id uuid references swipe_options(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  vote boolean not null,  -- true = yes, false = no
  swiped_at timestamptz default now(),
  primary key (option_id, user_id)
);

-- ---------------------------------------------------------
-- SAVED: WANT TO GO (wishlist collection)
-- ---------------------------------------------------------
create table saved_want_to_go (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  place_id uuid references places(id),
  added_by uuid references users(id),
  added_at timestamptz default now()
);

-- ---------------------------------------------------------
-- SAVED: BEEN (group memory / journal)
-- ---------------------------------------------------------
create table saved_been (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  place_id uuid references places(id),
  photo_urls text[] default '{}',
  rating int,  -- 1-5
  note text,
  visited_at date,
  added_by uuid references users(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- MESSAGES ("Huddle" group chat tied to an event)
-- ---------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references users(id),
  content text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- Helpful indexes for common lookups
-- ---------------------------------------------------------
create index idx_group_members_user on group_members(user_id);
create index idx_rsvps_event on rsvps(event_id);
create index idx_swipe_options_event on swipe_options(event_id);
create index idx_swipes_option on swipes(option_id);
create index idx_messages_event on messages(event_id);
