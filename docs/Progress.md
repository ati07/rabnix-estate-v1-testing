# Rabnix Estate — Progress Log

_Last updated: 2026-09-25_

A running record of everything built while turning the AI Studio prototype into a
real, database-backed application being prepared for production. For deeper detail
on any area see the companion docs: [what-was-built.md](./what-was-built.md),
[architecture.md](./architecture.md), [database.md](./database.md),
[api-reference.md](./api-reference.md), [setup.md](./setup.md),
[PRD.md](./PRD.md), and [TEST-PLAN.md](./TEST-PLAN.md).

---

## Where the project stands

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.9 · Prisma v6 · PostgreSQL · Tailwind.
- **Auth:** cookie-based session (`rabnix_session`, httpOnly JWT via jose), bcrypt password hashing.
- **Data:** everything the UI shows is now backed by the database — no mock data paths on the
  primary flows. Static seed data survives only as a graceful fallback when the DB is empty.
- **Build health:** `npx tsc --noEmit` and `npm run build` both pass clean.
- **Deploy:** Vercel; `prisma migrate deploy` runs on build. Image uploads use the local
  filesystem in dev and Vercel Blob in production.

---

## Milestone timeline

### Phase 0 — Recovery & project setup
- Recovered the prototype (an earlier commit had deleted ~36 files / ~16k lines) and moved the app
  into `src/`.
- Initialized the Next.js project structure, fixed `tsconfig` path mappings, moved routes into the
  App Router (`app/`).

### Phase 1 — Real backend foundation
- **Database layer:** `prisma/schema.prisma` (User, Property, Inquiry, ActivityLog to start),
  `prisma/seed.ts` (demo users + `INITIAL_PROPERTIES` + sample inquiry/activity),
  `src/lib/prisma.ts` singleton. Pinned Prisma to **v6**.
- **Auth layer:** `src/lib/auth.ts` — password hashing, JWT session tokens, session cookie helpers,
  `getCurrentUser`, `toPublicProfile`.
- **API routes:** auth (`register`/`login`/`logout`/`me`/`profile`), properties (+`[id]`),
  users (admin), inquiries (+`[id]`), activity (admin), upload. `src/lib/serialize.ts` maps DB rows
  to the shapes the UI already expects.
- **UI wiring:** `authContext` and `propertyContext` rewritten to be API-backed (same public
  interface) with optimistic updates. Post-property and auth forms wired to real endpoints.
- **Housekeeping:** `.env` / `.env.example`, `db:migrate` / `db:seed` / `db:studio` scripts,
  `.gitignore` for uploads.

### Phase 2 — Property types, valuation & navigation
- Added property types and AI valuation tooling.
- Property page navigation and dynamic routes across the app.
- Trimmed home-page chrome; fixed hero search dropdown clipping.
- Home city detection via browser geolocation (nearest supported city, `localStorage`-sticky).

### Phase 3 — Production hardening
- **Admin access control** and user CRUD; relabeled the misleading "SUPER ADMIN" badge to "ADMIN";
  removed the ungated Admin Verification Portal menu item.
- **Catalog APIs** for builders, projects, collections, localities.
- Sign-in now redirects to `/dashboard`.
- Profile photo upload + real-data profile editing on the dashboard.

### Phase 4 — Images, listings realism & billing
- **Uploads:** local filesystem in dev, **Vercel Blob** in production for persistence.
- Device photo upload on both the full post-property form and the inline dashboard form.
- **Real listing metrics:** view counts and inquiry counts are now real; a property view is
  recorded per browser to power the dashboard trend charts (real time-series).
- Blank enquiry form that reveals the seller's contact only after submit.
- **Billing:** Razorpay listing plans with quota enforcement (credit-pack model; active packs stack;
  free-tier allowance; enforced in `POST /api/properties`; dev bypass). See
  [rabnix-billing-plans] in project memory.
- Dashboard fixed to show only listings the account actually owns.

### Phase 5 — Directory & home wiring
- Home page collections, builders, and hero locality search wired to the DB.
- `/projects` and `/agents` index pages added; "See all" links fixed.
- Removed the Price Trends navbar links.

---

## Today — Preferred Agents redesign (single source of truth)

**Problem:** Preferred Agents lived in a standalone `Agent` catalog table, disconnected from real
`User` accounts. Admin-created directory agents had no login and no real listings, so the two data
sets drifted apart — not acceptable for production.

**Decision (agreed with the product owner):** an agent is a real account. Preferred Agents are now
`User` rows with `role='agent'`, and an admin-curated `isPreferredAgent` flag decides who appears in
the public directory. One record now holds the login, the marketing profile, and (by relation) the
real listings.

### What changed
- **Schema + migration** (`prisma/migrations/20260925090000_agents_as_users`): agent marketing fields
  added to `User` (`isPreferredAgent`, `agencyLogo`, `agentBadge`, `agentRating`, `operatingSince`,
  `experienceYears`, `buyersServed`, `specializations[]`, `areasServed[]`, `languages[]`,
  `agentAbout`) + an `isPreferredAgent` index; the standalone **`Agent` table was dropped**.
- **Types & auth:** `UserProfile` (`src/lib/types.ts`) and `toPublicProfile` (`src/lib/auth.ts`)
  carry the new agent fields.
- **Serialization:** `serializeAgent` → `serializeAgentUser(user, counts)` in `src/lib/serialize.ts`,
  mapping a preferred-agent User to the directory card shape.
- **APIs:**
  - `GET /api/agents` — returns preferred-agent Users, ordered by rating, with **live-computed**
    for-sale / for-rent listing counts (Prisma `groupBy` over approved properties; rent = `rent`+`pg`,
    sale = the rest). Falls back to static data when the DB is empty.
  - `GET /api/agents/[id]` — returns the agent plus **only the properties they actually posted**
    (`postedByUserId === agent.id`, approved). The old re-badging demo helper is kept only as a
    fallback for legacy/static agents with no real account. (POST/PATCH/DELETE removed — mutations
    now go through the user endpoints.)
  - `PATCH /api/users/[id]` (admin) — allowlist extended with the agent editorial fields
    (`isPreferredAgent`, `agentBadge`, `agentRating`) and marketing fields; logs promote/demote.
  - `PATCH /api/auth/profile` (self) — allowlist extended with the agent's self-serve marketing
    fields. Editorial fields are deliberately **excluded** (stay admin-only).
- **Admin panel** (`src/app/admin/page.tsx`): the "Preferred Agents" tab is now **curation, not
  creation** — it lists all agent accounts, offers a promote/demote toggle, and an editorial editor
  (badge, rating, agency, etc.). "Add Agent" removed.
- **Agent dashboard** (`src/app/dashboard/page.tsx`): agents get a self-serve "Agent Directory"
  section in the Appearance tab to maintain their public profile.
- **Agent profile page** (`src/app/agents/[id]/page.tsx`): listing count no longer uses a fake
  `|| 111` fallback; it shows the real count (including 0).
- **Shared helper:** `src/lib/catalogHelpers.ts` (`csvToArray`, `slugify`).

**Production note:** seeded demo agents have no properties attributed to them, so their profiles show
real (often empty) listings rather than fabricated ones — this is intentional. No demo data is
injected to make counts look bigger.

---

## What is real vs. deferred

**Real / DB-backed:** auth & sessions, properties (CRUD + moderation), inquiries, activity log,
users & admin CRUD, uploads (local/Blob), view & inquiry analytics, billing (Razorpay), builders,
projects, collections, localities, and now agents.

**Deferred (agreed for later):** Phone OTP login · Google sign-in · additional cloud image providers
· shortlist DB persistence (currently client-side).

---

## Verification

- `npx tsc --noEmit` — passes.
- `npm run build` — passes (all 20 static pages generate; API routes render on demand).
