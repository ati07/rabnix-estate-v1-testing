import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const email = (process.argv[2] || 'atiurrahman.ansari@gmail.com').toLowerCase().trim();

const user = await p.user.findUnique({ where: { email } });
if (!user) {
  console.log(JSON.stringify({ ok: false, error: `No user found with email ${email}. Register/sign up first, then re-run.` }, null, 2));
  await p.$disconnect();
  process.exit(1);
}

const before = user.role;
const updated = await p.user.update({ where: { email }, data: { role: 'admin', isBlocked: false } });

await p.activityLog.create({
  data: {
    action: 'user_registered',
    actorName: updated.name,
    actorRole: 'Admin',
    details: `Role elevated to ADMIN (was ${before}) via admin provisioning script.`,
    targetTitle: updated.name,
    targetId: updated.id,
    severity: 'success',
  },
});

console.log(JSON.stringify({ ok: true, email: updated.email, name: updated.name, roleBefore: before, roleAfter: updated.role }, null, 2));
await p.$disconnect();
