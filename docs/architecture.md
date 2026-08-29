# Architecture & Data Flow

## The Context "seams"

The original AI Studio app kept all data in two React Context providers holding hard-coded mock
arrays. The transformation **kept the provider interfaces identical** but swapped their internals
to call the API. Because the interfaces didn't change, the UI components needed almost no edits.

Provider nesting (in `src/app/layout.tsx`):

```
AuthProvider            (src/lib/authContext.tsx)
  └─ PropertyProvider   (src/lib/propertyContext.tsx)   ← calls useAuth() to know the current role/user
       └─ app
```

### AuthProvider (`src/lib/authContext.tsx`)
- On mount, calls `GET /api/auth/me` to restore the session.
- Exposes `loginWithPassword`, `signup`, `logout`, `quickDemoLogin`, `updateProfile`, and admin
  actions (`toggleBlockUser`, `deleteUser`, `updateUserRole`).
- `loginWithOtp` currently returns a "coming soon" message (Phone OTP is deferred).
- When an **admin** signs in, it loads `/api/users` and `/api/activity` for the admin dashboard.

### PropertyProvider (`src/lib/propertyContext.tsx`)
- Reads `useAuth()` to pick the fetch scope: admins load `?scope=all`, everyone else `?scope=public`.
- Exposes `addProperty`, `updateProperty`, `updateVerificationStatus`, `deleteProperty`,
  `addInquiry`, `updateInquiryStatus`, and `resetToDefaultData` (re-syncs from the server).
- **Shortlist** is still client-side (localStorage) — DB persistence is deferred.

## Optimistic UI pattern

Mutations update local React state immediately, fire the API call, then reconcile with the
server's response (or roll back on failure). Example — `addProperty`:

1. Insert an optimistic property (temp id, `pending`) at the top of the list → UI updates instantly.
2. `POST /api/properties`.
3. On success, replace the temp item with the server's real row; on failure, remove it.

This keeps the UI snappy while the database stays the source of truth.

## Server-enforced business rules

These are enforced in the API, not just the UI, so they can't be bypassed:

| Rule | Where |
|------|-------|
| New listings are always `pending` / `isVerified: false` | `POST /api/properties` |
| Only admins can change a listing's `verificationStatus` | `PATCH /api/properties/[id]` |
| Self-registration can never be `admin` | `POST /api/auth/register` |
| Blocked users cannot log in (`403`) | `POST /api/auth/login` |
| Admin-only routes reject non-admins (`403`) | `/api/users`, `/api/activity`, `scope=all` |
| You cannot delete your own admin account | `DELETE /api/users/[id]` |
| Verification/registration changes are recorded | `ActivityLog` writes in the relevant routes |

## End-to-end flow (the core loop)

```
1. Owner signs up / logs in            → POST /api/auth/register|login  (session cookie)
2. Owner uploads photos                → POST /api/upload               (→ /uploads/*.png)
3. Owner submits a listing             → POST /api/properties           (forced: pending)
      → hidden from the public home page
4. Admin logs in, sees it under review → GET /api/properties?scope=all
5. Admin approves it                   → PATCH /api/properties/[id]     (verificationStatus)
      → now visible to everyone on the home page  (GET ?scope=public)
```

This full loop was tested and verified working.

## Auth mechanics

- Login/register sign a JWT (HS256, 7-day expiry) with `jose`, stored in the httpOnly cookie
  `rabnix_session` (secure in production).
- `getCurrentUser()` reads and verifies that cookie on the server for each protected route.
- `toPublicProfile()` strips `passwordHash` before any user object leaves the server.
- `JWT_SECRET` (from `.env`) signs the tokens — set a strong value outside local dev.

## Deferred (not yet built)

- **Phone OTP login** — `loginWithOtp` stubbed; no SMS provider wired.
- **Google sign-in** — dropped for the first pass.
- **Cloud image storage** — currently local `public/uploads`.
- **Shortlist persistence** — currently localStorage, not the DB.
