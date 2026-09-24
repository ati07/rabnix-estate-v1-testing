import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeAgent } from '@/lib/serialize';
import { HOME_PREFERRED_AGENTS } from '@/lib/homeSectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/agents — all preferred agents. Falls back to static data.
export async function GET() {
  try {
    const rows = await prisma.agent.findMany({ orderBy: { rating: 'desc' } });
    if (rows.length > 0) {
      return NextResponse.json({ success: true, agents: rows.map(serializeAgent) });
    }
  } catch (err: any) {
    console.warn('Prisma agents fallback to static data:', err?.message || err);
  }
  return NextResponse.json({ success: true, agents: HOME_PREFERRED_AGENTS });
}
