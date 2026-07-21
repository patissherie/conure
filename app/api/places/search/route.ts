import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/googlePlaces';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const includedType = searchParams.get('type') ?? undefined;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat and lng are required' },
      { status: 400 }
    );
  }

  try {
    const places = await searchNearbyPlaces({ lat, lng, includedType });
    return NextResponse.json({ places });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
