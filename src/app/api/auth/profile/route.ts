import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, toPublicProfile } from '@/lib/auth';

export const runtime = 'nodejs';

// PATCH /api/auth/profile — update your own editable profile fields.
export async function PATCH(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const b = await req.json();
    const data: any = {};
    for (const key of ['name', 'phone', 'city', 'avatar', 'companyName', 'reraNumber'] as const) {
      if (b[key] !== undefined) data[key] = b[key];
    }

    const updated = await prisma.user.update({ where: { id: me.id }, data });
    return NextResponse.json({ success: true, user: toPublicProfile(updated) });
  } catch (err: any) {
    console.error('PATCH /api/auth/profile error', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
