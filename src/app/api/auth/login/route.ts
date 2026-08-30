import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, toPublicProfile, DEMO_FALLBACK_USERS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json({ success: false, error: 'Please enter both credentials.' }, { status: 400 });
    }

    const identifier = String(emailOrPhone).trim().toLowerCase();
    const digits = identifier.replace(/\D/g, '');

    // Check demo accounts first
    const demoUser = Object.values(DEMO_FALLBACK_USERS).find(
      (u) => u.email.toLowerCase() === identifier || (digits.length >= 10 && u.phone.includes(digits.slice(-10)))
    );

    if (demoUser && (password === 'admin123' || password === 'password123')) {
      const token = await createSessionToken({ userId: demoUser.id, role: demoUser.role as UserRole });
      await setSessionCookie(token);
      return NextResponse.json({ success: true, user: demoUser });
    }

    // Match by email (case-insensitive) or phone digits in Prisma DB.
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            ...(digits.length >= 10 ? [{ phone: { contains: digits.slice(-10) } }] : []),
          ],
        },
      });

      if (user && (await verifyPassword(password, user.passwordHash))) {
        if (user.isBlocked) {
          return NextResponse.json({
            success: false,
            error: `Your account has been suspended by Rabnix Admin. Reason: ${user.blockedReason || 'Policy violation. Contact support.'}`,
          }, { status: 403 });
        }

        const token = await createSessionToken({ userId: user.id, role: user.role as UserRole });
        await setSessionCookie(token);

        return NextResponse.json({ success: true, user: toPublicProfile(user) });
      }
    } catch (dbErr: any) {
      console.warn('Prisma DB login failed, checking fallback:', dbErr?.message);
    }

    if (demoUser) {
      return NextResponse.json({ success: false, error: 'Invalid password. (Demo password is password123 or admin123)' }, { status: 401 });
    }

    return NextResponse.json({ success: false, error: 'Invalid email/phone or password.' }, { status: 401 });
  } catch (err: any) {
    console.error('login error', err);
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
