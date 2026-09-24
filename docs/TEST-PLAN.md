# Rabnix Estate — Feature Inventory & Test Plan

> Generated 2026-09-21. This is the master checklist of everything built so far and how
> to verify it. Status legend: ⬜ not tested · ✅ pass · ❌ fail · ⚠️ partial/blocked.

## ▶ TEST RUN RESULTS (2026-09-21, live API against Postgres)

**Score: 53 / 53 endpoint checks pass once the one bug below is accounted for.**
First automated pass: 41/52 (11 cascade failures). All 11 stemmed from a single bug.
Re-run of the property/inquiry lifecycle with a *real registered user*: **12/12 pass.**

### 🐞 BUG-1 (real, needs fix) — demo/seeded accounts can't create properties
- **Symptom:** `POST /api/properties` → **500** for any account logged in via the demo
  credentials (`owner@rabnix.com`, `admin@rabnixestate.com`, etc.).
- **Cause:** `login/route.ts:21-29` resolves seeded demo emails through
  `DEMO_FALLBACK_USERS`, which returns synthetic IDs (`demo-owner`, …). Those IDs are
  **not real `User` rows**, so `postedByUserId: 'demo-owner'` violates
  `Property_postedByUserId_fkey` (Prisma P2003).
- **Blast radius (first run):** cascaded into 2.5, 2.8, 2.9, 2.10, 4.1, 4.2, 4.3 (all
  needed a created property). Freshly *registered* users are real rows → unaffected.
- **Fix options:** (a) in login, prefer the real DB user over the demo fallback when the
  DB is reachable; or (b) seed the demo users with these exact fixed IDs; or (c) in
  `POST /api/properties`, upsert/verify the user row before create.

### ⚠️ Observation — startup log noise
`Bad control character in string literal in JSON` printed at dev-server boot (appears
tied to the Console Ninja editor extension, not an app route — all endpoints respond
200). Low priority; verify it's absent under a plain `next build`/`next start`.

### ✅ Feature added — admin promotion flags (home-rail placement)
Made `isFeatured` / `isExclusiveOwner` (+ sibling `priceDrop`) **admin-only** promotion
flags so admins can push an approved listing into the curated home rails.
- API (`PATCH /api/properties/:id`): flags now handled in an admin-only block (owners get
  403 "Only admins can change promotion flags"); logs a `property_promoted` activity entry.
  Closed a prior loophole where `isFeatured` was owner-editable.
- Admin UI (`/admin` → RERA Verification queue): each listing has a **"Home Rails"** toggle
  row — **Feature** (amber) and **Exclusive Owner** (green) buttons.
- Automated test `scripts/_promote_test.mjs`: **6/6 pass** — owner blocked (403), owner
  normal edit still 200, admin sets both flags, listing becomes Owner-rail eligible, admin
  can demote, and the action is logged.
- End-to-end publish flow `scripts/_e2e_publish.mjs`: **PASS** — register→post→pending
  (hidden)→admin approve→LIVE→appears at rank 0 of "Fresh Properties in Bangalore".

### Not covered by automated run (need manual/UI or API key)
- File upload (6.x) — needs multipart; not scripted yet.
- Gemini AI valuation/chat (7.2–7.4) — need `GEMINI_API_KEY`; heuristic 7.1 & 7.5 pass.
- Front-end pages (§9) — need browser/`/verify`; not clicked through yet.

---


## Stack under test
- Next.js 15 (App Router) + React 19 + TypeScript
- PostgreSQL + Prisma v6, JWT auth (`jose`) in httpOnly cookie `rabnix_session`
- Google Gemini for AI advisor + valuation (optional `GEMINI_API_KEY`)
- Image upload to local `public/uploads`

## Test users (seeded)
| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| admin  | admin@rabnixestate.com    | admin123    |
| owner  | owner@rabnix.com          | password123 |
| buyer  | buyer@rabnix.com          | password123 |
| agent  | agent@rabnix.com          | password123 |
| builder| builder@rabnix.com        | password123 |

> Note: these also work as **demo fallback** users even if the DB is down/unseeded.

---

## 0. Pre-flight / environment
| # | Check | Status |
|---|-------|--------|
| 0.1 | `.env` present with `DATABASE_URL`, `JWT_SECRET` | ⬜ |
| 0.2 | Postgres reachable; `npm run db:migrate` applies cleanly | ⬜ |
| 0.3 | `npm run db:seed` seeds users + properties + catalog | ⬜ |
| 0.4 | `npx next dev` boots (watch for port 3000/3001) | ⬜ |
| 0.5 | `npm run build` compiles with no type errors | ⬜ |

---

## 1. Authentication & Session
Routes: `src/app/api/auth/*`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 1.1 | Sign up (register) | POST `/api/auth/register` | Creates user, sets cookie, returns profile; role forced to buyer/owner/agent/builder (never admin) | ⬜ |
| 1.2 | Register validation | POST `/api/auth/register` | 400 if missing name/email/phone/pwd; 400 if pwd < 6; 409 if email exists | ⬜ |
| 1.3 | Login (email) | POST `/api/auth/login` | Valid creds → cookie + profile | ⬜ |
| 1.4 | Login (phone) | POST `/api/auth/login` | Last-10-digit phone match works | ⬜ |
| 1.5 | Login demo accounts | POST `/api/auth/login` | Demo users work with admin123/password123 even w/o DB | ⬜ |
| 1.6 | Login wrong password | POST `/api/auth/login` | 401 invalid | ⬜ |
| 1.7 | Blocked user login | POST `/api/auth/login` | 403 with suspension reason | ⬜ |
| 1.8 | Current user | GET `/api/auth/me` | Returns user when cookie valid, null otherwise | ⬜ |
| 1.9 | Update own profile | PATCH `/api/auth/profile` | Updates name/phone/city/avatar/company/rera; 401 if not auth | ⬜ |
| 1.10 | Logout | POST `/api/auth/logout` | Clears cookie | ⬜ |
| 1.11 | Auth UI page | `/auth` | Signup + login forms render and call APIs | ⬜ |

---

## 2. Properties (core CRUD)
Routes: `src/app/api/properties/*`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 2.1 | List public | GET `/api/properties?scope=public` | Approved listings + own pending (if logged in) | ⬜ |
| 2.2 | List all (admin) | GET `/api/properties?scope=all` | 403 for non-admin; everything for admin | ⬜ |
| 2.3 | List mine | GET `/api/properties?mine=1` | Only current user's; 401 if not auth | ⬜ |
| 2.4 | Empty-DB fallback | GET `/api/properties` | Falls back to INITIAL_PROPERTIES | ⬜ |
| 2.5 | Create listing | POST `/api/properties` | Auth required; starts `pending`/unverified; 400 if no city/locality/price | ⬜ |
| 2.6 | Blocked cannot post | POST `/api/properties` | 403 for blocked user | ⬜ |
| 2.7 | Get by id | GET `/api/properties/:id` | Returns property, 404 if missing (with static fallback) | ⬜ |
| 2.8 | Edit own listing | PATCH `/api/properties/:id` | Owner edits allowed fields; 403 if not owner/admin | ⬜ |
| 2.9 | Admin verify/reject | PATCH `/api/properties/:id` | Only admin can set verificationStatus; sets isVerified + logs | ⬜ |
| 2.10 | Delete listing | DELETE `/api/properties/:id` | Owner or admin; 403 otherwise; logs deletion | ⬜ |
| 2.11 | Post-property UI | `/post-property` | Form + image upload → creates listing | ⬜ |
| 2.12 | Properties list UI | `/properties` | Search/filter renders live listings | ⬜ |
| 2.13 | Property detail UI | `/properties/[id]` | Detail page renders, inquiry form present | ⬜ |

---

## 3. Users management (admin)
Routes: `src/app/api/users/*`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 3.1 | List users | GET `/api/users` | Admin only (403 otherwise); no password hashes | ⬜ |
| 3.2 | Block/unblock | PATCH `/api/users/:id` | Admin sets isBlocked + reason + date; logs | ⬜ |
| 3.3 | Change role | PATCH `/api/users/:id` | Admin sets valid role | ⬜ |
| 3.4 | Delete user | DELETE `/api/users/:id` | Admin only; cannot delete self (400) | ⬜ |

---

## 4. Inquiries (leads)
Routes: `src/app/api/inquiries/*`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 4.1 | List inquiries | GET `/api/inquiries` | Admin: all; others: sent+received; [] if not auth | ⬜ |
| 4.2 | Create inquiry | POST `/api/inquiries` | 400 if no property/name/phone; 404 if property missing; increments count + logs | ⬜ |
| 4.3 | Update status | PATCH `/api/inquiries/:id` | Seller or admin; valid status new/contacted/scheduled/closed | ⬜ |

---

## 5. Activity log (admin)
Route: `src/app/api/activity`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 5.1 | Activity feed | GET `/api/activity` | Admin only (403 otherwise); latest 50 | ⬜ |

---

## 6. File upload
Route: `src/app/api/upload`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 6.1 | Upload images | POST `/api/upload` | Auth required; multipart `files`; returns `/uploads/*` URLs | ⬜ |
| 6.2 | Type/size guard | POST `/api/upload` | Rejects non-image types; rejects > 5MB | ⬜ |

---

## 7. AI features
Routes: `src/app/api/valuation`, `src/app/api/gemini/advisor`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 7.1 | Valuation (heuristic) | POST `/api/valuation` | Returns price band, rental, comparables w/o API key | ⬜ |
| 7.2 | Valuation (AI enhanced) | POST `/api/valuation` | Adds Gemini commentary when `GEMINI_API_KEY` set | ⬜ |
| 7.3 | AI valuation action | POST `/api/gemini/advisor` `{action:'valuation'}` | Structured JSON valuation (needs key) | ⬜ |
| 7.4 | Genie chat | POST `/api/gemini/advisor` `{action:'chat'}` | Advisory reply (needs key) | ⬜ |
| 7.5 | Invalid action | POST `/api/gemini/advisor` | 400 on unknown action | ⬜ |

---

## 8. Catalog content (DB-backed with static fallback)
Routes: `src/app/api/{builders,projects,agents,collections,localities}/*`
| # | Feature | Method / Route | Expected | Status |
|---|---------|----------------|----------|--------|
| 8.1 | Builders list | GET `/api/builders` | DB rows or static fallback | ⬜ |
| 8.2 | Builder detail | GET `/api/builders/:id` | Single builder by slug | ⬜ |
| 8.3 | Projects list | GET `/api/projects?section=featured\|top` | Section-filtered or all | ⬜ |
| 8.4 | Project detail | GET `/api/projects/:id` | Single project by slug | ⬜ |
| 8.5 | Agents list | GET `/api/agents` | DB rows or static fallback | ⬜ |
| 8.6 | Agent detail | GET `/api/agents/:id` | Single agent by slug | ⬜ |
| 8.7 | Collections list | GET `/api/collections` | DB rows or static fallback | ⬜ |
| 8.8 | Collection detail | GET `/api/collections/:id` | Single collection by slug | ⬜ |
| 8.9 | Localities | GET `/api/localities?city=` | Curated tiles w/ live approved counts overlaid | ⬜ |

---

## 9. Front-end pages (render + data wiring)
| # | Page | Route | Status |
|---|------|-------|--------|
| 9.1 | Home | `/` | ⬜ |
| 9.2 | Properties search | `/properties` | ⬜ |
| 9.3 | Property detail | `/properties/[id]` | ⬜ |
| 9.4 | Post property | `/post-property` | ⬜ |
| 9.5 | Dashboard | `/dashboard` | ⬜ |
| 9.6 | Admin panel | `/admin` | ⬜ |
| 9.7 | Auth | `/auth` | ⬜ |
| 9.8 | Builders directory | `/builders` + `/builders/[id]` | ⬜ |
| 9.9 | Collections | `/collections` + `/collections/[id]` | ⬜ |
| 9.10 | Agent detail | `/agents/[id]` | ⬜ |
| 9.11 | Project detail | `/projects/[id]` | ⬜ |

---

## 10. Authorization matrix (cross-cutting)
| Actor | Can | Cannot |
|-------|-----|--------|
| Guest | browse public listings/catalog, submit inquiry, valuation | post property, upload, see admin data |
| Buyer/Owner/Agent/Builder | post/edit/delete OWN listing, upload, see own inquiries, edit own profile | verify listings, list/manage users, see activity log |
| Admin | everything: verify/reject listings, list/block/delete users, all inquiries, activity feed | delete own admin account |

---

## How to run these tests
1. **API level (fastest):** with dev server up, hit endpoints with `curl`/PowerShell `Invoke-RestMethod`, chaining the `rabnix_session` cookie from login. Covers §1–§8.
2. **UI level:** click through pages in §9 in a browser, or use the `/verify` skill.
3. **Static level (no DB needed):** `npm run build` for §0.5 to catch type/compile errors across every route and page.
