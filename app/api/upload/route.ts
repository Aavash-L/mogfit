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

  const blob = await put(`fits/${Date.now()}-${filename}`, request.body, {
    access: 'public',
  });

  return NextResponse.json({ url: blob.url });
}
