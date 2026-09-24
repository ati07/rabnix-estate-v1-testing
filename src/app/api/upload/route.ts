import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { put } from '@vercel/blob';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

// POST /api/upload  (multipart/form-data, field "files" one or many)
// Uploads to Vercel Blob and returns permanent public URLs.
// Requires BLOB_READ_WRITE_TOKEN (auto-injected on Vercel when a Blob store is
// connected; set it in .env for local development).
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Please sign in to upload.' }, { status: 401 });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Image storage is not configured. Please set BLOB_READ_WRITE_TOKEN.' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided.' }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json({ success: false, error: `Unsupported file type: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ success: false, error: `${file.name} exceeds 5MB.` }, { status: 400 });
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `uploads/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const blob = await put(key, file, { access: 'public', contentType: file.type });
      urls.push(blob.url);
    }

    return NextResponse.json({ success: true, urls });
  } catch (err: any) {
    console.error('upload error', err);
    return NextResponse.json({ success: false, error: 'Upload failed.' }, { status: 500 });
  }
}
