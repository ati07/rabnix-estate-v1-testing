import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeFeaturedProject } from '@/lib/serialize';
import { HOME_FEATURED_PROJECTS, HOME_TOP_PROJECTS, getAllProjects } from '@/lib/homeSectionsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/projects
//   ?section=featured | top   -> only that home section
//   (no section)              -> all unique projects
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');

  try {
    const rows = await prisma.featuredProject.findMany({
      where: section ? { section } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    if (rows.length > 0) {
      return NextResponse.json({ success: true, projects: rows.map(serializeFeaturedProject) });
    }
  } catch (err: any) {
    console.warn('Prisma projects fallback to static data:', err?.message || err);
  }

  const projects =
    section === 'featured' ? HOME_FEATURED_PROJECTS
    : section === 'top' ? HOME_TOP_PROJECTS
    : getAllProjects();
  return NextResponse.json({ success: true, projects });
}
