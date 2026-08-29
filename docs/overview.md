# Overview

## What Rabnix Estate is

A real-estate marketplace where:

- **Visitors / buyers** browse verified property listings on the home page.
- **Owners / agents / builders** sign in and upload their own properties (with real image uploads).
- **Admins** review submitted listings and approve/reject them; only approved listings appear publicly.
- Every user has their own controls (profile, their listings, inquiries).

It started life as a static prototype exported from Google AI Studio (all data was hard-coded
mock data held in React state). It has been rebuilt into a real application backed by a database.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript, React 19 |
| Backend API | Next.js Route Handlers (`src/app/api/**/route.ts`) — a custom Node API |
| Database | PostgreSQL (local) |
| ORM | Prisma v6 (`@prisma/client` + `prisma` CLI) |
| Auth | Custom JWT sessions via [`jose`](https://github.com/panva/jose) (HS256), httpOnly cookie `rabnix_session` |
| Password hashing | `bcryptjs` |
| Styling | Tailwind CSS v4 |
| AI advisor (optional) | Google Gemini (`@google/genai`) |
| Image storage | Local `public/uploads/` folder (swap to cloud on deploy) |

## High-level architecture

```
Browser (React)
  │
  ├── AuthProvider (src/lib/authContext.tsx) ──► /api/auth/*   ──┐
  │                                                              │
  └── PropertyProvider (src/lib/propertyContext.tsx) ─► /api/*   ├─► Prisma ─► PostgreSQL
                                                                 │
        Route Handlers (src/app/api/**/route.ts) ────────────────┘
                    │
                    └── src/lib/auth.ts (JWT, cookies, hashing)
                        src/lib/prisma.ts (DB client singleton)
                        src/lib/serialize.ts (DB row → UI shape)
```

- The two React **Context providers** are the seam between UI and backend. The UI components
  were left largely untouched — the contexts previously held mock data and now call the API instead.
- All **business rules are enforced on the server** (see [architecture.md](./architecture.md)),
  not just in the UI: new listings are always `pending`, self-registration can never be `admin`, etc.

See [what-was-built.md](./what-was-built.md) for the full list of changes.
