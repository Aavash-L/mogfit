import { NextResponse } from 'next/server';

// Upload route is no longer used — images are sent as base64 directly to /api/analyze.
export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use /api/analyze with imageBase64.' }, { status: 410 });
}
