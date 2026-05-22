# Mogfit

**AI aura analysis for outfits.** Upload a fit, get a score and breakdown — built around a dark, brutalist aesthetic.

🌐 **Live:** [mogfit.xyz](https://mogfit.xyz)

---

## What it does

Mogfit analyzes outfit photos using vision-language models and returns an "aura score" with a breakdown of style, fit, color theory, and aesthetic coherence. Built for the chronically-online style discourse crowd — meant to be sharable, fast, and visually distinct.

The hard problem isn't running a VLM against an image — it's making the output feel consistent, opinionated, and useful instead of generic AI slop.

---

## How it works

1. User uploads an outfit photo
2. Vision-language model extracts structured visual attributes (color palette, garment types, layering, silhouette, accessories)
3. Reasoning layer scores the fit across multiple dimensions
4. Frontend renders the breakdown in a custom brutalist UI

---

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **AI:** Vision-language model API for image understanding
- **Backend:** Python for image preprocessing and the scoring pipeline
- **Deployment:** Vercel
- **Design:** Custom brutalist UI — no component libraries, no rounded corners

---

## Why I built it

I wanted to ship something at the intersection of two areas I find genuinely interesting: AI-native consumer products and visual taste. Most AI tools right now look the same — soft gradients, rounded cards, pastel palettes. Mogfit is the opposite of that on purpose. The design is part of the product.

It's also a testbed for a broader question I keep coming back to: how do you make AI output feel like it has opinions, instead of just summarizing what it sees?

---

## Status

Live and iterating. Currently working on:
- Improving consistency of style scores across diverse outfit types
- Adding social/share mechanics
- Mobile-first redesign

---

## Other projects

Building things solo lately:
- [Rotgen.org](https://rotgen.org) — AI video platform, $30K MRR
- [Portfolio](https://aavashlamichhane.com)

📫 alamichhane158@gmail.com
