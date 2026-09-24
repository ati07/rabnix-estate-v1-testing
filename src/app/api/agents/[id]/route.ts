import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeAgent, serializeProperty } from '@/lib/serialize';
import { getAgentById, getAgentProperties, HOME_PREFERRED_AGENTS } from '@/lib/homeSectionsData';
import { INITIAL_PROPERTIES } from '@/lib/realEstateData';
import type { PreferredAgentItem } from '@/lib/homeSectionsData';
import type { Property } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/agents/:id — the agent plus a set of *live* listings attributed to them.
// The listings are pulled from real approved properties (falling back to the seed
// catalogue) and re-badged under the agent via getAgentProperties.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let agent: PreferredAgentItem | undefined;
  let allProperties: Property[] = [];

  try {
    const row = await prisma.agent.findUnique({ where: { id } });
    if (row) agent = serializeAgent(row);
  } catch (err: any) {
    console.warn('Prisma agent fallback for', id, err?.message || err);
  }
  if (!agent) agent = getAgentById(id) ?? HOME_PREFERRED_AGENTS.find((a) => a.id === id);
  if (!agent) return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });

  try {
    const rows = await prisma.property.findMany({
      where: { verificationStatus: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
    allProperties = rows.length > 0 ? rows.map(serializeProperty) : INITIAL_PROPERTIES;
  } catch {
    allProperties = INITIAL_PROPERTIES;
  }

  const properties = getAgentProperties(agent, allProperties);
  return NextResponse.json({ success: true, agent, properties });
}
