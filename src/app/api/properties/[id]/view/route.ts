import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

// POST /api/properties/:id/view — record a real page view.
// Called once per browser session from the property detail page. Increments the
// listing's counter AND writes a timestamped PropertyView row so the dashboard
// trend charts (views / unique visitors over time) reflect real activity.
// View tracking must never break the page, so failures return 200/success:false.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({} as { visitorKey?: string }));
    const visitorKey = typeof body.visitorKey === 'string' && body.visitorKey ? body.visitorKey : 'anon';
    const user = await getCurrentUser();

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, postedByUserId: true },
    });
    if (!property) return NextResponse.json({ success: false }, { status: 200 });

    const [, updated] = await prisma.$transaction([
      prisma.propertyView.create({
        data: {
          propertyId: property.id,
          ownerUserId: property.postedByUserId ?? undefined,
          viewerUserId: user?.id ?? undefined,
          visitorKey,
        },
      }),
      prisma.property.update({
        where: { id: property.id },
        data: { viewsCount: { increment: 1 } },
        select: { viewsCount: true },
      }),
    ]);

    return NextResponse.json({ success: true, viewsCount: updated.viewsCount });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
