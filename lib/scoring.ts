// Pure scoring logic for the recommender. No network calls in this file —
// keeps it fast to unit test (see lib/recommender/scoring.test.ts).

export type MemberPrefs = {
  budget_min: number | null;
  budget_max: number | null;
  cuisine_tags: string[] | null;
  activity_tags: string[] | null;
};

export type CandidatePlace = {
  category: string | null;
  price_level: number | null;
};

export type CategoryBucket = 'food' | 'activity';

/**
 * places.category is free text (e.g. "Burgers", "Puzzle") — there's no column
 * on `places` saying whether it's a food spot or an activity, so we bucket it
 * here. Add new category values as they show up in your `places` data.
 * Longer term, this is better as a real `type` column on `places` populated
 * at ingest time instead of a string lookup that can drift out of sync.
 */
const FOOD_CATEGORIES = new Set([
  'burgers',
  'japanese',
  'italian',
  'desserts',
  'cafe',
  'coffee',
  'restaurant',
  'bar',
  'pizza',
  'brunch',
  'thai',
  'chinese',
  'indian',
  'mexican',
  'seafood',
  'vegan',
]);

const ACTIVITY_CATEGORIES = new Set([
  'puzzle',
  'sport',
  'outdoor',
  'music',
  'adventure',
  'bowling',
  'cinema',
  'arcade',
  'museum',
  'park',
  'nightlife',
  'shopping',
  'wellness',
]);

/** Returns which bucket a place's category falls into, or null if unrecognized. */
export function getCategoryBucket(
  category: string | null,
): CategoryBucket | null {
  if (!category) return null;
  const key = category.toLowerCase();
  if (FOOD_CATEGORIES.has(key)) return 'food';
  if (ACTIVITY_CATEGORIES.has(key)) return 'activity';
  return null;
}

/** Fraction of members whose cuisine/activity tags include this place's category. */
export function computePreferenceScore(
  place: CandidatePlace,
  members: MemberPrefs[],
): number {
  if (members.length === 0 || !place.category) return 0;
  const category = place.category.toLowerCase();
  let hits = 0;
  for (const m of members) {
    const tags = [...(m.cuisine_tags ?? []), ...(m.activity_tags ?? [])].map(
      (t) => t.toLowerCase(),
    );
    if (tags.includes(category)) hits += 1;
  }
  return hits / members.length;
}

/**
 * Fraction of members whose budget_min..budget_max range (both on the same
 * 1-4 price_level scale as places.price_level) covers this place's price.
 */
export function computeBudgetScore(
  place: CandidatePlace,
  members: MemberPrefs[],
): number {
  if (members.length === 0 || place.price_level == null) return 0.5;
  let hits = 0;
  let counted = 0;
  for (const m of members) {
    if (m.budget_min == null && m.budget_max == null) continue;
    counted += 1;
    const min = m.budget_min ?? 1;
    const max = m.budget_max ?? 4;
    if (place.price_level >= min && place.price_level <= max) hits += 1;
  }
  return counted > 0 ? hits / counted : 0.5;
}

export type AffinitySignal = {
  category: string | null;
  price_level: number | null;
  weight: number; // -1..1, e.g. +1 for a "yes" swipe, -1 for "no", rating-derived for saved_been
};

/** Builds a (category, price_level) -> average signed affinity map, in [-1, 1]. */
export function buildAffinityMap(
  signals: AffinitySignal[],
): Map<string, number> {
  const counts = new Map<string, number>();
  const sums = new Map<string, number>();
  for (const s of signals) {
    const key = `${s.category}::${s.price_level}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    sums.set(key, (sums.get(key) ?? 0) + s.weight);
  }
  const affinity = new Map<string, number>();
  for (const [key, count] of counts) {
    affinity.set(key, (sums.get(key) ?? 0) / count);
  }
  return affinity;
}

/** Maps a place's affinity (or category-only fallback) from [-1,1] to a [0,1] score. */
export function scoreFromAffinity(
  place: CandidatePlace,
  affinity: Map<string, number>,
): number {
  const key = `${place.category}::${place.price_level}`;
  let raw = affinity.get(key);

  if (raw === undefined) {
    const categoryMatches = [...affinity.entries()]
      .filter(([k]) => k.split('::')[0] === place.category)
      .map(([, v]) => v);
    raw = categoryMatches.length
      ? categoryMatches.reduce((a, b) => a + b, 0) / categoryMatches.length
      : undefined;
  }

  if (raw === undefined) return 0.5;
  return (raw + 1) / 2;
}

export type ScoreWeights = {
  preference: number;
  budget: number;
  history: number;
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  preference: 0.4,
  budget: 0.2,
  history: 0.4,
};

export function computeTotalScore(
  place: CandidatePlace,
  members: MemberPrefs[],
  affinity: Map<string, number>,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
) {
  const preference = computePreferenceScore(place, members);
  const budget = computeBudgetScore(place, members);
  const history = scoreFromAffinity(place, affinity);
  const total =
    weights.preference * preference +
    weights.budget * budget +
    weights.history * history;
  return { preference, budget, history, total };
}
