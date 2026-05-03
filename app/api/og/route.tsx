import { ImageResponse } from 'next/og';
import { decodeResult } from '@/lib/encode-result';
import { ResultCardJSX } from '@/components/result-card-jsx';

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }
    ).then(r => r.text());

    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;

    return fetch(match[1]).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');
  if (!data) return new Response('Missing data', { status: 400 });

  try {
    const result = decodeResult(data);

    const [interData, monoData] = await Promise.all([
      loadFont('Inter', 800),
      loadFont('JetBrains Mono', 400),
    ]);

    type FontEntry = { name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: 'normal' | 'italic' };
    const fonts: FontEntry[] = [];
    if (interData) fonts.push({ name: 'Inter', data: interData, weight: 800, style: 'normal' });
    if (monoData) fonts.push({ name: 'JetBrains Mono', data: monoData, weight: 400, style: 'normal' });

    return new ImageResponse(<ResultCardJSX result={result} />, {
      width: 1080,
      height: 1350,
      fonts,
    });
  } catch {
    return new Response('Invalid data', { status: 400 });
  }
}
