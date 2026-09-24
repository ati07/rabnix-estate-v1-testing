import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeFeaturedProject } from '@/lib/serialize';
import { getProjectById } from '@/lib/homeSectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/projects/:id — a single featured/top project by id.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const row = await prisma.featuredProject.findUnique({ where: { id } });
    if (row) return NextResponse.json({ success: true, project: serializeFeaturedProject(row) });
  } catch (err: any) {
    console.warn('Prisma project fallback for', id, err?.message || err);
  }

  const fallback = getProjectById(id);
  if (fallback) return NextResponse.json({ success: true, project: fallback });

  return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
}
