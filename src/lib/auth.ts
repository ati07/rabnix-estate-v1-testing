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

export const DEMO_FALLBACK_USERS: Record<string, UserProfile> = {
  'demo-admin': {
    id: 'demo-admin',
    name: 'Rabnix Master Admin',
    email: 'admin@rabnixestate.com',
    phone: '+91 99999 00001',
    role: 'admin',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-01',
  },
  'demo-owner': {
    id: 'demo-owner',
    name: 'Priya Venkatesh',
    email: 'owner@rabnix.com',
    phone: '+91 98801 23456',
    role: 'owner',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-01',
  },
  'demo-buyer': {
    id: 'demo-buyer',
    name: 'Rahul Sharma',
    email: 'buyer@rabnix.com',
    phone: '+91 98111 22334',
    role: 'buyer',
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-01',
  },
  'demo-agent': {
    id: 'demo-agent',
    name: 'Vikram Deshmukh',
    email: 'agent@rabnix.com',
    phone: '+91 98222 33445',
    role: 'agent',
    city: 'Pune',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-01',
  },
  'demo-builder': {
    id: 'demo-builder',
    name: 'Amit Singhal',
    email: 'builder@rabnix.com',
    phone: '+91 98333 44556',
    role: 'builder',
    city: 'Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isPhoneVerified: true,
    isEmailVerified: true,
    isBlocked: false,
    createdAt: '2025-01-01',
  },
};

/** Returns the currently authenticated user (public profile) or null. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  if (DEMO_FALLBACK_USERS[session.userId]) {
    return DEMO_FALLBACK_USERS[session.userId];
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user) return toPublicProfile(user);
  } catch (err: any) {
    console.warn('getCurrentUser prisma fallback:', err?.message);
  }

  // Check if session.userId matches any demo email or ID
  const found = Object.values(DEMO_FALLBACK_USERS).find((u) => u.id === session.userId || u.email === session.userId);
  return found || null;
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
