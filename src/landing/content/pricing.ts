/**
 * Pricing page copy, transcribed from https://uniblock.dev/pricing
 * (fetched 2026-07-30). Plan numbers stay in content/home.ts so the home
 * pricing band and this page cannot drift apart.
 */

import { pricing as homePricing } from './home';
import type { Billing } from './home';

export type { Billing };

export const pricingPage = {
  eyebrow: 'PRICING',
  title: ['Start Free.', 'Pay only when you scale.'],
  body:
    'One unified invoice across 55+ RPC providers. No fragmented contracts, no surprise ' +
    'overages, no vendor sprawl.',
  cta: 'PRICING CALCULATOR',
  ctaHref: 'https://pricing.uniblock.dev/',
  close: {
    title: ['Every Blockchain API.', 'One Interface.'],
    body: 'One contract. One invoice. Every chain and provider behind a single endpoint.',
  },
};

/** Shared with the home pricing band. */
export const pricing = homePricing;
