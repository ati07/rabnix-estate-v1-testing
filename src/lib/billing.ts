import 'server-only';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Plans & free-tier
// ---------------------------------------------------------------------------

// Free listings every new account gets before a paid plan is required.
export const FREE_LISTINGS = 1;

export type PlanId = 'plan_100' | 'plan_365';

export interface Plan {
  id: PlanId;
  name: string;
  listings: number;
  /** Price in rupees (display). */
  priceRupees: number;
  /** Price in paise (Razorpay charge amount). */
  amount: number;
  /** Plan validity in days from activation. */
  validityDays: number;
  tagline: string;
}

export const PLANS: Record<PlanId, Plan> = {
  plan_100: {
    id: 'plan_100',
    name: 'Starter',
    listings: 100,
    priceRupees: 500,
    amount: 500 * 100,
    validityDays: 365,
    tagline: 'Great for individual owners & small agents',
  },
  plan_365: {
    id: 'plan_365',
    name: 'Professional',
    listings: 365,
    priceRupees: 1500,
    amount: 1500 * 100,
    validityDays: 365,
    tagline: 'Best value for busy agents & builders',
  },
};

export function getPlan(planId: string): Plan | null {
  return (PLANS as Record<string, Plan>)[planId] ?? null;
}

// ---------------------------------------------------------------------------
// Entitlement
// ---------------------------------------------------------------------------

export interface ActivePack {
  id: string;
  planId: string;
  planName: string;
  listingsQuota: number;
  listingsUsed: number;
  remaining: number;
  expiresAt: string | null;
  activatedAt: string | null;
}

export interface Entitlement {
  isAdmin: boolean;
  unlimited: boolean;
  freeLimit: number;
  freeUsed: number;
  freeRemaining: number;
  /** Total listings remaining across free tier + active packs. */
  totalRemaining: number;
  /** True if the user may create at least one more listing. */
  canCreate: boolean;
  activePacks: ActivePack[];
}

/**
 * Computes the current listing entitlement for a user. Admins are unlimited and
 * never consume quota. Everyone else gets FREE_LISTINGS free, then must hold an
 * active (non-expired) pack with remaining quota. Active packs stack.
 */
export async function getEntitlement(userId: string, role: string): Promise<Entitlement> {
  const isAdmin = role === 'admin';
  if (isAdmin) {
    return {
      isAdmin: true,
      unlimited: true,
      freeLimit: FREE_LISTINGS,
      freeUsed: 0,
      freeRemaining: Infinity,
      totalRemaining: Infinity,
      canCreate: true,
      activePacks: [],
    };
  }

  const now = new Date();
  const [user, packs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { freeListingsUsed: true } }),
    prisma.subscription.findMany({
      where: { userId, status: 'active', expiresAt: { gt: now } },
      orderBy: { activatedAt: 'asc' },
    }),
  ]);

  const freeUsed = user?.freeListingsUsed ?? 0;
  const freeRemaining = Math.max(0, FREE_LISTINGS - freeUsed);

  const activePacks: ActivePack[] = packs.map((p) => ({
    id: p.id,
    planId: p.planId,
    planName: getPlan(p.planId)?.name ?? p.planId,
    listingsQuota: p.listingsQuota,
    listingsUsed: p.listingsUsed,
    remaining: Math.max(0, p.listingsQuota - p.listingsUsed),
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    activatedAt: p.activatedAt ? p.activatedAt.toISOString() : null,
  }));

  const packRemaining = activePacks.reduce((sum, p) => sum + p.remaining, 0);
  const totalRemaining = freeRemaining + packRemaining;

  return {
    isAdmin: false,
    unlimited: false,
    freeLimit: FREE_LISTINGS,
    freeUsed,
    freeRemaining,
    totalRemaining,
    canCreate: totalRemaining > 0,
    activePacks,
  };
}

/**
 * Consumes exactly one listing credit inside an existing transaction. Draws from
 * the free tier first, then from the oldest active pack with remaining quota.
 * Returns the source used, or null if no credit was available (caller should
 * have checked `canCreate` first; this is the atomic guard against races).
 * Admins should never call this — they don't consume quota.
 */
export async function consumeListingCredit(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<{ source: 'free' | 'pack'; packId?: string } | null> {
  const now = new Date();

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { freeListingsUsed: true },
  });

  if (user && user.freeListingsUsed < FREE_LISTINGS) {
    await tx.user.update({
      where: { id: userId },
      data: { freeListingsUsed: { increment: 1 } },
    });
    return { source: 'free' };
  }

  // Oldest active pack that still has quota.
  const pack = await tx.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      expiresAt: { gt: now },
      listingsUsed: { lt: prisma.subscription.fields.listingsQuota },
    },
    orderBy: { activatedAt: 'asc' },
  });

  if (pack) {
    await tx.subscription.update({
      where: { id: pack.id },
      data: { listingsUsed: { increment: 1 } },
    });
    return { source: 'pack', packId: pack.id };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Dev bypass lets the full plan/quota flow be tested without real Razorpay keys.
 * Only active outside production AND only when keys are absent.
 */
export function devBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && !razorpayConfigured();
}

/** Creates a Razorpay order via the REST API (no SDK dependency). */
export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Razorpay order failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Verifies the Razorpay payment signature (HMAC-SHA256 of "orderId|paymentId"). */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');
  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
