import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeAgentUser } from '@/lib/serialize';
import { HOME_PREFERRED_AGENTS } from '@/lib/homeSectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rent-side listing types; everything else counts as "for sale".
const RENT_TYPES = new Set(['rent', 'pg']);

// GET /api/agents — the public "Rabnix Preferred Agents" directory.
// These are Users with role='agent' and isPreferredAgent=true. Their listing
// counts are computed live from their approved properties. Falls back to the
// static catalogue when the DB is empty or unreachable.
export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'agent', isPreferredAgent: true },
      orderBy: [{ agentRating: 'desc' }, { name: 'asc' }],
    });

    if (agents.length > 0) {
      // One grouped query for all listing counts, keyed by user + listingType.
      const grouped = await prisma.property.groupBy({
        by: ['postedByUserId', 'listingType'],
        where: {
          verificationStatus: 'approved',
          postedByUserId: { in: agents.map((a) => a.id) },
        },
        _count: { _all: true },
      });

      const countsByUser = new Map<string, { forSale: number; forRent: number }>();
      for (const g of grouped) {
        if (!g.postedByUserId) continue;
        const entry = countsByUser.get(g.postedByUserId) ?? { forSale: 0, forRent: 0 };
        const n = g._count._all;
        if (RENT_TYPES.has(g.listingType)) entry.forRent += n;
        else entry.forSale += n;
        countsByUser.set(g.postedByUserId, entry);
      }

      const serialized = agents.map((a) =>
        serializeAgentUser(a, countsByUser.get(a.id) ?? { forSale: 0, forRent: 0 }),
      );
      return NextResponse.json({ success: true, agents: serialized });
    }
  } catch (err: any) {
    console.warn('Prisma agents fallback to static data:', err?.message || err);
  }
  return NextResponse.json({ success: true, agents: HOME_PREFERRED_AGENTS });
}
