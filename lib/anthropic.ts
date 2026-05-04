import Anthropic from '@anthropic-ai/sdk';
import { AURA_SYSTEM_PROMPT } from './prompts/aura-system';
import { FIX_AURA_SYSTEM_PROMPT } from './prompts/fix-aura-system';
import type { AuraResult } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export async function generateFix(result: AuraResult) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: FIX_AURA_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate the fix plan for this aura scan result.\n\n${JSON.stringify(result, null, 2)}`,
    }],
  });
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleaned);
}

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
