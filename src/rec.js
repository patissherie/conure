/**
 * Group Hangout Recommender (JS / Node)
 * ======================================
 * Ranks candidate `places` for a given `group`, combining:
 *   1. User preference match     -> users.cuisine_tags / activity_tags vs place.category
 *   2. Budget fit                 -> users.budget_min/max vs place.price_level
 *   3. Own group history affinity -> this group's past swipes + saved_been ratings
 *
 * Also includes a helper to seed `swipe_options` for a brand-new event using
 * the top recommendations.
 *
 * Setup
 * -----
 *   npm install @supabase/supabase-js
 *
 *   export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
 *   export SUPABASE_KEY="YOUR_SERVICE_ROLE_KEY"   // see note below
 *
 * Note on keys: this script aggregates data across all members of a group
 * (other people's budgets/tags, other members' swipes), which will usually
 * be blocked by RLS if you use the anon/public key. Run this server-side
 * with the service_role key, never expose it to a client.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_KEY environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------
// Config
// ---------------------------------------------------------------
const DEFAULT_WEIGHTS = {
  preference: 0.4,
  budget: 0.2,
  ownGroupHistory: 0.4,
};

// Rough mapping of a Google/Yelp-style price_level (1-4) to an estimated
// dollar-per-person range. Tune these to match how your `places` data was
// populated.
const PRICE_LEVEL_RANGES = {
  1: [0, 15],
  2: [15, 30],
  3: [30, 60],
  4: [60, 200],
};

// ---------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------
async function getGroupMembers(groupId) {
  const { data: memberRows, error: mErr } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  if (mErr) throw mErr;

  const userIds = memberRows.map((r) => r.user_id);
  if (userIds.length === 0) return [];

  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('id, budget_min, budget_max, cuisine_tags, activity_tags')
    .in('id', userIds);
  if (uErr) throw uErr;
  return users;
}

async function getGroupEventIds(groupId) {
  const { data, error } = await supabase
    .from('events')
    .select('id')
    .eq('group_id', groupId);
  if (error) throw error;
  return data.map((e) => e.id);
}

async function getGroupSwipeHistory(groupId) {
  const eventIds = await getGroupEventIds(groupId);
  if (eventIds.length === 0) return [];

  const { data: options, error: oErr } = await supabase
    .from('swipe_options')
    .select('id, place_id')
    .in('event_id', eventIds);
  if (oErr) throw oErr;

  const optionToPlace = new Map(
    options.filter((o) => o.place_id).map((o) => [o.id, o.place_id]),
  );
  if (optionToPlace.size === 0) return [];

  const { data: swipes, error: sErr } = await supabase
    .from('swipes')
    .select('option_id, vote')
    .in('option_id', [...optionToPlace.keys()]);
  if (sErr) throw sErr;

  return swipes
    .filter((s) => optionToPlace.has(s.option_id))
    .map((s) => ({ placeId: optionToPlace.get(s.option_id), vote: s.vote }));
}

async function getGroupSavedBeen(groupId) {
  const { data, error } = await supabase
    .from('saved_been')
    .select('place_id, rating')
    .eq('group_id', groupId);
  if (error) throw error;
  return data;
}

async function getGroupSavedWantToGo(groupId) {
  const { data, error } = await supabase
    .from('saved_want_to_go')
    .select('place_id')
    .eq('group_id', groupId);
  if (error) throw error;
  return new Set(data.map((r) => r.place_id));
}

async function getAllPlaces() {
  // NOTE: for large catalogs, add pagination (.range()) or pre-filter by
  // category/location before scoring, rather than pulling every row.
  const { data, error } = await supabase.from('places').select('*');
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------
// Preference / budget scoring
// ---------------------------------------------------------------
function computePreferenceScore(place, members) {
  if (members.length === 0 || !place.category) return 0;
  const category = place.category.toLowerCase();
  let hits = 0;
  for (const m of members) {
    const tags = [...(m.cuisine_tags || []), ...(m.activity_tags || [])].map(
      (t) => t.toLowerCase(),
    );
    if (tags.includes(category)) hits += 1;
  }
  return hits / members.length;
}

function computeBudgetScore(place, members) {
  if (members.length === 0 || place.price_level == null) return 0.5; // neutral if unknown
  const [low, high] = PRICE_LEVEL_RANGES[place.price_level] || [0, 200];
  let hits = 0;
  let counted = 0;
  for (const m of members) {
    if (m.budget_min == null && m.budget_max == null) continue;
    counted += 1;
    const bMin = m.budget_min ?? 0;
    const bMax = m.budget_max ?? 10_000;
    if (bMin <= high && bMax >= low) hits += 1; // ranges overlap
  }
  return counted > 0 ? hits / counted : 0.5;
}

// ---------------------------------------------------------------
// Own-group history affinity
// ---------------------------------------------------------------
function buildHistoryAffinity(swipeHistory, savedBeen, placesById) {
  const counts = new Map();
  const weightedSum = new Map();

  const bump = (key, weight) => {
    counts.set(key, (counts.get(key) || 0) + 1);
    weightedSum.set(key, (weightedSum.get(key) || 0) + weight);
  };

  for (const s of swipeHistory) {
    const place = placesById.get(s.placeId);
    if (!place) continue;
    const key = `${place.category}::${place.price_level}`;
    bump(key, s.vote ? 1 : -1);
  }

  for (const b of savedBeen) {
    const place = placesById.get(b.place_id);
    if (!place || b.rating == null) continue;
    const key = `${place.category}::${place.price_level}`;
    const weight = (b.rating - 3) / 2; // rating 1-5 -> weight -1..+1
    bump(key, weight);
  }

  const affinity = new Map();
  for (const [key, count] of counts) {
    affinity.set(key, weightedSum.get(key) / count); // signed affinity, in [-1, 1]
  }
  return affinity;
}

function scoreFromAffinity(place, affinity) {
  const key = `${place.category}::${place.price_level}`;
  let raw = affinity.get(key);

  if (raw === undefined) {
    // fall back to category-only match, ignoring price level
    const categoryMatches = [...affinity.entries()]
      .filter(([k]) => k.split('::')[0] === place.category)
      .map(([, v]) => v);
    raw = categoryMatches.length
      ? categoryMatches.reduce((a, b) => a + b, 0) / categoryMatches.length
      : undefined;
  }

  if (raw === undefined) return 0.5; // no history signal either way
  return (raw + 1) / 2; // map [-1, 1] -> [0, 1]
}

// ---------------------------------------------------------------
// Main recommender
// ---------------------------------------------------------------
export async function recommendPlacesForGroup(
  groupId,
  {
    topN = 10,
    weights = DEFAULT_WEIGHTS,
    excludeVisited = true,
    excludeWantToGo = false,
  } = {},
) {
  const members = await getGroupMembers(groupId);
  const [swipeHistory, savedBeen, wantToGoIds, allPlaces] = await Promise.all([
    getGroupSwipeHistory(groupId),
    getGroupSavedBeen(groupId),
    excludeWantToGo
      ? getGroupSavedWantToGo(groupId)
      : Promise.resolve(new Set()),
    getAllPlaces(),
  ]);

  const excludeIds = new Set(
    excludeVisited ? savedBeen.map((b) => b.place_id) : [],
  );
  for (const id of wantToGoIds) excludeIds.add(id);

  const placesById = new Map(allPlaces.map((p) => [p.id, p]));
  const candidates = allPlaces.filter((p) => !excludeIds.has(p.id));

  const affinity = buildHistoryAffinity(swipeHistory, savedBeen, placesById);

  const scored = candidates.map((place) => {
    const preference = computePreferenceScore(place, members);
    const budget = computeBudgetScore(place, members);
    const history = scoreFromAffinity(place, affinity);

    const total =
      weights.preference * preference +
      weights.budget * budget +
      weights.ownGroupHistory * history;

    return {
      place,
      preferenceScore: preference,
      budgetScore: budget,
      groupHistoryScore: history,
      totalScore: total,
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored.slice(0, topN);
}

// ---------------------------------------------------------------
// Example: seed swipe_options for a brand-new event
// ---------------------------------------------------------------
export async function createSwipeOptionsForEvent(eventId, groupId, topN = 10) {
  const recommendations = await recommendPlacesForGroup(groupId, { topN });
  const rows = recommendations.map((rec, i) => ({
    event_id: eventId,
    place_id: rec.place.id,
    rank_order: i + 1,
  }));
  if (rows.length > 0) {
    const { error } = await supabase.from('swipe_options').insert(rows);
    if (error) throw error;
  }
  return rows;
}
// ---------------------------------------------------------------
// CLI usage: node group_recommender.js <groupId>
// ---------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const groupId = process.argv[2] || 'replace-with-a-real-group-uuid';
  const results = await recommendPlacesForGroup(groupId, { topN: 10 });
  for (const r of results) {
    console.log(
      `${r.place.name.padEnd(30)} total=${r.totalScore.toFixed(2)}  ` +
        `(pref=${r.preferenceScore.toFixed(2)}, budget=${r.budgetScore.toFixed(2)}, ` +
        `hist=${r.groupHistoryScore.toFixed(2)})`,
    );
  }
}
