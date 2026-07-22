/**
 * Seed a small, self-contained set of fake data so you can integration-test
 * recommendPlacesForGroup() / createSwipeOptionsForEvent() without needing
 * the rest of the app built. Everything it creates is tagged with a
 * recognizable prefix so cleanup can find and remove it safely.
 *
 * IMPORTANT: point this at a local or throwaway dev Supabase project, not
 * production. Easiest way to get a safe sandbox:
 *   supabase init && supabase start
 * which spins up a full local Postgres + API on your machine (needs Docker),
 * completely separate from your real project.
 *
 * Usage:
 *   node seed_test_data.js seed      # inserts fake rows, prints the group id
 *   node seed_test_data.js run <groupId>   # runs the recommender against it
 *   node seed_test_data.js cleanup   # deletes everything this script created
 */

import { createClient } from '@supabase/supabase-js';
import { recommendPlacesForGroup } from './rec.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const TAG = 'TEST_SEED_'; // used to namespace + find/delete test rows later

async function seed() {
  // --- users ---
  const { data: users, error: uErr } = await supabase
    .from('users')
    .insert([
      {
        name: `${TAG}Tony`,
        email: `${TAG}tony@example.com`,
        budget_min: 20,
        budget_max: 60,
        cuisine_tags: ['dinner', 'sushi'],
        activity_tags: ['board games'],
      },
      {
        name: `${TAG}Maya`,
        email: `${TAG}maya@example.com`,
        budget_min: 30,
        budget_max: 80,
        cuisine_tags: ['dinner'],
        activity_tags: ['hiking'],
      },
    ])
    .select();
  if (uErr) throw uErr;

  // --- group ---
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .insert({ name: `${TAG}Northwest Crew`, created_by: users[0].id })
    .select()
    .single();
  if (gErr) throw gErr;

  // --- group_members ---
  const { error: gmErr } = await supabase
    .from('group_members')
    .insert(users.map((u) => ({ group_id: group.id, user_id: u.id })));
  if (gmErr) throw gmErr;

  // --- places ---
  const { data: places, error: pErr } = await supabase
    .from('places')
    .insert([
      { name: `${TAG}Ume Burger`, category: 'dinner', price_level: 2 },
      { name: `${TAG}Fancy Steakhouse`, category: 'dinner', price_level: 4 },
      {
        name: `${TAG}Board Game Cafe`,
        category: 'board games',
        price_level: 2,
      },
      { name: `${TAG}Local Trailhead`, category: 'hiking', price_level: 1 },
    ])
    .select();
  if (pErr) throw pErr;

  // --- a past event with swipe_options + swipes, so group history isn't empty ---
  const { data: pastEvent, error: eErr } = await supabase
    .from('events')
    .insert({
      group_id: group.id,
      title: `${TAG}Past dinner`,
      status: 'completed',
    })
    .select()
    .single();
  if (eErr) throw eErr;

  const umeBurger = places.find((p) => p.name.includes('Ume Burger'));
  const steakhouse = places.find((p) => p.name.includes('Steakhouse'));

  const { data: options, error: oErr } = await supabase
    .from('swipe_options')
    .insert([
      { event_id: pastEvent.id, place_id: umeBurger.id, rank_order: 1 },
      { event_id: pastEvent.id, place_id: steakhouse.id, rank_order: 2 },
    ])
    .select();
  if (oErr) throw oErr;

  await supabase.from('swipes').insert([
    { option_id: options[0].id, user_id: users[0].id, vote: true }, // liked Ume Burger
    { option_id: options[0].id, user_id: users[1].id, vote: true },
    { option_id: options[1].id, user_id: users[0].id, vote: false }, // rejected the steakhouse
  ]);

  console.log('Seeded test data.');
  console.log('group_id:', group.id);
  console.log(`Run:  node test.js run ${group.id}`);
  return group.id;
}

async function run(groupId) {
  const results = await recommendPlacesForGroup(groupId, { topN: 10 });
  for (const r of results) {
    console.log(
      `${r.place.name.padEnd(30)} total=${r.totalScore.toFixed(2)}  ` +
        `(pref=${r.preferenceScore.toFixed(2)}, budget=${r.budgetScore.toFixed(2)}, ` +
        `hist=${r.groupHistoryScore.toFixed(2)})`,
    );
  }
}

async function cleanup() {
  // delete in dependency order (children first).
  // swipes/swipe_options/rsvps don't have a name/title column to filter by
  // directly, so clean up via their parent event ids first.
  const { data: testEvents } = await supabase
    .from('events')
    .select('id')
    .ilike('title', `${TAG}%`);
  const eventIds = (testEvents || []).map((e) => e.id);
  if (eventIds.length > 0) {
    const { data: testOptions } = await supabase
      .from('swipe_options')
      .select('id')
      .in('event_id', eventIds);
    const optionIds = (testOptions || []).map((o) => o.id);
    if (optionIds.length > 0) {
      await supabase.from('swipes').delete().in('option_id', optionIds);
    }
    await supabase.from('swipe_options').delete().in('event_id', eventIds);
    await supabase.from('rsvps').delete().in('event_id', eventIds);
    await supabase.from('events').delete().in('id', eventIds);
  }

  const { data: testGroups } = await supabase
    .from('groups')
    .select('id')
    .ilike('name', `${TAG}%`);
  const groupIds = (testGroups || []).map((g) => g.id);
  if (groupIds.length > 0) {
    await supabase.from('group_members').delete().in('group_id', groupIds);
    await supabase.from('groups').delete().in('id', groupIds);
  }

  await supabase.from('places').delete().ilike('name', `${TAG}%`);
  await supabase.from('users').delete().ilike('email', `${TAG}%`);

  console.log('Cleaned up all test-seeded rows.');
}

const [, , command, arg] = process.argv;

if (command === 'seed') {
  await seed();
} else if (command === 'run') {
  if (!arg) throw new Error('Usage: node test.js run <groupId>');
  await run(arg);
} else if (command === 'cleanup') {
  await cleanup();
} else {
  console.log('Usage: node test.js <seed|run <groupId>|cleanup>');
}
