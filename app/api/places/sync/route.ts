import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/googlePlaces';
import {
  upsertPlacesFromExternal,
  getGroupBudgetRange,
  filterPlacesByBudget,
} from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const groupId = searchParams.get('groupId');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat and lng are required' },
      { status: 400 }
    );
  }

  try {
    const allPlaces = await searchNearbyPlaces({
      lat,
      lng,
      includedType: 'restaurant',
    });

    let range = null;
    if (groupId) {
      range = await getGroupBudgetRange(groupId);
    }

    const filteredPlaces = filterPlacesByBudget(allPlaces, range);
    const savedPlaces = await upsertPlacesFromExternal(filteredPlaces);

    return NextResponse.json({
      saved: savedPlaces,
      appliedBudget: range,
      totalFound: allPlaces.length,
      afterBudgetFilter: filteredPlaces.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
