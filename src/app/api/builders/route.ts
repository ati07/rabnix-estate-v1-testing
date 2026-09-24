import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBuilder } from '@/lib/serialize';
import { BUILDERS_DATA } from '@/lib/buildersData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/builders — all builders. Falls back to static BUILDERS_DATA if the DB
// is empty or unavailable, so the page always renders.
export async function GET() {
  try {
    const rows = await prisma.builder.findMany({ orderBy: { reviewsCount: 'desc' } });
    if (rows.length > 0) {
      return NextResponse.json({ success: true, builders: rows.map(serializeBuilder) });
    }
  } catch (err: any) {
    console.warn('Prisma builders fallback to BUILDERS_DATA:', err?.message || err);
  }
  return NextResponse.json({ success: true, builders: BUILDERS_DATA });
}
