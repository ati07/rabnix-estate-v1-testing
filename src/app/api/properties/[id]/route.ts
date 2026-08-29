import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { serializeProperty } from '@/lib/serialize';
import type { Property, VerificationStatus } from '@/lib/types';

export const runtime = 'nodejs';

// GET /api/properties/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.property.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
  return NextResponse.json({ success: true, property: serializeProperty(p) });
}

// PATCH /api/properties/:id
//   - owner can edit their own listing fields
//   - admin can additionally change verificationStatus (approve/reject/review)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });

    const isOwner = existing.postedByUserId === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not allowed' }, { status: 403 });
    }

    const b = (await req.json()) as Partial<Property> & { verificationStatus?: VerificationStatus; rejectionReason?: string };
    const data: any = {};

    // Verification changes: admin only.
    if (b.verificationStatus !== undefined) {
      if (!isAdmin) return NextResponse.json({ success: false, error: 'Only admins can verify listings.' }, { status: 403 });
      const status = b.verificationStatus;
      data.verificationStatus = status;
      data.isVerified = status === 'approved';
      data.rejectionReason = status === 'rejected' ? (b.rejectionReason || 'Rejected by admin.') : null;

      await prisma.activityLog.create({
        data: {
          action: status === 'approved' ? 'property_verified' : status === 'rejected' ? 'property_rejected' : 'property_created',
          actorName: user.name,
          actorRole: 'Admin',
          details:
            status === 'approved' ? 'Approved listing and awarded Verified Seal.' :
            status === 'rejected' ? `Rejected listing. Reason: ${b.rejectionReason || 'Not specified'}` :
            'Moved listing to under review.',
          targetTitle: existing.title,
          targetId: existing.id,
          severity: status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
        },
      });
    }

    // Owner-editable fields (also editable by admin).
    const editable: (keyof Property)[] = [
      'title', 'tagline', 'listingType', 'category', 'city', 'locality', 'subLocality',
      'price', 'priceFormatted', 'pricePerSqFt', 'maintenance', 'bhk', 'bathrooms', 'balconies',
      'carpetAreaSqFt', 'superBuiltUpAreaSqFt', 'furnishing', 'floor', 'totalFloors', 'facing',
      'constructionStatus', 'possessionDate', 'reraId', 'images', 'floorPlanImage', 'description',
      'amenities', 'isFeatured',
    ];
    for (const key of editable) {
      if (b[key] !== undefined) data[key] = b[key];
    }

    const updated = await prisma.property.update({ where: { id }, data });
    return NextResponse.json({ success: true, property: serializeProperty(updated) });
  } catch (err: any) {
    console.error('PATCH /api/properties/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE /api/properties/:id — owner or admin.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });

    if (existing.postedByUserId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Not allowed' }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'property_deleted',
        actorName: user.name,
        actorRole: user.role.toUpperCase(),
        details: `Deleted listing "${existing.title}".`,
        targetTitle: existing.title,
        targetId: existing.id,
        severity: 'danger',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/properties/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete listing' }, { status: 500 });
  }
}
