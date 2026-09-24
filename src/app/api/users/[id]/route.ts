import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword, toPublicProfile } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

const VALID_ROLES: UserRole[] = ['buyer', 'owner', 'agent', 'builder', 'admin'];

// PATCH /api/users/:id — admin only. Block/unblock or change role.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (me?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const data: any = {};
    const logs: any[] = [];

    if (typeof body.isBlocked === 'boolean') {
      data.isBlocked = body.isBlocked;
      data.blockedReason = body.isBlocked ? (body.blockedReason || 'Suspended by Admin for policy violation.') : null;
      data.blockedAt = body.isBlocked ? new Date().toISOString().split('T')[0] : null;
      logs.push({
        action: body.isBlocked ? 'user_blocked' : 'user_unblocked',
        actorName: me.name, actorRole: 'Admin',
        details: body.isBlocked
          ? `Suspended user "${target.name}" (${target.email}). Reason: ${body.blockedReason || 'Policy violation'}`
          : `Reinstated user "${target.name}" (${target.email}).`,
        targetTitle: target.name, targetId: target.id,
        severity: body.isBlocked ? 'danger' : 'success',
      });
    }

    if (body.role && VALID_ROLES.includes(body.role)) {
      data.role = body.role;
    }

    // Editable profile fields (admin-managed).
    if (typeof body.name === 'string' && body.name.trim()) {
      data.name = body.name.trim();
    }
    if (typeof body.email === 'string' && body.email.trim()) {
      const normalizedEmail = body.email.toLowerCase().trim();
      if (normalizedEmail !== target.email) {
        const clash = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (clash) {
          return NextResponse.json({ success: false, error: 'Another account already uses this email.' }, { status: 409 });
        }
        data.email = normalizedEmail;
      }
    }
    if (typeof body.phone === 'string' && body.phone.trim()) {
      data.phone = body.phone.startsWith('+91') ? body.phone.trim() : `+91 ${body.phone.trim()}`;
    }
    if (typeof body.city === 'string') data.city = body.city.trim() || null;
    if (typeof body.companyName === 'string') data.companyName = body.companyName.trim() || null;
    if (typeof body.reraNumber === 'string') data.reraNumber = body.reraNumber.trim() || null;
    if (typeof body.password === 'string' && body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      data.passwordHash = await hashPassword(body.password);
    }

    const updated = await prisma.user.update({ where: { id }, data });
    if (logs.length) await prisma.activityLog.createMany({ data: logs });

    return NextResponse.json({ success: true, user: toPublicProfile(updated) });
  } catch (err: any) {
    console.error('PATCH /api/users/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/:id — admin only.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (me?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    if (me.id === id) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'user_blocked',
        actorName: me.name, actorRole: 'Admin',
        details: `Deleted user profile "${target.name}" (${target.email}) permanently.`,
        targetTitle: target.name, targetId: target.id, severity: 'danger',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/users/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
