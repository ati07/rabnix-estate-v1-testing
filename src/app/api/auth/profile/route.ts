import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, toPublicProfile } from '@/lib/auth';
import { csvToArray } from '@/lib/catalogHelpers';

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

    // Agent self-serve marketing profile. Editorial fields (isPreferredAgent,
    // agentBadge, agentRating) are intentionally NOT self-editable — they stay
    // admin-controlled. Only agents have these, but harmless for other roles.
    if (typeof b.agencyLogo === 'string') data.agencyLogo = b.agencyLogo.trim() || null;
    if (typeof b.buyersServed === 'string') data.buyersServed = b.buyersServed.trim() || null;
    if (typeof b.agentAbout === 'string') data.agentAbout = b.agentAbout.trim() || null;
    if (b.operatingSince !== undefined) data.operatingSince = b.operatingSince === '' || b.operatingSince === null ? null : Number(b.operatingSince);
    if (b.experienceYears !== undefined) data.experienceYears = b.experienceYears === '' || b.experienceYears === null ? null : Number(b.experienceYears);
    if (b.specializations !== undefined) data.specializations = csvToArray(b.specializations);
    if (b.areasServed !== undefined) data.areasServed = csvToArray(b.areasServed);
    if (b.languages !== undefined) data.languages = csvToArray(b.languages);

    const updated = await prisma.user.update({ where: { id: me.id }, data });
    return NextResponse.json({ success: true, user: toPublicProfile(updated) });
  } catch (err: any) {
    console.error('PATCH /api/auth/profile error', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
