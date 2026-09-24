import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const [users, properties, approved, builders, projects, agents, collections, inquiries] = await Promise.all([
  p.user.count(),
  p.property.count(),
  p.property.count({ where: { verificationStatus: 'approved' } }),
  p.builder.count(),
  p.featuredProject.count(),
  p.agent.count(),
  p.collection.count(),
  p.inquiry.count(),
]);
console.log(JSON.stringify({ users, properties, approved, builders, projects, agents, collections, inquiries }, null, 2));
await p.$disconnect();
