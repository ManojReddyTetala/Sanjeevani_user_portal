export interface PlaceResult {
  id: string | number;
  source: 'GOOGLE_PLACES_API' | 'APPLICATION_DATABASE' | 'MERGED';
  placeId?: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  opening_hours?: string;
  is_open?: boolean;
  facility_type: string;
  distance_km: number;
  photos?: string[];
  icu_beds?: number | null;
  general_beds?: number | null;
  oxygen_cylinders?: number | null;
  ambulances?: number | null;
  capacity_status?: 'VERIFIED_LIVE' | 'UNAVAILABLE_FROM_SOURCE';
  doctors?: any[];
}

export async function fetchGooglePlacesNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  category: string = 'hospital'
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusKm * 1000}&type=hospital&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as any;

      if (data && data.status === 'OK' && Array.isArray(data.results)) {
        return data.results.map((p: any) => ({
          id: p.place_id,
          source: 'GOOGLE_PLACES_API',
          placeId: p.place_id,
          name: p.name,
          address: p.vicinity || p.formatted_address || '',
          city: p.vicinity?.split(',').pop()?.trim() || 'Nearby',
          latitude: p.geometry?.location?.lat || lat,
          longitude: p.geometry?.location?.lng || lng,
          rating: p.rating,
          review_count: p.user_ratings_total,
          is_open: p.opening_hours?.open_now,
          facility_type: p.types?.includes('hospital') ? 'Hospital' : 'Healthcare Facility',
          distance_km: calculateHaversine(lat, lng, p.geometry?.location?.lat || lat, p.geometry?.location?.lng || lng),
          capacity_status: 'UNAVAILABLE_FROM_SOURCE'
        }));
      }
    } catch (err) {
      console.warn('Google Places API request failed, falling back:', err);
    }
  }

  return [];
}

export function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
