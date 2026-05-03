import type { AuraResult } from './types';

export function encodeResult(result: AuraResult): string {
  const json = JSON.stringify(result);
  const encoded = btoa(encodeURIComponent(json));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeResult(encoded: string): AuraResult {
  const padded = encoded + '=='.slice(0, (4 - (encoded.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(base64));
  return JSON.parse(json) as AuraResult;
}
