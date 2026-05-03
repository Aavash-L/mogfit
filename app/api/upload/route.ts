import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    // Buffer the body — more reliable than streaming in Vercel's runtime
    const buffer = await request.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    // AuralabBlob_READ_WRITE_TOKEN is auto-injected by Vercel when the blob store
    // is connected with custom prefix "AuralabBlob". BLOB_READ_WRITE_TOKEN is the
    // local dev fallback.
    const token =
      process.env.AuralabBlob_READ_WRITE_TOKEN ||
      process.env.BLOB_READ_WRITE_TOKEN;

    const contentType =
      request.headers.get('content-type') ?? 'application/octet-stream';

    const blob = await put(`fits/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType,
      token,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('[upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
