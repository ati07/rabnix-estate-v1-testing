# Local Setup

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** running locally (or any reachable Postgres instance)

## 1. Install dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate` to build the Prisma client.

## 2. Configure environment

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

`.env` (git-ignored) needs:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Postgres connection string used by Prisma | `postgres://postgres:password@localhost:5432/rabnix_estate` |
| `JWT_SECRET` | Secret for signing session JWTs (HS256) | generate: `openssl rand -hex 32` |
| `GEMINI_API_KEY` | *(optional)* Google Gemini key for the AI advisor | — |

Make sure the database named in `DATABASE_URL` exists (e.g. `createdb rabnix_estate`).

## 3. Migrate the database

```bash
npm run db:migrate     # prisma migrate dev — creates the tables
```

## 4. Seed demo data

```bash
npm run db:seed        # prisma db seed — 5 users + properties + inquiries + logs
```

This prints the login credentials table on completion. See [seeded-users.md](./seeded-users.md).

## 5. Run the dev server

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:3000`, or `3001` if 3000 is busy).
Log in with any account from [seeded-users.md](./seeded-users.md).

## npm scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `next dev` | Start the dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Run the production build |
| `lint` | `eslint .` | Lint |
| `clean` | `next clean` | Clear the Next.js build cache |
| `db:migrate` | `prisma migrate dev` | Apply schema migrations |
| `db:seed` | `prisma db seed` | Seed the database (runs `tsx prisma/seed.ts`) |
| `db:studio` | `prisma studio` | Open Prisma Studio (DB GUI) |
| `postinstall` | `prisma generate` | Regenerate the Prisma client after install |

## Notes & gotchas

- **Prisma is pinned to v6.** Do not let it upgrade to the 8.x release-candidate — it has a
  reworked, unstable CLI. Keep `prisma` and `@prisma/client` on `^6`.
- **Uploaded images** land in `public/uploads/` and are git-ignored (only `.gitkeep` is tracked).
  This is fine for local dev; move to cloud storage (e.g. Cloudinary/S3) before deploying.
- **Reseeding wipes data.** `npm run db:seed` clears the tables first — don't run it against data you care about.
