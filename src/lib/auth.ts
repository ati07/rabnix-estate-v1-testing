import 'server-only';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { UserProfile, UserRole } from '@/lib/types';

const COOKIE_NAME = 'rabnix_session';
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-insecure-secret-change-me'
);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  [key: string]: unknown;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the currently authenticated user (public profile) or null. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  return toPublicProfile(user);
}

/** Strips passwordHash and shapes a DB user into the UserProfile the UI expects. */
export function toPublicProfile(user: {
  id: string; name: string; email: string; phone: string; role: string;
  city: string | null; avatar: string | null; companyName: string | null;
  reraNumber: string | null; isPhoneVerified: boolean; isEmailVerified: boolean;
  isBlocked: boolean; blockedReason: string | null; blockedAt: string | null;
  lastActive: string | null; createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as UserRole,
    city: user.city ?? undefined,
    avatar: user.avatar ?? undefined,
    companyName: user.companyName ?? undefined,
    reraNumber: user.reraNumber ?? undefined,
    isPhoneVerified: user.isPhoneVerified,
    isEmailVerified: user.isEmailVerified,
    isBlocked: user.isBlocked,
    blockedReason: user.blockedReason ?? undefined,
    blockedAt: user.blockedAt ?? undefined,
    lastActive: user.lastActive ?? undefined,
    createdAt: user.createdAt.toISOString().split('T')[0],
  };
}
