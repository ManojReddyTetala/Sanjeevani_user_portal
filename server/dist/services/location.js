"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLocationAutocomplete = fetchLocationAutocomplete;
exports.resolveLocationQuery = resolveLocationQuery;
const PRESET_GEO_CACHE = {
    kakinada: { query: 'Kakinada', latitude: 16.9891, longitude: 82.2475, formatted_address: 'Kakinada, Andhra Pradesh, India', city: 'Kakinada', state: 'Andhra Pradesh', country: 'India', source: 'PRESET_DATABASE' },
    rajahmundry: { query: 'Rajahmundry', latitude: 17.0005, longitude: 81.8040, formatted_address: 'Rajahmundry, Andhra Pradesh, India', city: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India', source: 'PRESET_DATABASE' },
    hyderabad: { query: 'Hyderabad', latitude: 17.4239, longitude: 78.4526, formatted_address: 'Hyderabad, Telangana, India', city: 'Hyderabad', state: 'Telangana', country: 'India', source: 'PRESET_DATABASE' },
    delhi: { query: 'Delhi', latitude: 28.5672, longitude: 77.2100, formatted_address: 'New Delhi, Delhi, India', city: 'New Delhi', state: 'Delhi', country: 'India', source: 'PRESET_DATABASE' },
    bengaluru: { query: 'Bengaluru', latitude: 12.9634, longitude: 77.5758, formatted_address: 'Bengaluru, Karnataka, India', city: 'Bengaluru', state: 'Karnataka', country: 'India', source: 'PRESET_DATABASE' },
    mumbai: { query: 'Mumbai', latitude: 19.0024, longitude: 72.8423, formatted_address: 'Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', source: 'PRESET_DATABASE' }
};
async function fetchLocationAutocomplete(query) {
    const clean = query.trim();
    if (!clean)
        return [];
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(clean)}&components=country:in&key=${apiKey}`;
            const res = await fetch(url);
            const data = (await res.json());
            if (data && data.status === 'OK' && Array.isArray(data.predictions)) {
                return data.predictions.map((p) => ({
                    description: p.description,
                    place_id: p.place_id,
                    main_text: p.structured_formatting?.main_text || p.description,
                    secondary_text: p.structured_formatting?.secondary_text || ''
                }));
            }
        }
        catch (err) {
            console.warn('Google Places Autocomplete failed, using fallback:', err);
        }
    }
    // Fallback preset suggestions matching text
    return Object.values(PRESET_GEO_CACHE)
        .filter((loc) => loc.query.toLowerCase().includes(clean.toLowerCase()) || loc.formatted_address.toLowerCase().includes(clean.toLowerCase()))
        .map((loc) => ({
        description: loc.formatted_address,
        place_id: `preset-${loc.query.toLowerCase()}`,
        main_text: loc.city,
        secondary_text: `${loc.state}, India`
    }));
}
async function resolveLocationQuery(query) {
    const clean = query.trim().toLowerCase();
    if (PRESET_GEO_CACHE[clean]) {
        return PRESET_GEO_CACHE[clean];
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (apiKey) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
            const res = await fetch(url);
            const data = (await res.json());
            if (data && data.status === 'OK' && data.results?.[0]) {
                const first = data.results[0];
                return {
                    query,
                    latitude: first.geometry.location.lat,
                    longitude: first.geometry.location.lng,
                    formatted_address: first.formatted_address,
                    city: query,
                    state: 'India',
                    country: 'India',
                    place_id: first.place_id,
                    source: 'GOOGLE_GEOCODING'
                };
            }
        }
        catch (err) {
            console.warn('Google Geocoding failed, falling back:', err);
        }
    }
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'SIH-Healthcare-App/1.0' } });
        const data = (await res.json());
        if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            return {
                query,
                latitude: parseFloat(first.lat),
                longitude: parseFloat(first.lon),
                formatted_address: first.display_name,
                city: query,
                state: 'India',
                country: 'India',
                place_id: first.place_id ? String(first.place_id) : undefined,
                source: 'NOMINATIM'
            };
        }
    }
    catch (err) {
        console.warn('Nominatim Geocoding fallback failed:', err);
    }
    return {
        query,
        latitude: 16.9891,
        longitude: 82.2475,
        formatted_address: `${query}, India`,
        city: query,
        state: 'India',
        country: 'India',
        source: 'PRESET_DATABASE'
    };
}
