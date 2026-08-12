import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icons';
import { MethodBadge, Avatar } from './ui';
import { analytics, fmtCompact, fmtCount, fmtPct } from '../data/analytics';
import { chains } from '../data/mock';
import { unifiedCategories, directProviders } from '../data/catalog';
import type { ViewId } from '../App';

/**
 * ⌘K over the endpoint catalogue.
 *
 * The dashboard is a catalogue first, so the palette is weighted that way:
 * endpoints are matched on path, method and surface and rank above navigation,
 * because "find me /token/balance" is the request this product exists to serve.
 * Pages are still reachable here so the palette is the one thing you have to
 * learn rather than one of two.
 */

/**
 * Concepts, not just page names.
 *
 * Searching "compute units" returned nothing, because pages were matched on
 * their own titles alone -- and nobody types "Billing" when what they want to
 * know is how many CUs they have left. Each destination carries the vocabulary
 * a user would actually reach for, and the term that matched is shown back to
 * them so the jump explains itself.
 */
export type PaletteResult =
  | { kind: 'endpoint'; id: string; name: string; method: 'GET' | 'POST'; surface: string; calls: number; errorRate: number; p95: number; cu: number }
  | { kind: 'chain'; id: string; name: string; symbol: string; chainId: string; color?: string; icon: string; live: boolean }
  | { kind: 'catalog'; id: string; name: string; method: string; title: string; owner: string }
  | { kind: 'page'; id: string; name: string; hint: string; view: ViewId; via?: string };

const PAGES: { name: string; hint: string; view: ViewId; keywords: string[] }[] = [
  { name: 'Analytics', hint: 'Usage, performance and cost', view: 'analytics',
    keywords: ['compute unit', 'compute units', 'cu', 'usage', 'request', 'requests', 'traffic',
               'latency', 'p95', 'p99', 'error', 'errors', 'error rate', 'spend', 'cost',
               'provider', 'providers', 'routing', 'failover', 'websocket', 'websockets',
               'reliability', 'volume', 'throughput'] },
  { name: 'Billing', hint: 'Plan, invoices and limits', view: 'settings-billing',
    keywords: ['compute unit', 'compute units', 'cu', 'plan', 'invoice', 'invoices', 'payment',
               'card', 'price', 'pricing', 'quota', 'limit', 'limits', 'allowance', 'upgrade',
               'subscription', 'spend', 'cost', 'free tier'] },
  { name: 'Chains', hint: 'Every chain and what it carries', view: 'chains',
    keywords: ['network', 'networks', 'chain', 'chain id', 'evm', 'l2', 'solana', 'coverage',
               'supported chains'] },
  { name: 'Overview', hint: 'Live project snapshot', view: 'overview',
    keywords: ['dashboard', 'home', 'health', 'summary'] },
  { name: 'All APIs', hint: 'Every Unified and Direct endpoint', view: 'apis-all',
    keywords: ['catalogue', 'catalog', 'browse', 'endpoint', 'endpoints', 'reference'] },
  { name: 'Unified APIs', hint: 'One interface across chains', view: 'apis-unified',
    keywords: ['rest', 'normalized', 'normalised', 'token', 'nft', 'market data', 'scan',
               'transaction'] },
  { name: 'Direct APIs', hint: 'Provider-native endpoints', view: 'apis-direct',
    keywords: ['alchemy', 'moralis', 'coingecko', 'helius', 'passthrough', 'vendor'] },
  { name: 'JSON-RPC', hint: 'Raw node access', view: 'json-rpc',
    keywords: ['rpc', 'json rpc', 'eth_call', 'node', 'method', 'methods', 'namespace',
               'archive', 'trace'] },
  { name: 'Webhooks', hint: 'Address and contract events', view: 'webhooks',
    keywords: ['event', 'events', 'notification', 'notifications', 'subscribe', 'realtime',
               'real-time', 'callback', 'callbacks'] },
  { name: 'Nodes', hint: 'Dedicated node capacity', view: 'nodes',
    keywords: ['dedicated', 'enterprise', 'reserved', 'sla', 'capacity', 'private node'] },
  { name: 'API Tester', hint: 'Run a request', view: 'api-tester',
    keywords: ['try', 'run', 'playground', 'test', 'curl', 'sandbox'] },
  { name: 'Quickstart', hint: 'Zero to first request', view: 'quickstart',
    keywords: ['get started', 'getting started', 'setup', 'onboarding', 'first call', 'install'] },
  { name: 'Team', hint: 'Members and access', view: 'settings-team',
    keywords: ['member', 'members', 'invite', 'seat', 'seats', 'permission', 'permissions',
               'role', 'roles', 'access'] },
  { name: 'Project settings', hint: 'Keys and chains', view: 'settings-project',
    keywords: ['api key', 'key', 'secret', 'rotate', 'credential', 'credentials', 'auth',
               'x-api-key'] },
];

/**
 * Substring rank, not a fuzzy subsequence matcher. On identifiers like
 * `eth_getTransactionReceipt` a subsequence match will happily accept almost
 * any query and bury the row you actually typed, so an earlier hit simply wins
 * and a prefix hit wins outright.
 */
function score(haystack: string, needle: string) {
  const i = haystack.indexOf(needle);
  if (i < 0) return -1;
  return i === 0 ? 0 : i;
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onOpenEndpoint,
  onOpenChain,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  /** Jumps to Analytics and expands this endpoint's row. */
  onOpenEndpoint: (name: string) => void;
  /** Jumps to the chain directory and expands this chain's row. */
  onOpenChain: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // The 24h/all-chains window is the catalogue's resting state, and the figures
  // here are a preview rather than the answer: the row you land on carries the
  // range you actually have selected.
  const endpoints = useMemo(() => analytics('24h', 'all').endpoints, []);
  const liveChains = useMemo(
    () => new Set<string>(analytics('30d', 'all').chainMix.map((c) => c.id)),
    [],
  );

  /**
   * The whole published catalogue, flattened once. Searching only the nineteen
   * endpoints that carry traffic is why "hyperliquid" returned nothing: those
   * endpoints exist, they are just on providers this project has not called
   * yet. A catalogue you can only search once you have used it is not a
   * catalogue.
   */
  const catalog = useMemo(
    () => [
      ...unifiedCategories.flatMap((c) =>
        c.endpoints.map((e) => ({ path: e.path, method: e.method, title: e.title, owner: c.label })),
      ),
      ...directProviders.flatMap((p) =>
        p.endpoints.map((e) => ({ path: e.path, method: e.method, title: e.title, owner: p.name })),
      ),
    ],
    [],
  );

  const results = useMemo<PaletteResult[]>(() => {
    const q = query.trim().toLowerCase();
    const eps = endpoints
      .map((e) => ({
        e,
        s: Math.max(
          score(e.name.toLowerCase(), q),
          score(`${e.method} ${e.surface}`.toLowerCase(), q) >= 0 ? 40 : -1,
        ),
      }))
      .filter(({ s }) => q === '' || s >= 0)
      .sort((a, b) => (q === '' ? b.e.calls - a.e.calls : a.s - b.s || b.e.calls - a.e.calls))
      .slice(0, q === '' ? 6 : 20)
      .map(
        ({ e }): PaletteResult => ({
          kind: 'endpoint',
          id: `ep:${e.name}`,
          name: e.name,
          method: e.method,
          surface: e.surface,
          calls: e.calls,
          errorRate: e.errorRate,
          p95: e.p95,
          cu: e.cu,
        }),
      );

    const chainHits = chains
      .map((c) => ({
        c,
        s: Math.min(
          ...[c.name, c.symbol, c.id, String(c.chainId)]
            .map((f) => score(f.toLowerCase(), q))
            .filter((n) => n >= 0)
            .concat(999),
        ),
      }))
      .filter(({ s }) => q !== '' && s < 999)
      .sort((a, b) => a.s - b.s)
      .slice(0, 6)
      .map(
        ({ c }): PaletteResult => ({
          kind: 'chain',
          id: `ch:${c.id}`,
          name: c.name,
          symbol: c.symbol,
          chainId: String(c.chainId),
          color: c.color,
          icon: c.icon,
          live: liveChains.has(c.id),
        }),
      );

    // Ranked below both, and only once nothing cheaper matched enough: these
    // are reference rows, not things this project is currently running.
    const catalogHits =
      q === '' || eps.length + chainHits.length >= 12
        ? []
        : catalog
            .map((e) => ({ e, s: Math.min(...[e.path, e.title].map((f) => score(f.toLowerCase(), q)).filter((n) => n >= 0).concat(999)) }))
            .filter(({ s }) => s < 999)
            .sort((a, b) => a.s - b.s)
            .slice(0, 8)
            .map(
              ({ e }, i): PaletteResult => ({
                kind: 'catalog',
                id: `cat:${e.path}:${i}`,
                name: e.path,
                method: e.method,
                title: e.title,
                owner: e.owner,
              }),
            );

    // Name first, then concept vocabulary, then the hint. Whatever matched is
    // carried through as `via`, so a jump from "compute units" to Billing can
    // say why rather than looking like a guess.
    type PageHit = { p: (typeof PAGES)[number]; s: number; via?: string };
    const pages = PAGES.map((p): PageHit | null => {
      if (q === '') return { p, s: 0 };
      const byName = score(p.name.toLowerCase(), q);
      if (byName >= 0) return { p, s: byName };
      const kw = p.keywords.find((k) => k.includes(q) || q.includes(k));
      if (kw) return { p, s: 5, via: kw };
      const byHint = score(p.hint.toLowerCase(), q);
      if (byHint >= 0) return { p, s: 30 + byHint };
      return null;
    })
      .filter((r): r is PageHit => r !== null)
      .sort((a, b) => a.s - b.s)
      .slice(0, q === '' ? 4 : 8)
      .map(({ p, via }): PaletteResult => ({
        kind: 'page', id: `pg:${p.view}`, name: p.name, hint: p.hint, view: p.view, via,
      }));

    // Pages normally rank last; you are usually looking for data, not a route.
    // But when the query is the start of a page's name, that page is almost
    // certainly the intent: typing "chains" and landing on an endpoint that
    // merely contains the word is the wrong answer confidently delivered.
    const [namedPages, otherPages] = [
      pages.filter((p) => q !== '' && p.name.toLowerCase().startsWith(q)),
      pages.filter((p) => q === '' || !p.name.toLowerCase().startsWith(q)),
    ];

    return [...namedPages, ...eps, ...chainHits, ...catalogHits, ...otherPages];
  }, [query, endpoints, catalog, liveChains]);

  // Adjusted during render rather than in an effect. Resetting the highlight
  // from an effect paints one frame with the old index against the new list,
  // which is visible as the selection flicking down the results as you type.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActive(0);
  }
  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    if (open) {
      setQuery('');
      setLastQuery('');
      setActive(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    // Focus after paint; an input inside a just-mounted overlay is not
    // focusable on the same frame in Safari.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (r: PaletteResult) => {
    if (r.kind === 'page') onNavigate(r.view);
    // A chain hit opens that chain's coverage, not just the directory it lives
    // in, landing on an unfiltered list is the search not finishing its job.
    else if (r.kind === 'chain') onOpenChain(r.id.replace(/^ch:/, ''));
    else if (r.kind === 'catalog') onNavigate('apis-all');
    else onOpenEndpoint(r.name);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown' || (event.key === 'n' && event.ctrlKey)) {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp' || (event.key === 'p' && event.ctrlKey)) {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      run(results[active]);
    }
  };

  // Rule between each kind change, so the three registers read as sections
  // without needing a heading row that arrow keys would have to skip.
  const bounds = new Set(
    results.map((r, i) => (i > 0 && results[i - 1].kind !== r.kind ? i : -1)).filter((i) => i > 0),
  );

  return (
    <div className="cmdk-scrim" onMouseDown={onClose}>
      <div
        className="cmdk marks"
        role="dialog"
        aria-modal="true"
        aria-label="Search endpoints and pages"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="cmdk-field">
          <Icon.Search size={16} className="cmdk-search-icon" />
          <input
            ref={inputRef}
            className="cmdk-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search endpoints, methods, pages…"
            aria-label="Search"
            aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
            aria-controls="cmdk-list"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn ghost icon-only cmdk-close" onClick={onClose} aria-label="Close search">
            <Icon.X size={14} />
          </button>
        </div>

        {results.length === 0 ? (
          <p className="cmdk-empty dim">
            Nothing matches <span className="mono">{query}</span>.
          </p>
        ) : (
          <ul className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef}>
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`cmdk-${r.id}`}
                role="option"
                aria-selected={i === active}
                className={`cmdk-row ${i === active ? 'is-active' : ''} ${bounds.has(i) ? 'is-group-start' : ''}`.trim()}
                // Pointer-move, not mouse-enter: entering is also fired when the
                // list scrolls under a still cursor, which would yank the
                // highlight away from the row the arrow keys just chose.
                onPointerMove={() => setActive(i)}
                onClick={() => run(r)}
              >
                {r.kind === 'chain' ? (
                  <>
                    <Avatar src={r.icon} name={r.name} size="sm" />
                    <span className="cmdk-name">{r.name}</span>
                    <span className="cmdk-meta dim">
                      <span className="mono">{r.symbol}</span> · chain{' '}
                      <span className="mono">{r.chainId}</span>
                      {r.live ? ' · carrying traffic' : ' · not in use'}
                    </span>
                  </>
                ) : r.kind === 'catalog' ? (
                  <>
                    <MethodBadge method={r.method === 'WS' ? 'GET' : (r.method as 'GET' | 'POST')} />
                    <span className="mono cmdk-name">{r.name}</span>
                    <span className="cmdk-meta dim">{r.owner} · {r.title}</span>
                  </>
                ) : r.kind === 'endpoint' ? (
                  <>
                    <MethodBadge method={r.method} />
                    <span className="mono cmdk-name">{r.name}</span>
                    <span className="cmdk-meta dim">
                      <span className="mono">{fmtCount(r.calls)}</span> calls ·{' '}
                      <span className="mono">{fmtCompact(r.cu)}</span> CU ·{' '}
                      <span className={`mono ${r.errorRate > 2 ? 'is-bad' : ''}`.trim()}>
                        {fmtPct(r.errorRate, 2)}
                      </span>{' '}
                      · <span className="mono">{r.p95} ms</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Icon.Chevron size={12} className="cmdk-page-icon" />
                    <span className="cmdk-name">{r.name}</span>
                    <span className="cmdk-meta dim">
                      {r.via ? `matches "${r.via}" - ${r.hint}` : r.hint}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="cmdk-foot dim">
          <span><span className="kbd">↑</span><span className="kbd">↓</span> move</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}
