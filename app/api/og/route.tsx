import { ImageResponse } from 'next/og';
import { decodeResult } from '@/lib/encode-result';
import { ResultCardJSX } from '@/components/result-card-jsx';

// Fetch font from Google Fonts with a UA that returns TTF/OTF.
// Returns null on any failure — ImageResponse falls back to system sans.
async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' },
        signal: AbortSignal.timeout(3000),
      }
    ).then(r => r.text());

    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match?.[1]) return null;

    return fetch(match[1], { signal: AbortSignal.timeout(3000) }).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');
  if (!data) return new Response('Missing data', { status: 400 });

  let result;
  try {
    result = decodeResult(data);
  } catch {
    return new Response('Invalid data', { status: 400 });
  }

  try {
    const [interData, monoData] = await Promise.all([
      loadFont('Inter', 800),
      loadFont('JetBrains Mono', 400),
    ]);

    type FontEntry = {
      name: string;
      data: ArrayBuffer;
      weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
      style: 'normal' | 'italic';
    };
    const fonts: FontEntry[] = [];
    if (interData) fonts.push({ name: 'Inter', data: interData, weight: 800, style: 'normal' });
    if (monoData) fonts.push({ name: 'JetBrains Mono', data: monoData, weight: 400, style: 'normal' });

    const full = searchParams.get('full') === '1';
    return new ImageResponse(<ResultCardJSX result={result} full={full} />, {
      width: 1080,
      height: 1350,
      fonts,
    });
  } catch (err) {
    console.error('[og]', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
