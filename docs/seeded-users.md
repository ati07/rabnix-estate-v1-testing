# Seeded Users & Demo Data

These accounts are created by `prisma/seed.ts` when you run `npm run db:seed`.
Passwords are stored **bcrypt-hashed** in the database; the plaintext below is only for logging in.

> Re-running the seed **wipes and recreates** all users, properties, inquiries, and activity logs
> (in FK-safe order). It is meant for development.

## Demo login credentials

| Role | Name | Email | Password | Phone | City |
|------|------|-------|----------|-------|------|
| **admin** | Rabnix Master Admin | `admin@rabnixestate.com` | `admin123` | +91 80000 99099 | National (HQ) |
| **owner** | Priya Venkatesh | `owner@rabnix.com` | `password123` | +91 98450 11223 | Bangalore |
| **buyer** | Rahul Sharma | `buyer@rabnix.com` | `password123` | +91 98765 43210 | Bangalore |
| **agent** | Vikram Deshmukh | `agent@rabnix.com` | `password123` | +91 98200 99887 | Mumbai |
| **builder** | Amit Singhal | `builder@rabnix.com` | `password123` | +91 99110 55443 | Delhi / NCR |

### Extra profile fields on some accounts

| Role | Company | RERA number |
|------|---------|-------------|
| admin | Rabnix Estate Verification Division | — |
| agent | Prestige Realty Advisors | PRM/KA/RERA/1251/310/AG/210412/00189 |
| builder | Godrej Properties Ltd | DLRERA2019P0004 |

All seeded users have `isPhoneVerified` and `isEmailVerified` set to `true`.

You can also use the **"Quick Demo Login"** buttons on the `/auth` page — they log in with the
credentials above via the normal email/password endpoint.

## Other seeded data

- **Properties** — imported from `src/lib/realEstateData.ts` (`INITIAL_PROPERTIES`). Most are
  `approved`, with a deliberate mix so you can see every verification state in the admin panel:
  - index **1** → `pending`
  - index **5** → `under_review`
  - index **7** → `rejected` (with a sample rejection reason about a RERA mismatch)
  - all others → `approved`
  
  Each property is attributed to a demo user based on its `postedBy.type`:
  `Builder`→builder, `Verified Agent`→agent, `Owner`/other→owner. Views and inquiry counts are randomised.

- **Inquiry** — one inquiry from *Rahul Sharma (buyer)* against the first property, addressed to the *builder*.

- **Activity logs** — two entries: a `property_verified` (success) and a `user_registered` (info),
  shown in the admin activity feed.

## Security notes

- **Self-registration can never create an admin.** The `/api/auth/register` endpoint rejects the
  `admin` role — admins only exist via the seed (or a manual DB/role change by an existing admin).
- Change `admin123` / `password123` before any non-local deployment, and set a strong `JWT_SECRET`.
