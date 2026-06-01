import Anthropic from '@anthropic-ai/sdk';
import { AURA_SYSTEM_PROMPT } from './prompts/aura-system';
import { GLOW_UP_SYSTEM_PROMPT } from './prompts/glow-up-system';
import type { AuraResult, GlowUpResult, InspoMatchResult } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export async function analyzeAura(imageBase64: string, mimeType: ImageMediaType) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: AURA_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: imageBase64 },
        },
        { type: 'text', text: 'Analyze this fit. Return only the JSON.' }
      ]
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateGlowUp(imageBase64: string, mimeType: ImageMediaType, result: AuraResult): Promise<GlowUpResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: GLOW_UP_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: imageBase64 },
        },
        {
          type: 'text',
          text: `Here is the aura verdict for this fit:\n\n${JSON.stringify(result, null, 2)}\n\nNow generate the glow-up plan. Return only the JSON.`,
        }
      ]
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleaned);
}

const INSPO_MATCH_SYSTEM = `You are Mogfit's inspo analyst. The user uploaded their current outfit and 1–3 inspiration images showing the look they're going for.

Compare their current fit to the inspo and return ONLY this JSON:

{
  "vibe_gap": "<one sentence: what's the energy/aesthetic distance between what they have and what they want>",
  "aligned": ["<specific thing already working toward the inspo vibe>", ...],
  "missing": ["<specific gap — garment, color, proportion, or styling element missing>", ...],
  "additions": [
    { "add": "<specific piece — name it precisely>", "why": "<how it closes the vibe gap>" },
    { "add": "...", "why": "..." }
  ]
}

Rules:
- aligned: 2–4 items. Be specific ("the monochrome palette" not "your colors").
- missing: 2–4 items. Specific gaps only.
- additions: exactly 2–3 pieces. Name them precisely (color, silhouette, material if relevant).
- vibe_gap: punchy, in-voice. "You've got the bones of it, missing the attitude." type energy.
- Roast clothes, never bodies.
- JSON only. No markdown.`;

export async function analyzeInspoMatch(
  currentImageBase64: string,
  currentMimeType: ImageMediaType,
  inspoImages: Array<{ base64: string; mimeType: ImageMediaType }>,
  auraResult: AuraResult
): Promise<InspoMatchResult> {
  const imageContent: Anthropic.ImageBlockParam[] = [
    {
      type: 'image',
      source: { type: 'base64', media_type: currentMimeType, data: currentImageBase64 },
    },
    ...inspoImages.map(img => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: img.mimeType, data: img.base64 },
    })),
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 768,
    system: INSPO_MATCH_SYSTEM,
    messages: [{
      role: 'user',
      content: [
        ...imageContent,
        {
          type: 'text',
          text: `First image is their current outfit (aura score: ${auraResult.aura_score}, archetype: ${auraResult.archetype_name}). The remaining ${inspoImages.length} image(s) are their inspo. Compare and return the JSON.`,
        }
      ]
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleaned);
}
