import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST /api/properties/:id/view — record a real page view.
// Called once per browser session from the property detail page. View tracking
// must never break the page, so failures return 200 with success:false.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      select: { viewsCount: true },
    });
    return NextResponse.json({ success: true, viewsCount: updated.viewsCount });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
