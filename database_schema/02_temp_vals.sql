-- =========================================================
-- GROUP HANGOUT APP — SEED DATA
-- Run this AFTER 01_schema.sql
-- Gives Person A (frontend) real-shaped data to build against
-- =========================================================

-- ---------------------------------------------------------
-- USERS (5 friends with different prefs/budgets)
-- ---------------------------------------------------------
insert into users (id, name, email, avatar_url, budget_min, budget_max, cuisine_tags, activity_tags) values
('11111111-1111-1111-1111-111111111111', 'Alex Chen',   'alex@example.com',   'https://i.pravatar.cc/150?img=1', 1, 3, '{"thai","vegan"}',        '{"chill","games"}'),
('22222222-2222-2222-2222-222222222222', 'Jordan Lee',  'jordan@example.com', 'https://i.pravatar.cc/150?img=2', 2, 4, '{"italian","japanese"}',  '{"outdoors","live music"}'),
('33333333-3333-3333-3333-333333333333', 'Sam Rivera',  'sam@example.com',    'https://i.pravatar.cc/150?img=3', 1, 2, '{"mexican","bbq"}',       '{"games","chill"}'),
('44444444-4444-4444-4444-444444444444', 'Priya Nair',  'priya@example.com',  'https://i.pravatar.cc/150?img=4', 2, 3, '{"indian","thai"}',       '{"outdoors","art"}'),
('55555555-5555-5555-5555-555555555555', 'Sam Osei',    'osei@example.com',   'https://i.pravatar.cc/150?img=5', 3, 4, '{"japanese","italian"}',  '{"live music","art"}');

-- ---------------------------------------------------------
-- GROUPS
-- ---------------------------------------------------------
insert into groups (id, name, created_by) values
('aaaaaaaa-0000-0000-0000-000000000001', 'Friday Crew',   '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-0000-0000-0000-000000000002', 'Weekend Hikers', '22222222-2222-2222-2222-222222222222');

insert into group_members (group_id, user_id) values
('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444'),
('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444'),
('aaaaaaaa-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555');

-- ---------------------------------------------------------
-- PLACES (mix of restaurants + activities)
-- ---------------------------------------------------------
insert into places (id, name, category, price_level, lat, lng, address, photo_url, external_source) values
('bbbbbbbb-0000-0000-0000-000000000001', 'Golden Thai Kitchen', 'restaurant', 2, -33.8688, 151.2093, '12 George St, Sydney', 'https://picsum.photos/seed/thai/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000002', 'Mario''s Pizzeria',   'restaurant', 2, -33.8700, 151.2080, '45 Pitt St, Sydney',   'https://picsum.photos/seed/pizza/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000003', 'Sakura Ramen Bar',    'restaurant', 3, -33.8659, 151.2100, '8 Hunter St, Sydney',  'https://picsum.photos/seed/ramen/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000004', 'Battle Arcade',       'activity',   2, -33.8730, 151.2060, '20 Market St, Sydney', 'https://picsum.photos/seed/arcade/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000005', 'Botanic Gardens Walk','activity',   1, -33.8642, 151.2166, 'Mrs Macquaries Rd, Sydney', 'https://picsum.photos/seed/garden/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000006', 'Taco Libre',          'restaurant', 1, -33.8710, 151.2075, '5 Liverpool St, Sydney', 'https://picsum.photos/seed/taco/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000007', 'Skyline Rooftop Bar', 'bar',        4, -33.8675, 151.2110, '100 Bridge St, Sydney', 'https://picsum.photos/seed/rooftop/400', 'manual'),
('bbbbbbbb-0000-0000-0000-000000000008', 'Indoor Climbing Gym', 'activity',   3, -33.8790, 151.2010, '30 Wentworth Ave, Sydney', 'https://picsum.photos/seed/climb/400', 'manual');

-- ---------------------------------------------------------
-- EVENTS
-- One event mid-planning (time locked, place not yet),
-- one fully done (past hangout for the memory feature)
-- ---------------------------------------------------------
insert into events (id, group_id, title, proposed_times, confirmed_time, confirmed_place_id, status) values
('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Friday Night Hangout',
  array['2026-07-25 18:00+10','2026-07-25 19:00+10','2026-07-26 18:00+10']::timestamptz[],
  '2026-07-25 19:00+10', null, 'time_locked'),
('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'Sunday Hike + Lunch',
  array['2026-07-19 10:00+10']::timestamptz[],
  '2026-07-19 10:00+10', 'bbbbbbbb-0000-0000-0000-000000000005', 'done');

-- ---------------------------------------------------------
-- RSVPS
-- ---------------------------------------------------------
insert into rsvps (event_id, user_id, status, available_times) values
('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'yes', array['2026-07-25 18:00+10','2026-07-25 19:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'yes', array['2026-07-25 19:00+10','2026-07-26 18:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'yes', array['2026-07-25 19:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'maybe', array['2026-07-26 18:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'yes', array['2026-07-19 10:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'yes', array['2026-07-19 10:00+10']::timestamptz[]),
('cccccccc-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'yes', array['2026-07-19 10:00+10']::timestamptz[]);

-- ---------------------------------------------------------
-- SWIPE OPTIONS + SWIPES (for the Friday Night Hangout — place not locked yet)
-- ---------------------------------------------------------
insert into swipe_options (id, event_id, place_id, rank_order) values
('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 1),
('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 2),
('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 3),
('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', 4),
('dddddddd-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000007', 5);

-- Simulate a partial swiping round in progress
insert into swipes (option_id, user_id, vote) values
('dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', true),
('dddddddd-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', true),
('dddddddd-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', false),
('dddddddd-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', false),
('dddddddd-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', true),
('dddddddd-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', true),
('dddddddd-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', true),
('dddddddd-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', true);
-- Note: option 4 (Taco Libre) has 3/3 "yes" so far -> good demo case for "overlap match"

-- ---------------------------------------------------------
-- SAVED: WANT TO GO
-- ---------------------------------------------------------
insert into saved_want_to_go (group_id, place_id, added_by) values
('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000007', '55555555-5555-5555-5555-555555555555');

-- ---------------------------------------------------------
-- SAVED: BEEN (group memory / journal — for the completed hike event)
-- ---------------------------------------------------------
insert into saved_been (group_id, place_id, photo_urls, rating, note, visited_at, added_by) values
('aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000005',
  array['https://picsum.photos/seed/hike1/500','https://picsum.photos/seed/hike2/500'],
  5, 'Perfect weather, saw the flying foxes near the pond!', '2026-07-19',
  '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002',
  array['https://picsum.photos/seed/pizza-night/500'],
  4, 'Good pizza but service was slow. Would go again on a weekday.', '2026-07-04',
  '11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------
-- MESSAGES (Huddle chat on the in-progress event)
-- ---------------------------------------------------------
insert into messages (event_id, user_id, content) values
('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'yo who''s free Friday night?'),
('cccccccc-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'I''m in, 7pm works better for me'),
('cccccccc-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'same, let''s swipe on places'),
('cccccccc-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'might be late but keep me posted');
