# What Was Built — Mock → Real Transformation

A changelog of turning the AI Studio prototype into a real, database-backed app.

## 0. Recovery (before any features)

The app was broken on arrival: an earlier commit had **deleted 36 files (~16k lines)** instead of
moving them into `src/`. All files were recovered from the previous good commit into `src/`, restoring
the working prototype before new work began.

## 1. Database layer (new)

- **`prisma/schema.prisma`** — four models: `User`, `Property`, `Inquiry`, `ActivityLog`, mirroring
  `src/lib/types.ts`. See [database.md](./database.md).
- **`prisma/seed.ts`** — seeds 5 demo users (bcrypt-hashed), imports `INITIAL_PROPERTIES` with a mix
  of verification states, and adds one inquiry + two activity logs. See [seeded-users.md](./seeded-users.md).
- **`src/lib/prisma.ts`** — PrismaClient singleton (hot-reload safe).
- Pinned Prisma to **v6** (avoided the unstable 8.x RC).

## 2. Auth layer (new)

- **`src/lib/auth.ts`** (`server-only`) — `hashPassword`/`verifyPassword` (bcrypt),
  `createSessionToken`/`verifySessionToken` (jose HS256, 7-day), `setSessionCookie`/`clearSessionCookie`
  (cookie `rabnix_session`), `getCurrentUser`, `toPublicProfile` (strips password hash).
- Uses `JWT_SECRET` from the environment.

## 3. API routes (new) — `src/app/api/`

- **Auth:** `register`, `login`, `logout`, `me`, `profile`.
- **Properties:** `properties` (GET scoped + POST), `properties/[id]` (GET/PATCH/DELETE).
- **Upload:** `upload` (multipart image upload to `public/uploads/`).
- **Users (admin):** `users` (GET), `users/[id]` (PATCH/DELETE).
- **Inquiries:** `inquiries` (GET/POST), `inquiries/[id]` (PATCH).
- **Activity (admin):** `activity` (GET).
- **`src/lib/serialize.ts`** — converts DB rows to the UI's expected shapes.

Full details in [api-reference.md](./api-reference.md).

## 4. Wiring the UI to the API (rewritten internals, same interface)

- **`src/lib/authContext.tsx`** — now API-backed: loads the session on mount, real
  login/signup/logout, admin data loading, optimistic profile/user updates. Kept the same exported
  interface (plus a lightweight `DEMO_USERS` map for dashboard avatars). `loginWithOtp` returns a
  "coming soon" message.
- **`src/lib/propertyContext.tsx`** — now API-backed with optimistic updates; picks fetch scope
  from the current role. Shortlist kept client-side for now.
- **`src/components/PostPropertyModal.tsx`** — added real file upload UI (dropzone + thumbnails +
  remove), posting to `/api/upload`; falls back to a pasted photo URL.
- **`src/components/AuthForm.tsx`** — quick-demo login made async.
- **`src/app/auth/page.tsx`** — redirects to `/` once authenticated.

## 4b. Navbar & location (later tweaks)

- **Removed "Home Loans"** from the navbar (`src/components/Navbar.tsx`). The EMI
  Calculator it linked to is still reachable from the top bar and the mobile menu.
- **Location by geolocation** — the home page now sets the active city from the visitor's
  device location:
  - **`src/lib/geoCity.ts`** (new) — asks the browser (`navigator.geolocation`) for
    coordinates and maps them to the **nearest supported city** via haversine distance
    against a built-in coordinate table for all 9 cities. Fully client-side; no API key.
  - **`src/app/page.tsx`** — on first visit, auto-detects and sets the nearest city.
    A manual choice is saved to `localStorage` and never overridden; if location is denied
    or unavailable it falls back silently to the default (Bangalore).
  - **`src/components/CitySelectorModal.tsx`** — added a **"Use my current location"**
    button (spinner + error state) so users can trigger/re-trigger detection anytime.

## 5. Config & housekeeping

- **`.env`** — `DATABASE_URL`, generated `JWT_SECRET` (git-ignored).
- **`.env.example`** — documents the real vars (`DATABASE_URL`, `JWT_SECRET`, optional `GEMINI_API_KEY`).
- **`package.json`** — added `db:migrate`, `db:seed`, `db:studio`, `postinstall`, and the
  `prisma.seed` hook.
- **`.gitignore`** — ignore `public/uploads/*` (keep `.gitkeep`) and `*.tsbuildinfo`.

## 6. Verification

The full core loop was tested end-to-end and confirmed working:
- Public home shows only approved listings; owners see their own pending ones.
- Register → login → upload image (writes to disk) → post listing (forced pending) →
  admin approves → listing appears publicly.
- Security guards return the right `401`/`403` codes; all pages compile and serve `200`.

## Deferred (agreed for later)

Phone OTP login · Google sign-in · Cloud image storage (Cloudinary/S3) · Shortlist DB persistence.
