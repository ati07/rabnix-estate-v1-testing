# BayBayt — Progress Log

_Last updated: 2026-10-03_

A running record of everything built while turning the AI Studio prototype into a
real, database-backed application being prepared for production. For deeper detail
on any area see the companion docs: [what-was-built.md](./what-was-built.md),
[architecture.md](./architecture.md), [database.md](./database.md),
[api-reference.md](./api-reference.md), [setup.md](./setup.md),
[PRD.md](./PRD.md), and [TEST-PLAN.md](./TEST-PLAN.md).

---

## Where the project stands

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.9 · Prisma v6 · PostgreSQL · Tailwind.
- **Auth:** cookie-based session (`baybayt_session`, httpOnly JWT via jose), bcrypt password hashing.
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
  [baybayt-billing-plans] in project memory.
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

### Phase — Home-section realism & auto-city (2026-10-03)

A sweep to make the home page honest per-city and reduce "fake data" fallbacks, plus
env-driven SEO and auto city detection.

**SEO / metadata**
- `src/app/layout.tsx` now sets `metadataBase` from the environment (`SITE_URL`, falling back to
  `http://localhost:3000`) so OG/Twitter image paths resolve to absolute URLs in production.
  Documented `SITE_URL` in `.env.example`. (Action for deploy: set `SITE_URL` on Vercel.)

**Auto-select city by location**
- New `GET /api/geo` (`src/app/api/geo/route.ts`): permission-free, IP-based city detection using
  Vercel edge geo headers (`x-vercel-ip-latitude/-longitude`, then `x-vercel-ip-city`) → nearest
  supported city. Returns `city: null` when there's no signal (e.g. localhost).
- `src/lib/geoCity.ts`: added `detectCityByIp()` client helper.
- `src/app/page.tsx` mount effect now resolves the active city as: **browser GPS → IP geolocation**,
  and **persists** the result to `localStorage['baybayt_selected_city']` so it carries across every
  page and doesn't re-prompt. Lucknow (and 8 other cities) are mapped in `geoCity.ts`.
- Known limits: detection runs on the home page only (persisted result carries elsewhere); IP
  fallback can't work on localhost (loopback); desktop GPS can be approximate.

**Featured / Top Projects — admin-curated sections + strict city**
- `FeaturedProjectItem` gained `section?: 'featured' | 'top'` (`homeSectionsData.ts`), carried through
  `serializeFeaturedProject` (`serialize.ts`). The DB column already existed — no migration.
- `PATCH /api/projects/[id]` accepts `section` as an **admin-only** change (validated). Admins can now
  move an approved project between the **Featured** and **Top** home rails — so **Top Projects gets
  real data** (previously every submission was hardcoded `section:'featured'`).
- Admin panel (`src/app/admin/page.tsx`): per-project **Featured / Top** segmented toggle +
  `updateProjectSection` handler (optimistic + toast).
- `GET /api/projects` now accepts `?city=` and filters server-side on public reads, with a **per-city
  static fallback**. `FeaturedProjectsSection` / `TopProjectsSection` fetch `?section=…&city=<city>`,
  refetch on city change, **render only that city's projects (no cross-city mixing)**, and
  `return null` when empty.

**Owner-properties rails — truthful + strict city**
- `PopularOwnerPropertiesSection` and `ExclusiveOwnerPropertiesSection` previously fell back to
  other-city owners and then to `properties.slice(0,8)` — showing **non-owner** listings under the
  "0% Brokerage / Owner Direct" badges. Both now filter **strictly** to
  `isExclusiveOwner && city === activeCity` and `return null` when empty, so the owner badges stay
  truthful.

**Management-model notes (for follow-up — see memory `rabnix-home-sections-management`)**
- **Owner rails are admin-curated, not automatic.** A listing appears only after an admin flips the
  **Exclusive Owner** promotion toggle (`handleTogglePromotion`, `admin/page.tsx:355`); new
  submissions default `isExclusiveOwner=false` (POST route omits it). The home rails key off
  `isExclusiveOwner` only (not `postedBy.type==='Owner'`).
- **"Popular" is a misnomer** — no popularity ranking exists; the rail is just owner-flagged listings
  in `createdAt desc` order.
- **The two owner rails are redundant** — both use the same `isExclusiveOwner` filter, so they render
  the same set with different styling. Open question for later: auto-show real owner-posted listings,
  add a real popularity sort, and/or de-duplicate the two rails.
- `npx tsc --noEmit` passes clean for all of the above.

**Owner rails de-duplicated (2026-10-03)**
- Resolved the redundancy above: removed `PopularOwnerPropertiesSection` (the misnamed rail — no
  popularity signal existed) and kept the single `ExclusiveOwnerPropertiesSection` ("Exclusive Owner
  Properties in {city}"). One truthful, admin-curated owner rail; newest-first order is accurate for it.

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
