import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Corrects historical fake seed values so listing stats reflect real activity:
//   viewsCount     -> 0 (no real view history exists prior to view tracking)
//   inquiriesCount -> the actual number of Inquiry rows for that property
// Run: node scripts/_reset_listing_counts.mjs

const props = await p.property.findMany({ select: { id: true, title: true } });
let updated = 0;
for (const prop of props) {
  const realInquiries = await p.inquiry.count({ where: { propertyId: prop.id } });
  await p.property.update({
    where: { id: prop.id },
    data: { viewsCount: 0, inquiriesCount: realInquiries },
  });
  updated++;
}

console.log(JSON.stringify({ ok: true, propertiesReset: updated }, null, 2));
await p.$disconnect();
