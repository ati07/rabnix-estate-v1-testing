import { NextRequest, NextResponse } from 'next/server';
import { nearestCity } from '@/lib/geoCity';
import { CITIES_DATA } from '@/lib/realEstateData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/geo
// Permission-free, IP-based city detection used as a fallback when the browser
// geolocation API is denied or unavailable. On Vercel, the edge network injects
// request geo headers (x-vercel-ip-latitude / -longitude / -city) automatically.
// We map those to the nearest supported city. Resolves `city: null` when no geo
// signal is available (e.g. local dev on localhost, where the IP is loopback).
export async function GET(req: NextRequest) {
  try {
    const lat = req.headers.get('x-vercel-ip-latitude');
    const lng = req.headers.get('x-vercel-ip-longitude');
    if (lat && lng) {
      const city = nearestCity({ lat: parseFloat(lat), lng: parseFloat(lng) });
      if (city) {
        return NextResponse.json({ success: true, city: city.name, source: 'ip-coords' });
      }
    }

    // Fallback: match the reported IP city name against supported cities.
    const ipCity = req.headers.get('x-vercel-ip-city');
    if (ipCity) {
      const decoded = decodeURIComponent(ipCity).toLowerCase();
      const match = CITIES_DATA.find(
        (c) =>
          c.name.toLowerCase().includes(decoded) ||
          decoded.includes(c.name.toLowerCase().split(' ')[0])
      );
      if (match) {
        return NextResponse.json({ success: true, city: match.name, source: 'ip-city' });
      }
    }

    return NextResponse.json({ success: true, city: null, source: 'none' });
  } catch (err: any) {
    console.warn('IP geo detection failed:', err?.message || err);
    return NextResponse.json({ success: true, city: null, source: 'error' });
  }
}
