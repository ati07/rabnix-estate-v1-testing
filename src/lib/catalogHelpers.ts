// Shared helpers for admin-managed catalog entities (agents, builders, etc.).

// Accepts either a real array or a comma-separated string and returns a clean array.
export function csvToArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((x) => x.trim()).filter(Boolean);
  return [];
}

// Turn a display name into a URL/id-safe slug (e.g. "Ved Prakash" -> "ved-prakash").
export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
