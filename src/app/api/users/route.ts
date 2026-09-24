import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword, toPublicProfile } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/users — admin only. Returns all users (public profiles, no hashes).
export async function GET() {
  const me = await getCurrentUser();
  if (me?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, users: users.map(toPublicProfile) });
}

// Admins may provision any role (including another admin), unlike self-registration.
const VALID_ROLES: UserRole[] = ['buyer', 'owner', 'agent', 'builder', 'admin'];

// POST /api/users — admin only. Create a new account of any role.
export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (me?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, password, role, city, companyName, reraNumber } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, phone and password are required.' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const safeRole: UserRole = VALID_ROLES.includes(role) ? role : 'buyer';

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        phone: String(phone).startsWith('+91') ? phone : `+91 ${phone}`,
        passwordHash: await hashPassword(password),
        role: safeRole,
        city: city || 'Bangalore',
        companyName: companyName || undefined,
        reraNumber: reraNumber || undefined,
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'user_registered',
        actorName: me.name,
        actorRole: 'Admin',
        details: `Admin created a new ${safeRole.toUpperCase()} account for "${user.name}" (${user.email}).`,
        targetTitle: user.name,
        targetId: user.id,
        severity: 'success',
      },
    });

    return NextResponse.json({ success: true, user: toPublicProfile(user) });
  } catch (err: any) {
    console.error('POST /api/users error', err);
    return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 });
  }
}
