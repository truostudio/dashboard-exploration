import { analytics } from './analytics';
import type { ViewId } from '../App';

/**
 * What the persistent banner is carrying right now.
 *
 * The banner used to hold one hardcoded announcement. It holds a queue instead,
 * because the two things that belong up there are not the same thing: a product
 * announcement, which can wait, and a live operational condition, which cannot.
 * Sorting by severity is the whole point of the queue, an incident must never
 * sit behind "Hyperliquid is now available".
 *
 * A message is one sentence plus its ways in, deliberately split. The banner is
 * a single line that truncates, and links buried inside the prose were the
 * first thing to disappear, which left an incident on screen with no way to act
 * on it. The sentence may be cut; the actions may not.
 */

export type BannerLink = { label: string; view: ViewId };

export type BannerMessage = {
  id: string;
  /**
   * `alert` is a live condition: it is dismissed for the session only, because
   * a rate limit you are still hitting has no business being permanently
   * silenced by one click three weeks ago. `notice` persists to localStorage.
   */
  severity: 'alert' | 'notice';
  tag: string;
  /** One sentence. Truncates with an ellipsis when the viewport is narrow. */
  text: string;
  /** Always visible, however narrow it gets. */
  links?: BannerLink[];
};

/**
 * Thresholds for "a significant number of 429s".
 *
 * Two conditions, not one. Buckets alone would fire on a single spike that
 * clipped the ceiling for one five-minute window; rejected requests alone would
 * fire on a project big enough that even a rounding error clears a flat count.
 * Together they mean the ceiling is being hit *repeatedly* and it is costing
 * real calls. Two separate buckets is the floor for "repeatedly", one is a
 * blip and does not deserve the top of every screen.
 */
const CEILING_BUCKETS = 2;
const REJECTED_FLOOR = 2000;

/** Announcement copy. Bump the id when the wording changes. */
const ANNOUNCEMENT: BannerMessage = {
  id: 'hyperliquid-direct-jsonrpc',
  severity: 'notice',
  tag: 'Notice',
  text: 'Hyperliquid is now live, across both request surfaces.',
  links: [
    { label: 'Direct APIs', view: 'apis-direct' },
    { label: 'JSON-RPCs', view: 'json-rpc' },
  ],
};

const int = (n: number) => n.toLocaleString('en-US');

export function siteMessages(): BannerMessage[] {
  const messages: BannerMessage[] = [];

  /* Same generator the Analytics throughput chart reads, so the banner and the
     chart can never disagree about how many requests were rejected. */
  const t = analytics('1d', 'all').throughput;

  if (t.atCeiling >= CEILING_BUCKETS && t.throttled >= REJECTED_FLOOR) {
    messages.push({
      id: 'rate-limit-429',
      severity: 'alert',
      tag: '429',
      // The window is the throughput chart's own, not a round "24h": the banner
      // and the chart have to be quoting the same six hours.
      text: `${int(t.throttled)} requests rejected in ${t.windowHours}h. Peak ${t.peakRps} rps against the ${t.planName} plan's ${t.planRps} rps ceiling.`,
      links: [
        { label: 'Throughput', view: 'analytics' },
        { label: `Move to ${t.nextPlan.name}`, view: 'settings-billing' },
      ],
    });
  }

  messages.push(ANNOUNCEMENT);

  // Alerts first. A live condition never queues behind an announcement.
  return messages.sort((a, b) => Number(b.severity === 'alert') - Number(a.severity === 'alert'));
}
