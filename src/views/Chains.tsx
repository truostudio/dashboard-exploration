import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  Panel, TitledPanel, Table, Badge, Avatar, StatTiles, SearchInput, Empty, Sparkline,
  MethodBadge, TableFoot, useCopy, CopyButton,
} from '../components/ui';
import { chains, jsonRpcHttp } from '../data/mock';
import { analytics, trafficChains, fmtCompact, fmtCount, fmtPct } from '../data/analytics';
import { endpointsForChain } from '../data/chainCoverage';
import { docChain } from '../data/chains';
import type { ApiEndpoint } from '../data/catalog';
import type { ViewId } from '../App';

/**
 * The chain directory.
 *
 * The dashboard was a catalogue along one axis only, endpoints, so a chain
 * was something you filtered by, never something you could look up. "Do you
 * support Sui" and "how much Solana am I actually running" had no page to land
 * on, and searching a chain name returned nothing at all.
 *
 * Traffic figures come from the same generator as Analytics, so a chain's row
 * here and its bar on the Endpoints tab can never disagree.
 */

const groups = ['All', 'Live', 'EVM', 'L2', 'Non-EVM'] as const;
type Group = (typeof groups)[number];

const CATEGORY_LABEL: Record<string, string> = {
  evm: 'EVM',
  l2: 'L2',
  solana: 'Solana',
  bitcoin: 'Bitcoin',
  cosmos: 'Cosmos',
  other: 'Other',
};

const PER_PAGE = 10;

/**
 * A page of endpoints, each row a copy button.
 *
 * The catalogue's whole job is getting a path into someone's editor, so the row
 * *is* the control rather than carrying one: there is nothing else to click. The
 * copied value is the path exactly as the reference publishes it, which is what
 * the drawer's copy button hands over too.
 *
 * Ten rows a page, because these lists are unbounded, 146 endpoints name
 * Solana, and an unpaged list of them buries everything below it.
 */
function EndpointPage({
  items,
  meta,
  emptyKey,
  noun = 'endpoints',
}: {
  items: (ApiEndpoint & { owner: string })[];
  meta: (e: ApiEndpoint & { owner: string }) => string;
  emptyKey: string;
  /** What the footer counts. JSON-RPC lists methods, not endpoints. */
  noun?: string;
}) {
  const [page, setPage] = useState(1);
  const { copy, isCopied } = useCopy();

  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  // Switching chains can leave the cursor past the end of a shorter list, so it
  // is clamped on read rather than reset by an effect.
  const current = Math.min(page, pages);
  const shown = items.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <>
      <ul className="chain-ep-list">
        {shown.map((e) => {
          const key = `${emptyKey}:${e.owner}:${e.method}:${e.path}`;
          const done = isCopied(key);
          return (
            <li key={key} className="chain-ep-item">
              <button
                type="button"
                className={`chain-ep chain-ep-btn ${done ? 'is-copied' : ''}`.trim()}
                onClick={() => copy(e.path, key)}
                aria-label={`Copy ${e.path}`}
              >
                <MethodBadge method={e.method === 'WS' ? 'GET' : e.method} />
                <span className="mono chain-ep-path">{e.path}</span>
                {/* Both states stay mounted and cross-fade in place. Swapping
                    the text outright made the row jump and read as a glitch
                    rather than as an acknowledgement. */}
                <span className="chain-ep-meta swap">
                  <span className="dim swap-idle">{meta(e)}</span>
                  <span className="swap-done">Copied</span>
                </span>
                <span className="chain-ep-copy swap-icon" aria-hidden>
                  <Icon.Copy size={13} className="swap-idle" />
                  <Icon.Check size={13} className="swap-done" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {pages > 1 && (
        <TableFoot
          page={current}
          pages={pages}
          onChange={setPage}
          summary={`${fmtCount(items.length)} ${noun} · page ${current} of ${pages}`}
        />
      )}
    </>
  );
}

/**
 * What you can actually call on one chain.
 *
 * The Unified surface is chain-agnostic by design, so this is deliberately not
 * a bespoke per-chain endpoint list, it is the coverage the docs state, the
 * Unified catalogue that reaches this chain, and anything that names the chain
 * in its own path. Inventing a per-chain endpoint set would misrepresent how
 * the API is built.
 */
function ChainDetail({
  id,
  category,
  name,
  chainId,
}: {
  id: string;
  category: string;
  name: string;
  chainId: string | number;
}) {
  const eps = useMemo(() => endpointsForChain(id, category, chainId), [id, category, chainId]);
  const doc = docChain(id);

  // The chain page's own Supported networks table, in full.
  const networks = doc?.networks ?? [
    { name, symbol: '', type: 'Mainnet' as const, chainId: String(chainId) },
  ];
  const rpcUrl = `${jsonRpcHttp}?chainId=${doc?.chainId ?? chainId}`;
  const [query, setQuery] = useState('');

  /**
   * One query across every list on the chain.
   *
   * A catalogue is searched, not browsed: "does Base do getLogs" and "what is
   * the balance endpoint here" are the same question asked of two different
   * surfaces, and making someone guess which section to look in first is the
   * thing that sends them back to the docs. So the box filters the Unified
   * list, the Direct list and the JSON-RPC methods together, and each section
   * reports what it matched.
   */
  const q = query.trim().toLowerCase();
  const found = useMemo(() => {
    if (!q) return { unified: eps.unified, direct: eps.direct, rpc: eps.rpc, total: null as number | null };
    const hit = (e: ApiEndpoint & { owner: string }) =>
      e.path.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.owner.toLowerCase().includes(q);
    const unified = eps.unified.filter(hit);
    const direct = eps.direct.filter(hit);
    // A group survives on its matching methods, so the card shows the hits
    // rather than the first six of a list that merely contains one.
    const rpc = eps.rpc
      .map((g) => ({ ...g, methods: g.methods.filter((m) => m.toLowerCase().includes(q)) }))
      .filter((g) => g.methods.length > 0 || g.ns.toLowerCase().includes(q));
    const total =
      unified.length + direct.length + rpc.reduce((n, g) => n + g.methods.length, 0);
    return { unified, direct, rpc, total };
  }, [q, eps]);

  const searching = q.length > 0;
  const rpcMatches = found.rpc.reduce((n, g) => n + g.methods.length, 0);

  /**
   * All three surfaces, always, counted by what the query left.
   *
   * They used to appear only where the chain had rows, which made the control
   * change shape from chain to chain. Direct simply vanished on Ethereum,
   * and a switcher whose options come and go reads as broken rather than as
   * informative. A surface with nothing on it is a fact worth stating, and the
   * panel says why.
   */
  const surfaces = [
    { value: 'unified' as const, label: 'Unified', count: found.unified.length },
    { value: 'direct' as const, label: 'Direct', count: found.direct.length },
    { value: 'rpc' as const, label: 'JSON-RPC', count: rpcMatches },
  ];

  const [surface, setSurface] = useState<'unified' | 'direct' | 'rpc'>('unified');
  const [group, setGroup] = useState<string | null>(null);

  // A group filter only survives while its group is still on screen, clearing
  // it on a query that filters the group away beats showing an empty list under
  // a chip that no longer exists.
  const activeGroup = found.rpc.some((g) => g.ns === group) ? group : null;

  /**
   * Methods as rows, so a JSON-RPC method is as copyable as any other endpoint.
   * The group grid alone told you `evm` had 70 methods and then made you go to
   * the docs to read them, which is the trip this catalogue exists to save.
   * `path` carries the method name because that is the string that goes in the
   * request body, and it is what the row copies.
   */
  const rpcRows = useMemo(
    () =>
      found.rpc
        .filter((g) => !activeGroup || g.ns === activeGroup)
        .flatMap((g) =>
          g.methods.map((m) => ({
            method: 'POST' as const,
            path: m,
            title: 'JSON-RPC method',
            category: g.ns,
            owner: g.ns,
          })),
        ),
    [found.rpc, activeGroup],
  );
  /**
   * An explicit choice always wins. Redirecting away from an empty surface
   * sounded helpful and meant that clicking "Direct 0" on Ethereum did nothing
   * at all, the panel stayed on Unified and the button looked broken. So the
   * only time the selection is overridden is while searching, where landing on
   * a panel with no matches helps nobody. Derived during render rather than in
   * an effect, so the empty state never flashes first.
   */
  const chosen = surfaces.find((s) => s.value === surface) ?? surfaces[0];
  const active =
    searching && chosen.count === 0
      ? surfaces.find((s) => s.count > 0)?.value ?? chosen.value
      : chosen.value;

  return (
    <div className="ep-detail chain-detail">
      {/* Layout: the two readouts sit side by side rather than stacked. They
          are short, related, and read as one answer to "what is here", stacked
          they pushed the endpoint lists, which are the reason anyone opened the
          row, below the fold on a laptop.

          Surfaces answer "can I reach this chain"; categories answer "with
          what". They stay two lists because both contain a row called Market
          data, one naming the vendors behind it, one counting its endpoints,
          and in a single column that reads as a duplicate rather than as two
          different facts. */}
      {/* Structured as the docs structure a chain page: Supported networks,
          Making API requests, then the API reference. The previous head led
          with a "Surfaces" readout, which is a word that appears nowhere in the
          documentation, and it spent its space restating counts that the
          switcher below already carries. */}
      <div className="chain-head">
        <div className="chain-cov-group">
          <span className="chain-cov-cap">Supported networks</span>
          <ul className="chain-cov">
            {networks.map((n) => (
              <li key={n.chainId} className="chain-cov-row is-on">
                <span className="chain-cov-mark" aria-hidden />
                <span className="chain-cov-label">{n.name}</span>
                <span className="mono chain-cov-value">
                  {n.symbol && <span className="dim">{n.symbol} · </span>}
                  {n.type} · {n.chainId}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {eps.categories.length > 0 && (
          <div className="chain-cov-group">
            <span className="chain-cov-cap">Categories</span>
            <ul className="chain-cov">
              {eps.categories.map((c) => (
                <li key={c.id} className="chain-cov-row is-on">
                  <span className="chain-cov-mark" aria-hidden />
                  <span className="chain-cov-label">{c.label}</span>
                  <span className="mono chain-cov-value">
                    {fmtCount(c.count)} {c.count === 1 ? 'endpoint' : 'endpoints'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verbatim from the chain's own page: "Send a POST request to …". The
          method name a row copies is only half of a request; this is the other
          half, and it is per-chain. */}
      <div className="chain-req">
        <span className="chain-cov-cap">Making API requests</span>
        <div className="chain-req-row">
          <MethodBadge method="POST" />
          <span className="mono chain-req-url">{rpcUrl}</span>
          <CopyButton value={rpcUrl} label="Copy" copiedLabel="Copied" />
        </div>
      </div>

      <div className="chain-find">
        <SearchInput
          grow
          value={query}
          onChange={setQuery}
          placeholder={`Find an endpoint or method on ${name}…`}
        />
        <span className="dim chain-find-count mono">
          {searching
            ? `${fmtCount(found.total ?? 0)} ${found.total === 1 ? 'match' : 'matches'}`
            : `${fmtCount(eps.unified.length + eps.direct.length + eps.rpcTotal)} to search`}
        </span>
      </div>

      {/* Layout iteration: one surface at a time.
          Stacked, the three lists ran past 1,600px, the JSON-RPC block alone
          buried whatever came after it, and nobody scrolls a catalogue looking
          for the section that might hold their endpoint. A switcher puts the
          three on equal footing, keeps the answer one screen tall, and carries
          its counts so the choice is informed before the click. The search
          spans all three regardless, so the counts double as "where are my
          matches". */}
      {surfaces.length > 0 && (
        <>
          <Segmented
            label="Surface"
            options={surfaces.map((s) => ({
              value: s.value,
              label: (
                <>
                  {s.label} <span className="dim">{fmtCount(s.count)}</span>
                </>
              ),
            }))}
            value={active}
            onChange={setSurface}
          />

          {active === 'unified' && (
            <div className="ep-split">
              <div className="ep-split-head">
                <h4 className="ep-split-title">
                  Unified endpoints on {name}
                  {searching && <span className="dim"> · {fmtCount(found.unified.length)} of {fmtCount(eps.unified.length)}</span>}
                </h4>
                {/* The lockup, not a per-row badge: it says whose surface this
                    is once, where the eye already is. */}
                <img className="ep-split-mark" src="/uniblock-logo.png" alt="Uniblock" />
              </div>
              {found.unified.length > 0 ? (
                <EndpointPage items={found.unified} meta={(e) => e.title} emptyKey="unified" />
              ) : (
                <Empty bare>
                  {searching
                    ? `No Unified endpoint on ${name} matches “${query}”.`
                    : `The Unified API covers major EVM chains and Solana. ${name} is reachable over JSON-RPC and market data instead.`}
                </Empty>
              )}
            </div>
          )}

          {active === 'direct' && (
            <div className="ep-split">
              <div className="ep-split-head">
                <h4 className="ep-split-title">
                  Direct endpoints to {name}
                  {searching && <span className="dim"> · {fmtCount(found.direct.length)} of {fmtCount(eps.direct.length)}</span>}
                </h4>
              </div>
              {!searching && (
                <p className="dim chain-note">
                  Provider-native paths that name {name}, proxied through your project key.
                </p>
              )}
              {found.direct.length > 0 ? (
                <EndpointPage items={found.direct} meta={(e) => `${e.owner} · ${e.title}`} emptyKey="direct" />
              ) : searching ? (
                <Empty bare>No Direct endpoint naming {name} matches “{query}”.</Empty>
              ) : (
                <Empty bare>
                  The docs file Direct endpoints by provider, not by chain, so this lists only the
                  paths that name {name} outright, and none do. Most providers are multi-chain and
                  serve {name} through paths that never mention it, so browse them under Direct
                  APIs rather than reading this as no coverage.
                </Empty>
              )}
            </div>
          )}

          {active === 'rpc' && (
            <div className="ep-split">
              <div className="ep-split-head">
                <h4 className="ep-split-title">
                  JSON-RPC method groups on {name}
                  {searching && <span className="dim"> · {fmtCount(rpcMatches)} of {fmtCount(eps.rpcTotal)}</span>}
                </h4>
              </div>
              {!searching && (
                <p className="dim chain-note">
                  The docs count these the same way: {fmtCount(eps.rpc.length)} method{' '}
                  {eps.rpc.length === 1 ? 'group' : 'groups'} and {fmtCount(eps.rpcTotal)} methods.
                  They are {name}'s own, not a shared list: the reference publishes a page per
                  method.
                </p>
              )}
              {found.rpc.length > 0 ? (
                <>
                  {/* The groups become a filter rather than a wall of cards:
                      one chip per group, carrying its count, narrowing the list
                      below. Categorising the methods is what makes 126 of them
                      navigable, but a chain with one group has nothing to
                      choose between, and "All 62 | bitcoin 62" is two chips
                      naming the same set. */}
                  {found.rpc.length > 1 && (
                  <div className="chain-ns-chips">
                    <button
                      type="button"
                      className={`offering-chip ${activeGroup === null ? 'on' : ''}`.trim()}
                      onClick={() => setGroup(null)}
                    >
                      All <span className="dim">{fmtCount(rpcMatches)}</span>
                    </button>
                    {found.rpc.map((g) => (
                      <button
                        key={g.ns}
                        type="button"
                        className={`offering-chip ${activeGroup === g.ns ? 'on' : ''}`.trim()}
                        onClick={() => setGroup(activeGroup === g.ns ? null : g.ns)}
                      >
                        {g.ns} <span className="dim">{g.methods.length}</span>
                      </button>
                    ))}
                  </div>
                  )}
                  <EndpointPage
                    items={rpcRows}
                    /* The group is worth a column only where it discriminates.
                       On Bitcoin every method is in the `bitcoin` group, so the
                       column was the chain's own name repeated sixty-two
                       times. */
                    meta={(e) => (eps.rpc.length > 1 ? e.category : '')}
                    emptyKey="rpc"
                    noun="methods"
                  />
                </>
              ) : (
                <Empty bare>No method on {name} matches “{query}”.</Empty>
              )}
            </div>
          )}
        </>
      )}

      {eps.providers.length > 0 && (
        <div className="ep-split">
          <h4 className="ep-split-title">Direct providers documented for {name}</h4>
          <ul className="chain-ep-list">
            {eps.providers.map((p) => (
              <li key={p.id} className="chain-ep">
                <span className="cell-strong">{p.name}</span>
                <span className="dim chain-ep-meta">{fmtCount(p.endpointCount)} endpoints</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Chains({
  onNavigate,
  focusChain,
  onFocusHandled,
}: {
  onNavigate?: (view: ViewId) => void;
  /** Chain the command palette asked for. Opened and scrolled into view. */
  focusChain?: string | null;
  onFocusHandled?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group>('All');
  const [open, setOpen] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  // Same shape as the endpoint table's focus handling: state during render so
  // the row is open on first paint, scroll in an effect once it is in the DOM.
  const [lastFocus, setLastFocus] = useState<string | null | undefined>(null);
  if (lastFocus !== focusChain) {
    setLastFocus(focusChain);
    if (focusChain) {
      setQuery('');
      setGroup('All');
      setOpen(focusChain);
    }
  }
  useEffect(() => {
    if (!focusChain) return;
    const t = window.setTimeout(() => {
      bodyRef.current
        ?.querySelector(`[data-chain="${CSS.escape(focusChain)}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      onFocusHandled?.();
    }, 60);
    return () => window.clearTimeout(t);
  }, [focusChain, onFocusHandled]);

  // 30d/all-chains: a directory is a reference, so it reads the widest window
  // rather than whatever range someone last picked on another page.
  const a = useMemo(() => analytics('30d', 'all'), []);

  const rows = useMemo(() => {
    const byId = new Map<string, (typeof a.chainMix)[number]>(a.chainMix.map((c) => [c.id, c]));
    const spark = new Map<string, number[]>(
      trafficChains.map((c) => [
        c.id,
        // The per-chain series is the project total scaled by that chain's
        // share, which is exactly how the chain bars on Endpoints are built.
        a.traffic.map((t) => Math.round((t.unified + t.rpc + t.direct) * c.share)),
      ]),
    );
    const q = query.trim().toLowerCase();
    return chains
      .map((c) => {
        const mix = byId.get(c.id);
        return {
          ...c,
          calls: mix?.calls ?? 0,
          share: mix?.share ?? 0,
          live: Boolean(mix),
          spark: spark.get(c.id) ?? [],
        };
      })
      .filter((c) => {
        if (group === 'Live' && !c.live) return false;
        if (group === 'EVM' && c.category !== 'evm') return false;
        if (group === 'L2' && c.category !== 'l2') return false;
        if (group === 'Non-EVM' && (c.category === 'evm' || c.category === 'l2')) return false;
        if (q === '') return true;
        // Chain id included so a raw `137` or `solana` finds the row too.
        return (
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q) ||
          c.id.includes(q) ||
          String(c.chainId).toLowerCase().includes(q)
        );
      })
      .sort((x, y) => y.calls - x.calls || x.name.localeCompare(y.name));
  }, [a, query, group]);

  const live = rows.filter((c) => c.live).length;

  return (
    <div className="view">
      <Panel className="widget-panel rise rise-1">
        <StatTiles
          tiles={[
            { id: 'total', label: 'Chains available', value: fmtCount(chains.length) },
            { id: 'live', label: 'Carrying your traffic', value: fmtCount(trafficChains.length) },
            {
              id: 'calls',
              label: 'Calls this month',
              value: fmtCompact(a.totals.requests),
            },
            { id: 'top', label: 'Busiest chain', value: a.chainMix[0]?.name ?? '—' },
          ]}
        />
      </Panel>

      <TitledPanel
        title="Chain directory"
        sub="Every chain this project can reach, and what it is actually carrying."
        flush
        className="rise rise-2"
        actions={
          <Segmented
            label="Chain group"
            value={group}
            onChange={setGroup}
            options={groups.map((g) => ({ value: g, label: g }))}
          />
        }
      >
        <div className="ep-filter">
          <SearchInput
            compact
            value={query}
            onChange={setQuery}
            placeholder="Search by name, symbol or chain ID…"
          />
          <span className="dim ep-filter-note">
            Unified endpoints work on every chain here. Direct coverage depends on the vendor.
          </span>
        </div>

        {rows.length === 0 ? (
          <Empty
            bare
            icon={<Icon.Search size={20} />}
            title="No chain matches that"
          >
            Try a symbol like <span className="mono">SOL</span> or a chain ID like{' '}
            <span className="mono">8453</span>.
          </Empty>
        ) : (
          <Table
            ruled
            bodyRef={bodyRef}
            columns={[
              { key: 'chain', header: 'Chain' },
              { key: 'symbol', header: 'Symbol' },
              { key: 'chainId', header: 'Chain ID' },
              { key: 'type', header: 'Type' },
              { key: 'trend', header: 'Trend' },
              { key: 'calls', header: 'Calls (30d)', align: 'right' },
              { key: 'share', header: 'Share', align: 'right' },
              { key: 'chev', header: '' },
            ]}
          >
            {rows.flatMap((c) => [
              <tr
                key={c.id}
                data-chain={c.id}
                className={`row-click ${open === c.id ? 'is-open' : ''}`.trim()}
                tabIndex={0}
                aria-expanded={open === c.id}
                onClick={() => setOpen((o) => (o === c.id ? null : c.id))}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setOpen((o) => (o === c.id ? null : c.id));
                  }
                }}
              >
                <td className="cell-strong">
                  <span className="prov-name">
                    <Avatar src={c.icon} name={c.name} size="sm" />
                    {c.name}
                  </span>
                </td>
                <td className="mono dim">{c.symbol}</td>
                <td className="mono dim">{c.chainId}</td>
                <td>
                  <Badge>{CATEGORY_LABEL[c.category] ?? c.category}</Badge>
                </td>
                <td className="cell-trend">
                  {c.spark.length > 1 ? (
                    <Sparkline points={c.spark} />
                  ) : (
                    <span className="dim mono chain-idle">not in use</span>
                  )}
                </td>
                <td className="num mono">{c.live ? fmtCount(c.calls) : '—'}</td>
                <td className="num mono">{c.live ? fmtPct(c.share, 1) : '—'}</td>
                <td className="num">
                  <Icon.Chevron size={14} className={`ep-chev ${open === c.id ? 'is-open' : ''}`.trim()} />
                </td>
              </tr>,
              open === c.id && (
                <tr key={`${c.id}-detail`} className="row-detail">
                  <td colSpan={8}>
                    <ChainDetail id={c.id} category={c.category} name={c.name} chainId={c.chainId} />
                  </td>
                </tr>
              ),
            ])}
          </Table>
        )}

        <div className="table-foot">
          <span className="dim">
            {rows.length} of {chains.length} chains · {live} carrying traffic
          </span>
          {onNavigate && (
            <button className="btn ghost" onClick={() => onNavigate('analytics')}>
              Open analytics
              <Icon.Chevron size={13} />
            </button>
          )}
        </div>
      </TitledPanel>
    </div>
  );
}
