# API Reference

All endpoints are Next.js Route Handlers under `src/app/api/`. Requests/responses are JSON
(except `/api/upload`, which is multipart). Auth is via the httpOnly `rabnix_session` cookie,
set automatically on login/register.

Legend: 🔓 public · 🔑 any signed-in user · 👑 admin only · 🧍 resource owner (or admin)

## Auth — `/api/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | 🔓 | Create an account. Role must be one of buyer/owner/agent/builder (**admin is rejected**). Hashes the password, creates the user, writes an activity log, sets the session cookie. |
| POST | `/api/auth/login` | 🔓 | Log in with `emailOrPhone` + `password`. Matches by email or by phone digits. Rejects blocked users with `403`. Verifies the bcrypt hash and sets the session cookie. |
| POST | `/api/auth/logout` | 🔑 | Clears the session cookie. |
| GET | `/api/auth/me` | 🔑 | Returns the current user's public profile (or `null` if not signed in). |
| PATCH | `/api/auth/profile` | 🔑 | Update the signed-in user's own editable fields (name, city, avatar, company, etc.). |

## Properties — `/api/properties`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/properties?scope=public` | 🔓 | Public listings: `approved` properties **plus** the caller's own (any status). Default scope. |
| GET | `/api/properties?scope=all` | 👑 | Every property, any status (admin dashboard). |
| GET | `/api/properties?mine=1` | 🔑 | Only the caller's own properties. |
| POST | `/api/properties` | 🔑 | Create a listing. Server **forces** `verificationStatus: "pending"` and `isVerified: false` — users cannot self-approve. Attributes the property to the caller. |
| GET | `/api/properties/[id]` | 🔓* | Fetch one property. |
| PATCH | `/api/properties/[id]` | 🧍/👑 | Owner may edit listing fields. **Only an admin** may change `verificationStatus` (approve/reject/under_review); such changes are written to the activity log. |
| DELETE | `/api/properties/[id]` | 🧍/👑 | Owner or admin may delete. |

\* A non-approved property is only meaningfully visible to its owner/an admin.

## Image upload — `/api/upload`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/upload` | 🔑 | `multipart/form-data`, field name `files` (one or many). Validates image MIME types, max **5 MB** each, uploads to **Vercel Blob** (public access), and returns `{ success, urls: ["https://…public.blob.vercel-storage.com/…"] }`. Requires `BLOB_READ_WRITE_TOKEN`. |

## Users — `/api/users` (admin)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users` | 👑 | List all users (public profiles, no password hashes). |
| PATCH | `/api/users/[id]` | 👑 | Block/unblock (`isBlocked` + `blockedReason`) or change a user's `role`. |
| DELETE | `/api/users/[id]` | 👑 | Delete a user. **Cannot delete yourself.** |

## Inquiries — `/api/inquiries`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/inquiries` | 🔑 | Inquiries relevant to the caller (as buyer or seller; admins see all). |
| POST | `/api/inquiries` | 🔓/🔑 | Create an inquiry against a property; increments that property's inquiry count. |
| PATCH | `/api/inquiries/[id]` | 🧍/👑 | Seller (or admin) updates status: new → contacted → scheduled → closed. |

## Activity log — `/api/activity` (admin)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/activity` | 👑 | Latest 50 system activity entries for the admin feed. |

## AI advisor — `/api/gemini/advisor` (optional)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/gemini/advisor` | 🔑 | Calls Google Gemini for property advice/valuation. Requires `GEMINI_API_KEY`; disabled without it. |

## Common status codes

- `401` — not signed in.
- `403` — signed in but not allowed (e.g. non-admin hitting an admin route, or a blocked user logging in).
- `404` — resource not found.
- `400` — validation error (missing/invalid fields, bad upload type/size).
