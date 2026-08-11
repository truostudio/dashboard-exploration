import type { ViewId } from './App';

/**
 * URL <-> view mapping.
 *
 * The shell held its view in `useState` with no router, so every screen shared
 * one URL: nothing was linkable, the back button left the app, and a palette
 * jump could not be shared with a teammate. This is deliberately a hand-rolled
 * History API mapping rather than a router dependency — the app has exactly one
 * level of navigation, and the whole surface is the table below.
 */

export const ROUTES: Record<ViewId, string> = {
  quickstart: '/quickstart',
  overview: '/overview',
  analytics: '/analytics',
  'apis-unified': '/apis/unified',
  'apis-direct': '/apis/direct',
  'apis-all': '/apis/all',
  chains: '/chains',
  'json-rpc': '/json-rpc',
  webhooks: '/webhooks',
  nodes: '/nodes',
  'api-tester': '/api-tester',
  'settings-project': '/settings/project',
  'settings-team': '/settings/team',
  'settings-billing': '/settings/billing',
  components: '/components',
};

const BY_PATH = new Map(Object.entries(ROUTES).map(([view, path]) => [path, view as ViewId]));

/** Landing on `/` should not 404 into a blank shell. */
export const DEFAULT_VIEW: ViewId = 'quickstart';

export function viewFromPath(pathname: string): ViewId {
  // Trailing slashes are the difference between a link that works and one that
  // silently falls back to the default, so they are normalised away.
  const clean = pathname.replace(/\/+$/, '') || '/';
  return BY_PATH.get(clean) ?? DEFAULT_VIEW;
}

/** What the palette deep-links into: which row to reveal once the view mounts. */
export type Focus = { endpoint?: string; chain?: string };

export function focusFromSearch(search: string): Focus {
  const q = new URLSearchParams(search);
  return { endpoint: q.get('endpoint') ?? undefined, chain: q.get('chain') ?? undefined };
}

export function urlFor(view: ViewId, focus?: Focus) {
  const q = new URLSearchParams();
  if (focus?.endpoint) q.set('endpoint', focus.endpoint);
  if (focus?.chain) q.set('chain', focus.chain);
  const qs = q.toString();
  return ROUTES[view] + (qs ? `?${qs}` : '');
}
