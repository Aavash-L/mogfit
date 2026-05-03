import { analyzeAura } from '@/lib/anthropic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No imageUrl provided' }, { status: 400 });
    }

    const result = await analyzeAura(imageUrl);

    if (result.error) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed. Try a clearer fit pic.' }, { status: 500 });
  }
}
