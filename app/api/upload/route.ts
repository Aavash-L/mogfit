import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  }

  // Vercel auto-generates AuralabBlob_READ_WRITE_TOKEN from the connected blob store.
  // Fall back to BLOB_READ_WRITE_TOKEN for local dev.
  const token =
    process.env.AuralabBlob_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;

  const blob = await put(`fits/${Date.now()}-${filename}`, request.body, {
    access: 'public',
    token,
  });

  return NextResponse.json({ url: blob.url });
}
