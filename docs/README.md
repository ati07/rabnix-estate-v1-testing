# Rabnix Estate — Documentation

This folder documents how Rabnix Estate was transformed from an AI Studio mock/prototype
into a **real, working application** with authentication, a database, user property uploads,
and admin verification.

## Contents

| Doc | What's inside |
|-----|---------------|
| [overview.md](./overview.md) | What the app is, the tech stack, and the high-level architecture |
| [what-was-built.md](./what-was-built.md) | Full changelog of the mock → real transformation |
| [setup.md](./setup.md) | How to install, configure `.env`, migrate, seed, and run locally |
| [seeded-users.md](./seeded-users.md) | **Demo login credentials** and other seeded data |
| [api-reference.md](./api-reference.md) | Every API endpoint, its method, auth rules, and behaviour |
| [database.md](./database.md) | Prisma schema — the four models and their fields |
| [architecture.md](./architecture.md) | Data flow, the Context "seams", and business rules |

## TL;DR

- **Stack:** Next.js 15 (App Router) · Custom Node API (route handlers) · PostgreSQL · Prisma v6 · JWT auth (`jose`) · bcrypt.
- **Run it:** `npm run db:migrate` → `npm run db:seed` → `npm run dev`.
- **Log in:** see [seeded-users.md](./seeded-users.md) — e.g. `admin@rabnixestate.com` / `admin123`.
