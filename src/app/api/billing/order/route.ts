import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPlan, createRazorpayOrder, devBypassEnabled, razorpayConfigured } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/billing/order — start a purchase. Creates a pending Subscription row
// and (in production / when keys are set) a Razorpay order the client checks out.
// In dev without keys, returns devBypass:true so the flow can be tested end-to-end.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Please sign in to buy a plan.' }, { status: 401 });
    }
    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admins have unlimited listings and do not need a plan.' },
        { status: 400 },
      );
    }
    if (user.isBlocked) {
      return NextResponse.json({ success: false, error: 'Blocked accounts cannot buy plans.' }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as { planId?: string };
    const plan = getPlan(body.planId ?? '');
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Unknown plan.' }, { status: 400 });
    }

    const bypass = devBypassEnabled();

    let razorpayOrderId: string | null = null;
    if (!bypass) {
      if (!razorpayConfigured()) {
        return NextResponse.json(
          { success: false, error: 'Payments are not configured. Please try again later.' },
          { status: 503 },
        );
      }
      const order = await createRazorpayOrder({
        amount: plan.amount,
        currency: 'INR',
        receipt: `rbx_${Date.now()}`,
        notes: { userId: user.id, planId: plan.id },
      });
      razorpayOrderId = order.id;
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        listingsQuota: plan.listings,
        amount: plan.amount,
        currency: 'INR',
        status: 'created',
        razorpayOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      devBypass: bypass,
      order: bypass
        ? null
        : {
            id: razorpayOrderId,
            amount: plan.amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
          },
      plan: { id: plan.id, name: plan.name, listings: plan.listings, priceRupees: plan.priceRupees },
      prefill: { name: user.name, email: user.email, contact: user.phone },
    });
  } catch (err: any) {
    console.error('POST /api/billing/order error', err);
    return NextResponse.json({ success: false, error: 'Could not start the purchase.' }, { status: 500 });
  }
}
