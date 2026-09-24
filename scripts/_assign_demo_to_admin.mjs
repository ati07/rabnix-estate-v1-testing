import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Reassigns ownership of ALL existing (demo/seed) property listings to an admin
// account, so they no longer surface in fresh seller dashboards and can be
// bulk-deleted from the admin's "My Listings".
// Prefers the real operator admin; falls back to any admin, then the seeded one.
// Run: node scripts/_assign_demo_to_admin.mjs

const admin =
  (await p.user.findFirst({ where: { email: 'atiurrahman.ansari@gmail.com', role: 'admin' } })) ||
  (await p.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } }));

if (!admin) {
  console.error('No admin user found. Aborting.');
  await p.$disconnect();
  process.exit(1);
}

const result = await p.property.updateMany({
  data: { postedByUserId: admin.id },
});

console.log(
  JSON.stringify(
    { ok: true, assignedTo: { id: admin.id, email: admin.email }, listingsMoved: result.count },
    null,
    2,
  ),
);
await p.$disconnect();
