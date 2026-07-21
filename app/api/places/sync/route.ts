import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/googlePlaces';
import { upsertPlacesFromExternal } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');

  const externalPlaces = await searchNearbyPlaces({
    lat,
    lng,
    includedType: 'restaurant',
  });
  const savedPlaces = await upsertPlacesFromExternal(externalPlaces);

  return NextResponse.json({ saved: savedPlaces });
}
