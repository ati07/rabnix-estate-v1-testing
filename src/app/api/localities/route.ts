import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPopularLocalitiesForCity } from '@/lib/homeSectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/localities?city=Bangalore
// Returns the curated locality tiles for a city, but overlays each tile's
// propertiesCount with the *live* count of approved listings in that locality so
// the numbers track real inventory. Falls back to the static counts on any error.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || '';

  const tiles = getPopularLocalitiesForCity(city);

  try {
    const grouped = await prisma.property.groupBy({
      by: ['locality'],
      where: { city, verificationStatus: 'approved' },
      _count: { _all: true },
    });
    const counts = new Map(grouped.map((g) => [g.locality.toLowerCase(), g._count._all]));
    const merged = tiles.map((t) => {
      const live = counts.get(t.name.toLowerCase());
      return live && live > 0 ? { ...t, propertiesCount: live } : t;
    });
    return NextResponse.json({ success: true, localities: merged });
  } catch (err: any) {
    console.warn('Prisma localities fallback to static counts:', err?.message || err);
    return NextResponse.json({ success: true, localities: tiles });
  }
}
