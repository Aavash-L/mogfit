'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  encodedId: string;
  archetypeName: string;
}

export function ShareButton({ encodedId, archetypeName }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const resultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/result/${encodedId}`
    : `/result/${encodedId}`;

  const archetypeSlug = archetypeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  async function copyLink() {
    await navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadPng() {
    const res = await fetch(`/api/og?data=${encodedId}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-${archetypeSlug}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openTwitter() {
    const text = encodeURIComponent(`I'm a ${archetypeName}. Diagnose your aura at aura.lab`);
    const url = encodeURIComponent(resultUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#FF6B00] hover:bg-[#e65f00] text-white font-mono text-xs tracking-[0.15em] px-6 py-2.5 rounded-lg"
        style={{ boxShadow: '0 0 20px rgba(255,107,0,0.35)' }}
      >
        SHARE RESULT
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111111] border border-[rgba(255,241,234,0.08)] text-[#F5F1EA] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs tracking-[0.22em] text-[#8A8680]">
              — SHARE YOUR VERDICT —
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={copyLink}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[rgba(255,241,234,0.08)] hover:border-[rgba(255,241,234,0.14)] hover:bg-[#161616] transition-colors text-left"
            >
              <div>
                <p className="font-sans text-sm font-medium text-[#F5F1EA]">Copy link</p>
                <p className="font-mono text-[10px] text-[#4A4742] mt-0.5 truncate max-w-[200px]">
                  {resultUrl}
                </p>
              </div>
              <span className={`font-mono text-[10px] shrink-0 ml-3 ${copied ? 'text-[#4ADE80]' : 'text-[#8A8680]'}`}>
                {copied ? 'copied ✓' : 'copy'}
              </span>
            </button>

            <button
              onClick={downloadPng}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[rgba(255,241,234,0.08)] hover:border-[rgba(255,241,234,0.14)] hover:bg-[#161616] transition-colors text-left"
            >
              <div>
                <p className="font-sans text-sm font-medium text-[#F5F1EA]">Download as image</p>
                <p className="font-mono text-[10px] text-[#4A4742] mt-0.5">
                  aura-{archetypeSlug}.png · 1080×1350
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#8A8680] shrink-0 ml-3">↓</span>
            </button>

            <button
              onClick={openTwitter}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[rgba(255,241,234,0.08)] hover:border-[rgba(255,241,234,0.14)] hover:bg-[#161616] transition-colors text-left"
            >
              <div>
                <p className="font-sans text-sm font-medium text-[#F5F1EA]">Post on X / Twitter</p>
                <p className="font-mono text-[10px] text-[#4A4742] mt-0.5">opens in new tab</p>
              </div>
              <span className="font-mono text-[10px] text-[#8A8680] shrink-0 ml-3">↗</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
