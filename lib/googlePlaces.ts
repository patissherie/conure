export type ExternalPlace = {
  name: string;
  category: string;
  price_level: number | null;
  lat: number;
  lng: number;
  address: string;
  photo_url: string | null;
  external_source: 'google_places';
  external_id: string;
};

export async function searchNearbyPlaces(params: {
  lat: number;
  lng: number;
  radiusMeters?: number;
  includedType?: string;
  minPrice?: number; // 1-4
  maxPrice?: number; // 1-4
}): Promise<ExternalPlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is missing from .env.local');
  }

  const body: any = {
    includedTypes: params.includedType ? [params.includedType] : undefined,
    maxResultCount: 10,
    locationRestriction: {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: params.radiusMeters ?? 2000,
      },
    },
  };

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // FieldMask tells Google exactly which fields to return —
        // required by this API, and keeps the response small/cheap.
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.priceLevel',
          'places.primaryType',
          'places.photos',
        ].join(','),
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Places API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const places = data.places ?? [];

  return places.map((p: any) => ({
    name: p.displayName?.text ?? 'Unknown',
    category: p.primaryType ?? 'unknown',
    price_level: mapGooglePriceLevel(p.priceLevel),
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    address: p.formattedAddress ?? '',
    photo_url: p.photos?.[0]
      ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=400&key=${apiKey}`
      : null,
    external_source: 'google_places' as const,
    external_id: p.id,
  }));
}

// Google returns strings like "PRICE_LEVEL_MODERATE" — map to your 1-4 int scale
function mapGooglePriceLevel(level: string | undefined): number | null {
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return level ? map[level] ?? null : null;
}
