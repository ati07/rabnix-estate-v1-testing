import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, toPublicProfile } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json({ success: false, error: 'Please enter both credentials.' }, { status: 400 });
    }

    const identifier = String(emailOrPhone).trim();
    const digits = identifier.replace(/\D/g, '');

    // Match by email (case-insensitive) or phone digits.
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          ...(digits.length >= 10 ? [{ phone: { contains: digits.slice(-10) } }] : []),
        ],
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ success: false, error: 'Invalid email/phone or password.' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({
        success: false,
        error: `Your account has been suspended by Rabnix Admin. Reason: ${user.blockedReason || 'Policy violation. Contact support.'}`,
      }, { status: 403 });
    }

    const token = await createSessionToken({ userId: user.id, role: user.role as UserRole });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: toPublicProfile(user) });
  } catch (err: any) {
    console.error('login error', err);
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
