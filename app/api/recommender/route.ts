import { NextRequest, NextResponse } from 'next/server';
// TODO: point this at whatever server-side Supabase client helper your
// project already uses (e.g. lib/supabase/server.ts). This route needs a
// server client, not the browser client used in client components.
import { supabase } from '@/lib/supabaseClient';
import { getTopRecommendations } from '@/lib/rec';
import type { CategoryBucket } from '@/lib/scoring';

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId');
  const categoryParam = req.nextUrl.searchParams.get('category');

  if (!groupId) {
    return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
  }

  const bucket: CategoryBucket | 'surprise' =
    categoryParam === 'food' || categoryParam === 'activity'
      ? categoryParam
      : 'surprise';

  try {
    const recommendations = await getTopRecommendations(
      supabase,
      groupId,
      bucket,
      5,
    );
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error('[api/recommendations]', err);
    return NextResponse.json(
      { error: 'Failed to load recommendations' },
      { status: 500 },
    );
  }
}
