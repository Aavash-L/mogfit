# Aura Lab

Viral AI fit-rating app. Upload a fit, get a shareable result card diagnosing your "aura archetype."

## Setup

```bash
npm install
cp .env.local .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (`vercel_blob_rw_...`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Your domain for Plausible analytics (e.g. `aura.lab`) |
| `NEXT_PUBLIC_APP_URL` | Full URL of your deployment (e.g. `https://aura.lab`) for OG image resolution |

## Deploy

```bash
vercel deploy
```

Set all env vars in the Vercel dashboard. After deploy, update `NEXT_PUBLIC_APP_URL` to your production URL.

## Adding New Archetypes

Edit `lib/prompts/aura-system.ts`. Add entries to the **ARCHETYPE LIBRARY** section following the format:

```
- "Archetype Name" — tag: "lowercase tag line, no punctuation unless it fits"
```

Keep tier placement consistent with the scoring rubric (ELITE/HIGH/MID/LOW). The prompt tells Claude it can also invent new archetypes on the fly — the library is examples, not an exhaustive list.

## How It Works

1. User drops a fit pic → uploads to Vercel Blob (`/api/upload`)
2. Client POSTs blob URL to `/api/analyze` → Claude vision returns JSON archetype
3. Result JSON is base64url-encoded into the URL → redirects to `/result/{encoded}`
4. `/result/[id]` page decodes and renders the card
5. Share button generates a 1080×1350 PNG via `/api/og` using Satori

No database. No accounts. Long URLs are the trade-off for zero infra.

## File Structure

```
app/
  page.tsx              landing page
  layout.tsx            root layout + fonts
  result/[id]/page.tsx  result page (server component)
  api/
    upload/route.ts     POST file → Vercel Blob URL
    analyze/route.ts    POST imageUrl → Claude JSON
    og/route.tsx        GET ?data= → 1080×1350 PNG

components/
  upload-zone.tsx       drag/drop upload client component
  result-card.tsx       browser result card
  result-card-jsx.tsx   Satori-compatible card for OG PNG
  loading-scan.tsx      "scanning..." terminal animation
  share-button.tsx      copy/download/tweet dialog
  archetype-strip.tsx   sample cards on landing page

lib/
  types.ts              AuraResult + AuraPiece types
  anthropic.ts          Claude analyze() function
  blob.ts               Vercel Blob upload helper
  encode-result.ts      base64url encode/decode for URL params
  prompts/
    aura-system.ts      THE system prompt
```
