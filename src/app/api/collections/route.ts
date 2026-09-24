import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeCollection } from '@/lib/serialize';
import { CURATED_COLLECTIONS } from '@/lib/collectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/collections — all curated collections. Falls back to static data.
export async function GET() {
  try {
    const rows = await prisma.collection.findMany({ orderBy: { createdAt: 'asc' } });
    if (rows.length > 0) {
      return NextResponse.json({ success: true, collections: rows.map(serializeCollection) });
    }
  } catch (err: any) {
    console.warn('Prisma collections fallback to static data:', err?.message || err);
  }
  return NextResponse.json({ success: true, collections: CURATED_COLLECTIONS });
}
