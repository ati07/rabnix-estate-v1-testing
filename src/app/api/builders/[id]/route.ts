import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBuilder } from '@/lib/serialize';
import { getBuilderById } from '@/lib/buildersData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/builders/:id — a single builder by id or slug.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const row = await prisma.builder.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (row) return NextResponse.json({ success: true, builder: serializeBuilder(row) });
  } catch (err: any) {
    console.warn('Prisma builder fallback for', id, err?.message || err);
  }

  const fallback = getBuilderById(id);
  if (fallback) return NextResponse.json({ success: true, builder: fallback });

  return NextResponse.json({ success: false, error: 'Builder not found' }, { status: 404 });
}
