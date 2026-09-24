import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEntitlement, PLANS, razorpayConfigured, devBypassEnabled } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/billing — plans catalog + the current user's listing entitlement.
export async function GET() {
  const user = await getCurrentUser();

  const plans = Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    listings: p.listings,
    priceRupees: p.priceRupees,
    validityDays: p.validityDays,
    tagline: p.tagline,
  }));

  if (!user) {
    return NextResponse.json({ success: true, authenticated: false, plans });
  }

  const entitlement = await getEntitlement(user.id, user.role);

  return NextResponse.json({
    success: true,
    authenticated: true,
    plans,
    entitlement: {
      ...entitlement,
      // JSON can't carry Infinity — send null for unlimited (admin).
      freeRemaining: entitlement.unlimited ? null : entitlement.freeRemaining,
      totalRemaining: entitlement.unlimited ? null : entitlement.totalRemaining,
    },
    payment: {
      // Lets the dashboard show "test mode" and skip loading checkout.js.
      devBypass: devBypassEnabled(),
      configured: razorpayConfigured(),
    },
  });
}
