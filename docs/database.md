# Database

PostgreSQL, accessed through Prisma. The schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma)
and deliberately **mirrors `src/lib/types.ts`** so the API returns objects the existing UI already expects.

Enums are stored as plain `String` columns (with the allowed values noted in comments) rather than
Prisma enums, to keep migrations flexible. Embedded/structured data (`postedBy`, `nearbyLandmarks`,
`coordinates`) is stored as `Json`; lists (`images`, `amenities`, `documentsSubmitted`) as `String[]`.

## Models

### User
Account + profile. Passwords stored as `passwordHash` (bcrypt). `role` is one of
`buyer | owner | agent | builder | admin`. Supports blocking (`isBlocked`, `blockedReason`).
Relations: `properties` (posted), `inquiriesSent` (as buyer), `inquiriesRecv` (as seller).
Indexed on `role`.

### Property
The listing. Key fields:
- Pricing: `price`, `priceFormatted`, `pricePerSqFt`, `maintenance`
- Layout: `bhk`, `bathrooms`, `balconies`, `carpetAreaSqFt`, `superBuiltUpAreaSqFt`, `furnishing`, `floor`, `totalFloors`, `facing`
- Status: `constructionStatus`, `possessionDate`, `ageOfProperty`
- **Verification:** `isVerified`, `verificationStatus` (`approved | pending | rejected | under_review`), `rejectionReason`
- RERA: `reraId`, `reraApproved`
- Media: `images[]`, `floorPlanImage`, `documentsSubmitted[]`
- Meta: `amenities[]`, `postedBy` (Json), `nearbyLandmarks` (Json), `coordinates` (Json), `inquiriesCount`, `viewsCount`, flags (`isFeatured`, `isExclusiveOwner`, `priceDrop`)
- Ownership: `postedByUserId` → `User` (`onDelete: SetNull`, so deleting a user doesn't delete their listings)

Indexed on `city`, `listingType`, `verificationStatus`, `postedByUserId`.

### Inquiry
A buyer's enquiry about a property. Stores buyer contact snapshot (`buyerName/Phone/Email`),
`message`, `preferredTime`, and `status` (`new | contacted | scheduled | closed`).
Relations: `property` (`onDelete: Cascade`), `buyer`, `seller` (both `SetNull`).
Indexed on `sellerUserId`, `buyerUserId`, `propertyId`.

### ActivityLog
Audit feed for the admin panel: `action`, `actorName`, `actorRole`, `details`,
optional `targetTitle`/`targetId`, and `severity` (`info | success | warning | danger`).
Indexed on `createdAt`.

## Supporting library files

| File | Role |
|------|------|
| `src/lib/prisma.ts` | PrismaClient singleton (reused across hot-reloads in dev) |
| `src/lib/auth.ts` | Password hashing, JWT create/verify, cookie set/clear, `getCurrentUser`, `toPublicProfile` |
| `src/lib/serialize.ts` | Converts DB rows → the UI's `Property`/`Inquiry`/log shapes (dates → strings, Json casts) |

## Migrations & seeding

- Schema changes: edit `prisma/schema.prisma`, then `npm run db:migrate`.
- Seed data: `npm run db:seed` (see [seeded-users.md](./seeded-users.md)).
- Inspect data: `npm run db:studio`.
