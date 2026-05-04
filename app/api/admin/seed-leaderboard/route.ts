import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import type { AuraResult } from '@/lib/types';

function encodeResult(result: AuraResult): string {
  const json = JSON.stringify(result);
  const encoded = btoa(encodeURIComponent(json));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

const FAKE_SCANS: Array<AuraResult & { daysAgo: number }> = [
  {
    archetype_name: 'Runway Civilian',
    archetype_tag: 'somehow makes editorial feel accidental',
    aura_score: 934, tier: 'ELITE', tier_percentile: 'TOP 2%',
    short_roast: 'This outfit wasn\'t planned. That\'s exactly why it works.\nYou dress like you\'re late for something important and don\'t care that you\'re not.',
    pieces: [
      { name: 'Oversized Blazer', verdict: 'carrying the whole look on its shoulders. literally.', delta: 190, type: 'good' },
      { name: 'Wide-Leg Trousers', verdict: 'proportion game is unmatched', delta: 155, type: 'good' },
      { name: 'Barely-There Heel', verdict: 'the restraint here is doing heavy lifting', delta: 130, type: 'good' },
    ],
    how_perceived: 'People assume you work in fashion or date someone who does. You get stopped on the street. You never give a straight answer about where you got anything.',
    rare_traits: ['accidental editorial energy', 'proportion intuition', 'restraint as power move'],
    daysAgo: 1,
  },
  {
    archetype_name: 'Old Money Adjacent',
    archetype_tag: 'the inheritance isn\'t real but the posture is',
    aura_score: 911, tier: 'ELITE', tier_percentile: 'TOP 3%',
    short_roast: 'You didn\'t grow up with money but you dress like you summered somewhere.\nEvery piece is neutral, every fit is clean, and nothing has a visible price tag.',
    pieces: [
      { name: 'Cashmere Sweater', verdict: 'the kind of soft money can buy and humility can\'t fake', delta: 175, type: 'good' },
      { name: 'Leather Loafers', verdict: 'worn in exactly the right amount', delta: 145, type: 'good' },
      { name: 'Slim Chinos', verdict: 'no pleats, no breaks, no notes', delta: 110, type: 'good' },
    ],
    how_perceived: 'People assume you went to a school with a sailing team. You get good service at restaurants without asking. Nobody questions your opinions in meetings.',
    rare_traits: ['logoless authority', 'inherited-looking fit', 'neutral palette dominance'],
    daysAgo: 2,
  },
  {
    archetype_name: 'Off-Duty Villain',
    archetype_tag: 'technically just a coat but somehow threatening',
    aura_score: 891, tier: 'HIGH', tier_percentile: 'TOP 7%',
    short_roast: 'You look like you own a building in a city you\'ve never smiled in.\nThe all-black isn\'t a phase. It\'s a lifestyle with a retirement plan.',
    pieces: [
      { name: 'Long Black Coat', verdict: 'you bought this for a reason. it worked.', delta: 165, type: 'good' },
      { name: 'Structured Black Bag', verdict: 'the kind of bag that contains either a laptop or evidence', delta: 120, type: 'good' },
      { name: 'Black Ankle Boots', verdict: 'completing the threat level appropriately', delta: 95, type: 'good' },
    ],
    how_perceived: 'People get out of your way on the sidewalk. Not because you\'re unfriendly — because you look like you have somewhere to be and a plan when you get there.',
    rare_traits: ['monochrome threat energy', 'silhouette as statement', 'unspoken authority'],
    daysAgo: 3,
  },
  {
    archetype_name: 'Midnight Overthinker',
    archetype_tag: 'intellectually restless, emotionally layered, chronically online',
    aura_score: 847, tier: 'HIGH', tier_percentile: 'TOP 11%',
    short_roast: 'You\'ve rewatched that one scene 11 times and still haven\'t texted back.\nThe all-black fit isn\'t a mood — it\'s a load-bearing personality trait.',
    pieces: [
      { name: 'Oversized Black Coat', verdict: 'doing 60% of the work. correctly.', delta: 160, type: 'good' },
      { name: 'Worn-In Boots', verdict: 'character. actual character. rare.', delta: 95, type: 'good' },
      { name: 'Tote With Visible Book', verdict: 'the book is load-bearing. hope it\'s good.', delta: -45, type: 'bad' },
    ],
    how_perceived: 'People think you\'re either a writer, a therapist, or someone who\'s been to therapy a lot. You get recommended obscure films. You get asked for advice at 2am.',
    rare_traits: ['monochrome as identity', 'intentional wear patina', 'intellectual signaling via accessories'],
    daysAgo: 4,
  },
  {
    archetype_name: 'Main Character Spring',
    archetype_tag: 'the city is your backdrop and you know it',
    aura_score: 856, tier: 'HIGH', tier_percentile: 'TOP 9%',
    short_roast: 'You leave the house like you\'re being followed by a camera crew.\nThis fit is a thesis statement. The thesis is "I look good and I\'m going somewhere interesting."',
    pieces: [
      { name: 'Flowy Midi Dress', verdict: 'moves like it was choreographed', delta: 155, type: 'good' },
      { name: 'Strappy Sandals', verdict: 'the walk is part of the outfit', delta: 105, type: 'good' },
      { name: 'Woven Bag', verdict: 'textural contrast done right', delta: 90, type: 'good' },
    ],
    how_perceived: 'Strangers take pictures of you thinking you\'re someone. You might be. The cafe puts your order at the front.',
    rare_traits: ['movement as style element', 'seasonal alignment', 'effortless main-character casting'],
    daysAgo: 5,
  },
  {
    archetype_name: 'Power Brunch',
    archetype_tag: 'orders the eggs benedict and closes the deal',
    aura_score: 834, tier: 'HIGH', tier_percentile: 'TOP 13%',
    short_roast: 'This is what happens when "smart casual" gets a performance review and passes.\nYou look approachable enough to talk to and put-together enough that nobody wastes your time.',
    pieces: [
      { name: 'Silk Blouse', verdict: 'the effort-to-elegance ratio is optimal', delta: 150, type: 'good' },
      { name: 'Tailored Trousers', verdict: 'not a suit, not sweatpants. correct.', delta: 120, type: 'good' },
      { name: 'Simple Gold Jewelry', verdict: 'just enough to mean something', delta: 85, type: 'good' },
    ],
    how_perceived: 'People ask you for the best restaurant in any city. You always know. You negotiate without raising your voice.',
    rare_traits: ['smart casual mastery', 'power without formality', 'approachable authority'],
    daysAgo: 6,
  },
  {
    archetype_name: 'Brutalist Romantic',
    archetype_tag: 'soft inside, concrete outside',
    aura_score: 845, tier: 'HIGH', tier_percentile: 'TOP 10%',
    short_roast: 'Hard silhouettes, unexpected soft detail. You contain contradictions on purpose.\nThe structured outer layer is protection. The silk underneath is the truth.',
    pieces: [
      { name: 'Structured Jacket', verdict: 'architectural. intentional. winning.', delta: 160, type: 'good' },
      { name: 'Delicate Chain Necklace', verdict: 'the contrast is the whole point', delta: 100, type: 'good' },
      { name: 'Chunky Boots', verdict: 'grounds everything, adds edge', delta: 80, type: 'good' },
    ],
    how_perceived: 'People find you interesting before you say anything. You attract the kind of people who read poetry and lift weights.',
    rare_traits: ['texture contradiction mastery', 'structural softness', 'layered visual narrative'],
    daysAgo: 7,
  },
  {
    archetype_name: 'Corporate Escapee',
    archetype_tag: 'quit in march, still dressing like it',
    aura_score: 803, tier: 'HIGH', tier_percentile: 'TOP 18%',
    short_roast: 'You left the job but kept the blazer. Smart.\nThis is what happens when "business casual" goes freelance and stops caring about performance reviews.',
    pieces: [
      { name: 'Relaxed Blazer', verdict: 'formal memory, casual present. works.', delta: 140, type: 'good' },
      { name: 'Clean White Tee', verdict: 'doing the quiet work underneath', delta: 90, type: 'good' },
      { name: 'Straight Jeans', verdict: 'the denim pivot was the right call', delta: 75, type: 'good' },
    ],
    how_perceived: 'People assume you consult for someone important on a flexible schedule. You do. Sort of.',
    rare_traits: ['structured-casual pivot', 'post-corporate ease', 'wardrobe transition done right'],
    daysAgo: 9,
  },
  {
    archetype_name: 'Art School Dropout',
    archetype_tag: 'the dropout part was a choice, not a failure',
    aura_score: 769, tier: 'MID', tier_percentile: 'TOP 31%',
    short_roast: 'Technically everything clashes. Somehow nothing does.\nYou mix prints like a person who knows exactly what they\'re doing and also has never owned a mirror.',
    pieces: [
      { name: 'Graphic Tee (Obscure Band)', verdict: 'load-bearing cultural signaling', delta: 110, type: 'good' },
      { name: 'Patterned Trousers', verdict: 'brave. possibly too brave. but brave.', delta: 45, type: 'good' },
      { name: 'Platform Shoes', verdict: 'adds height and chaos in equal measure', delta: -60, type: 'bad' },
    ],
    how_perceived: 'People assume you have strong opinions about coffee and film grain. You do. You are always the most interesting person at the party who leaves early.',
    rare_traits: ['intentional clash theory', 'cultural-reference layering', 'commitment to the bit'],
    daysAgo: 10,
  },
  {
    archetype_name: 'Quiet Luxury Rookie',
    archetype_tag: 'getting there. almost. not yet.',
    aura_score: 792, tier: 'MID', tier_percentile: 'TOP 24%',
    short_roast: 'You understand the assignment but you over-explained it in one piece.\nThe logo bag is doing 40% of the work and also undermining 30% of it.',
    pieces: [
      { name: 'Camel Coat', verdict: 'this is exactly right, keep this', delta: 150, type: 'good' },
      { name: 'Monogram Bag', verdict: 'the logo is louder than everything else you\'re wearing', delta: -95, type: 'bad' },
      { name: 'Pointed Flats', verdict: 'correct. no notes.', delta: 105, type: 'good' },
    ],
    how_perceived: 'People think you\'re wealthy but recently. Not wrong.',
    rare_traits: ['almost-quiet luxury', 'one-piece contradiction', 'transitional wardrobe energy'],
    daysAgo: 12,
  },
  {
    archetype_name: 'Coastal Nepotism',
    archetype_tag: 'the yacht is borrowed but the confidence isn\'t',
    aura_score: 756, tier: 'MID', tier_percentile: 'TOP 33%',
    short_roast: 'You dress like summer is a personality and you got there by knowing the right people.\nLinen, sun, and connections — the holy trinity.',
    pieces: [
      { name: 'Linen Shirt (Oversized)', verdict: 'the texture alone carries confidence', delta: 120, type: 'good' },
      { name: 'White Shorts', verdict: 'clean. functional. nautical.', delta: 80, type: 'good' },
      { name: 'Raffia Hat', verdict: 'this is either genius or a prop. fine either way.', delta: -40, type: 'bad' },
    ],
    how_perceived: 'People assume you know someone who owns a boat. You do. You\'ve been on the boat twice.',
    rare_traits: ['linen as authority', 'seasonal identity lock-in', 'borrowed confidence energy'],
    daysAgo: 13,
  },
  {
    archetype_name: 'Resort Siren',
    archetype_tag: 'the dress is doing exactly what it was hired to do',
    aura_score: 742, tier: 'MID', tier_percentile: 'TOP 36%',
    short_roast: 'Nude slip dress at a rooftop bar — a classic play, executed with suspicious confidence.\nThis outfit has been to Mykonos, Tulum, and your ex\'s Instagram explore page.',
    pieces: [
      { name: 'Nude Slip Dress', verdict: 'does exactly one thing and does it without apology', delta: 140, type: 'good' },
      { name: 'Chain Shoulder Bag', verdict: 'quiet luxury cosplay — the chain is doing the heavy lifting', delta: 75, type: 'good' },
      { name: 'Single Lace Glove', verdict: 'one glove means you either lost the other one or you\'re unhinged', delta: -110, type: 'bad' },
    ],
    how_perceived: 'Strangers assume she\'s either someone\'s girlfriend on a brand trip or an influencer in the 50k-200k bracket.',
    rare_traits: ['single-glove asymmetry', 'nude-on-neutral restraint', 'anti-color commitment'],
    daysAgo: 14,
  },
  {
    archetype_name: 'Vintage Delusion',
    archetype_tag: 'it\'s not old it\'s archival',
    aura_score: 723, tier: 'MID', tier_percentile: 'TOP 38%',
    short_roast: 'You call it vintage. Everyone else calls it a gamble.\nSomewhere between actual fashion knowledge and hoarding with a narrative.',
    pieces: [
      { name: '90s Blazer', verdict: 'authentically archival. this one is real.', delta: 130, type: 'good' },
      { name: 'Vintage Band Tee', verdict: 'you\'ve actually listened to the album. rare.', delta: 95, type: 'good' },
      { name: 'Mismatched Accessories', verdict: 'this is where the theory breaks down a little', delta: -85, type: 'bad' },
    ],
    how_perceived: 'People assume you know things about fashion history they don\'t. Sometimes you do.',
    rare_traits: ['archival authenticity', 'temporal dressing', 'thrift conviction'],
    daysAgo: 15,
  },
  {
    archetype_name: 'Tech Bro Redemption',
    archetype_tag: 'traded the hoodie for something with structure',
    aura_score: 701, tier: 'MID', tier_percentile: 'TOP 42%',
    short_roast: 'You found out clothes have shapes and it changed everything.\nThe fit is 70% better than last year. The sneakers are still doing too much.',
    pieces: [
      { name: 'Clean Oxford Shirt', verdict: 'the pivot is real and it\'s working', delta: 120, type: 'good' },
      { name: 'Slim Chinos', verdict: 'correct trouser. finally.', delta: 90, type: 'good' },
      { name: 'Chunky Designer Sneakers', verdict: 'you spent $400 to look like you\'re still in 2021', delta: -130, type: 'bad' },
    ],
    how_perceived: 'People know you work in tech but assume you\'re one of the good ones now. The sneakers create doubt.',
    rare_traits: ['wardrobe pivot in progress', 'structure discovery', 'sneaker conflict unresolved'],
    daysAgo: 16,
  },
  {
    archetype_name: 'Thrift Oracle',
    archetype_tag: 'found it for $4 and it fits better than your rent',
    aura_score: 678, tier: 'MID', tier_percentile: 'TOP 45%',
    short_roast: 'You have an eye that can\'t be bought. Which is fortunate because you wouldn\'t buy it anyway.\nEvery piece has a story. You will tell it.',
    pieces: [
      { name: 'Vintage Levi\'s', verdict: '1994, perfect fade, cost $8. infuriating.', delta: 150, type: 'good' },
      { name: 'Thrifted Blazer', verdict: 'fits better than it has any right to', delta: 100, type: 'good' },
      { name: 'Worn-Out Sneakers', verdict: 'the distress is real and it\'s too real', delta: -95, type: 'bad' },
    ],
    how_perceived: 'People ask where you got everything. You give vague answers. You have a system and it\'s yours.',
    rare_traits: ['thrift curation eye', 'denim provenance knowledge', 'budget maximalism'],
    daysAgo: 17,
  },
  {
    archetype_name: 'Goblin Mode Chic',
    archetype_tag: 'technically dressed, spiritually elsewhere',
    aura_score: 712, tier: 'MID', tier_percentile: 'TOP 40%',
    short_roast: 'This is what happens when comfort wins but ego doesn\'t fully concede.\nYou look like you got dressed in the dark and the dark had decent taste.',
    pieces: [
      { name: 'Oversized Hoodie', verdict: 'the softness is a lifestyle and it shows', delta: 80, type: 'good' },
      { name: 'Cargo Pants', verdict: 'functional. many pockets. zero apologies.', delta: 70, type: 'good' },
      { name: 'Slides Over Socks', verdict: 'you knew this was a choice. you chose it anyway.', delta: -75, type: 'bad' },
    ],
    how_perceived: 'People assume you\'re either a creative director on a day off or someone\'s cool older sibling. Both are correct.',
    rare_traits: ['comfort-maximalism', 'pocket dependency', 'deliberate anti-effort'],
    daysAgo: 18,
  },
  {
    archetype_name: 'Festival Veteran',
    archetype_tag: 'has been to seven, dresses like a sophomore at the first',
    aura_score: 667, tier: 'MID', tier_percentile: 'TOP 47%',
    short_roast: 'You know better. You dress like you don\'t.\nThe cowboy hat is back. The body glitter is back. They were never gone for you.',
    pieces: [
      { name: 'Crochet Top', verdict: 'technically it\'s having a moment. technically.', delta: 85, type: 'good' },
      { name: 'Cowboy Hat', verdict: 'commitment to the festival bit is almost admirable', delta: -70, type: 'bad' },
      { name: 'Platform Boots', verdict: 'surviving 12 hours standing is a personality trait now', delta: 60, type: 'good' },
    ],
    how_perceived: 'People assume you know the lineup better than the organizers. You do. The hat makes them nervous.',
    rare_traits: ['festival costume commitment', 'seasonal style suspension', 'heat-defiant layering'],
    daysAgo: 20,
  },
  {
    archetype_name: 'Unhinged Academic',
    archetype_tag: 'the PhD is almost done. the fit is fully done.',
    aura_score: 645, tier: 'MID', tier_percentile: 'TOP 49%',
    short_roast: 'You dress like someone interrupted you mid-thought, which is accurate.\nThe elbow patches are load-bearing and so is the chaos.',
    pieces: [
      { name: 'Corduroy Blazer', verdict: 'the texture is correct. the wrinkles are not.', delta: 110, type: 'good' },
      { name: 'Random Graphic Tee Underneath', verdict: 'this is either a mistake or a thesis', delta: -80, type: 'bad' },
      { name: 'Scuffed Oxford Shoes', verdict: 'they were nice once. they remember.', delta: -55, type: 'bad' },
    ],
    how_perceived: 'People assume you know things deeply and own zero full-length mirrors. Both true.',
    rare_traits: ['academic-to-chaos pipeline', 'texture-over-condition philosophy', 'elbow patch honesty'],
    daysAgo: 21,
  },
  {
    archetype_name: 'Core Era Unspecified',
    archetype_tag: 'arrived at the aesthetic without reading the brief',
    aura_score: 634, tier: 'MID', tier_percentile: 'TOP 51%',
    short_roast: 'You discovered a "core" on TikTok and committed before fully understanding it.\nThe execution is 70% there. The remaining 30% is still loading.',
    pieces: [
      { name: 'Trendy Statement Piece', verdict: 'you did the research. the research was a Reel.', delta: 90, type: 'good' },
      { name: 'Mismatched Basics', verdict: 'the foundation needs work', delta: -85, type: 'bad' },
      { name: 'On-Trend Shoes', verdict: 'these are correct. hold onto this knowledge.', delta: 95, type: 'good' },
    ],
    how_perceived: 'People think you\'re almost onto something. You are. Give it two seasons.',
    rare_traits: ['trend-adjacent intuition', 'algorithmic influence', 'aesthetic in progress'],
    daysAgo: 23,
  },
  {
    archetype_name: 'Sad Beige Girlie',
    archetype_tag: 'the aesthetic is intentional. probably.',
    aura_score: 589, tier: 'LOW', tier_percentile: 'TOP 58%',
    short_roast: 'Every colour you own exists between cream and oat.\nYou found minimalism and minimalism found you and now nothing has happened since.',
    pieces: [
      { name: 'Beige Linen Set', verdict: 'matched but missing something. everything.', delta: 60, type: 'good' },
      { name: 'Nude Ballet Flats', verdict: 'disappearing into the palette with intention', delta: -90, type: 'bad' },
      { name: 'Oat Tote', verdict: 'the tote chose you. you did not choose back.', delta: -100, type: 'bad' },
    ],
    how_perceived: 'People think you have very clean shelves. You do. They think you\'re calm. You are, by necessity.',
    rare_traits: ['full palette surrender', 'texture as the only dimension', 'beige dependency'],
    daysAgo: 25,
  },
  {
    archetype_name: 'Accidental Classic',
    archetype_tag: 'three items, zero questions, somehow works',
    aura_score: 612, tier: 'MID', tier_percentile: 'TOP 54%',
    short_roast: 'This is the outfit equivalent of a shrug that lands perfectly.\nWhite tee, olive bomber, straight jeans — she found the formula in 2019 and hasn\'t reopened the file.',
    pieces: [
      { name: 'White Tee', verdict: 'the anchor. always correct.', delta: 100, type: 'good' },
      { name: 'Olive Bomber', verdict: 'adds structure without trying', delta: 85, type: 'good' },
      { name: 'Straight Leg Jeans', verdict: 'found the right fit and stopped looking. wise.', delta: 75, type: 'good' },
    ],
    how_perceived: 'People describe your style as "effortless" which is the greatest compliment and also slightly inaccurate.',
    rare_traits: ['formula mastery', 'three-piece sufficiency', 'seasonal neutrality'],
    daysAgo: 26,
  },
  {
    archetype_name: 'Silent CEO',
    archetype_tag: 'looks expensive. probably is. won\'t explain why.',
    aura_score: 923, tier: 'ELITE', tier_percentile: 'TOP 3%',
    short_roast: 'No logo. No effort. Somehow the most intimidating person in the room.\nThis is what it looks like when money stops trying.',
    pieces: [
      { name: 'Cashmere Crewneck', verdict: 'the kind of soft that only comes from money or inheritance', delta: 180, type: 'good' },
      { name: 'Straight-Leg Trousers', verdict: 'perfect break. you measured this twice.', delta: 145, type: 'good' },
      { name: 'Minimal Watch', verdict: 'says more than a billboard. says nothing out loud.', delta: 120, type: 'good' },
    ],
    how_perceived: 'People assume you run something. You do. You get the corner table and the first callback.',
    rare_traits: ['intentional logolessness', 'fit architecture over trend', 'calibrated restraint'],
    daysAgo: 28,
  },
  {
    archetype_name: 'Low Effort Legend',
    archetype_tag: 'the bar was low and you cleared it beautifully',
    aura_score: 888, tier: 'HIGH', tier_percentile: 'TOP 8%',
    short_roast: 'You spent eleven minutes on this and it shouldn\'t work.\nSomehow it works. You know exactly why. You\'ll never say.',
    pieces: [
      { name: 'Perfect Vintage Tee', verdict: 'the fit is either lucky or you\'ve done the math', delta: 155, type: 'good' },
      { name: 'Well-Cut Jeans', verdict: 'these are doing more than their share', delta: 130, type: 'good' },
      { name: 'Clean White Sneakers', verdict: 'classic, correct, and carrying the casual', delta: 105, type: 'good' },
    ],
    how_perceived: 'People think you just look like that. You do. But you know what "that" means.',
    rare_traits: ['effortless by design', 'fit knowledge disguised as indifference', 'casual mastery'],
    daysAgo: 30,
  },
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();

  // Use the admin's own user ID so FK constraint is satisfied
  const ANON_ID = user!.id;

  // Check if seed data already exists
  const seedNames = FAKE_SCANS.map(s => s.archetype_name);
  const { count } = await service
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', ANON_ID)
    .in('archetype_name', seedNames);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Seed data already exists. Delete existing anon scans first.' }, { status: 409 });
  }

  const rows = FAKE_SCANS.map(({ daysAgo: d, ...result }) => ({
    user_id: ANON_ID,
    archetype_name: result.archetype_name,
    archetype_tag: result.archetype_tag,
    aura_score: result.aura_score,
    tier: result.tier,
    encoded_result: encodeResult(result),
    created_at: daysAgo(d),
  }));

  const { error } = await service
    .from('scans')
    .insert(rows);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, inserted: rows.length });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();

  // Only delete entries that were seeded (have archetype names matching seed data)
  const seedNames = FAKE_SCANS.map(s => s.archetype_name);
  const { error, count } = await service
    .from('scans')
    .delete({ count: 'exact' })
    .eq('user_id', user!.id)
    .in('archetype_name', seedNames);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: count });
}
