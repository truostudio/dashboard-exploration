import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  Panel, TitledPanel, Table, Badge, Avatar, StatTiles, SearchInput, Empty, Sparkline,
  MethodBadge, TableFoot,
} from '../components/ui';
import { chains } from '../data/mock';
import { analytics, trafficChains, fmtCompact, fmtCount, fmtPct } from '../data/analytics';
import { coverageFor, endpointsForChain } from '../data/chainCoverage';
import type { ViewId } from '../App';

/**
 * The chain directory.
 *
 * The dashboard was a catalogue along one axis only — endpoints — so a chain
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

/**
 * What you can actually call on one chain.
 *
 * The Unified surface is chain-agnostic by design, so this is deliberately not
 * a bespoke per-chain endpoint list — it is the coverage the docs state, the
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
  const cov = coverageFor(id, category);
  const eps = useMemo(() => endpointsForChain(id, category, chainId), [id, category, chainId]);
  const [page, setPage] = useState(1);
  const PER = 10;
  const pages = Math.max(1, Math.ceil(eps.unified.length / PER));
  const shown = eps.unified.slice((page - 1) * PER, page * PER);

  return (
    <div className="ep-detail chain-detail">
      {/* Coverage runs across the top as a strip rather than down a narrow
          column. Paired with a ten-row endpoint list beside it, the old
          two-column head left ~320px of dead space under the shorter side. */}
      <div className="chain-cov">
        {[
          { label: 'JSON-RPC', on: cov.jsonRpc, note: eps.rpcTotal ? `${fmtCount(eps.rpcTotal)} methods` : 'not itemised' },
          { label: 'Unified API', on: cov.unified, note: cov.unified ? `${fmtCount(eps.unifiedTotal)} endpoints` : 'not covered' },
          { label: 'Market data', on: cov.marketData, note: 'via CoinGecko, CMC, Defined' },
        ].map((c) => (
          <div key={c.label} className={`chain-cov-cell ${c.on ? 'is-on' : ''}`.trim()}>
            <span className="chain-cov-label">{c.label}</span>
            <span className="chain-cov-state">
              {c.on ? <Badge tone="success">Supported</Badge> : <Badge>Not supported</Badge>}
            </span>
            <span className="dim chain-cov-note">{c.note}</span>
          </div>
        ))}
      </div>

      <div className="ep-split">
        <h4 className="ep-split-title">Unified endpoints on {name}</h4>
        {eps.unified.length === 0 ? (
          <Empty bare>
            The Unified API covers major EVM chains and Solana. {name} is reachable over JSON-RPC
            and market data instead.
          </Empty>
        ) : (
          <>
            <ul className="chain-ep-list is-split">
              {shown.map((e) => (
                <li key={`${e.owner}:${e.path}`} className="chain-ep">
                  <MethodBadge method={e.method === 'WS' ? 'GET' : e.method} />
                  <span className="mono chain-ep-path">{e.path}</span>
                  <span className="dim chain-ep-meta">{e.title}</span>
                </li>
              ))}
            </ul>
            <TableFoot
              page={page}
              pages={pages}
              onChange={setPage}
              summary={`${fmtCount(eps.unified.length)} endpoints · page ${page} of ${pages}`}
            />
          </>
        )}
      </div>

      {eps.rpc.length > 0 && (
        <div className="ep-split">
          <h4 className="ep-split-title">JSON-RPC namespaces on {name}</h4>
          <p className="dim chain-note">
            These are {name}'s own methods, not a shared list — the reference publishes a page per
            method.
          </p>
          <div className="chain-ns-grid">
            {eps.rpc.map((g) => (
              <div key={g.ns} className="chain-ns">
                <div className="chain-ns-head">
                  <span className="mono cell-strong">{g.ns}</span>
                  <span className="dim mono">{g.methods.length}</span>
                </div>
                <p className="chain-ns-methods mono dim">
                  {g.methods.slice(0, 6).join(', ')}
                  {g.methods.length > 6 && ` +${g.methods.length - 6} more`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {eps.specific.length > 0 && (
        <div className="ep-split">
          <h4 className="ep-split-title">Endpoints that name {name}</h4>
          <ul className="chain-ep-list">
            {eps.specific.map((e) => (
              <li key={`${e.owner}:${e.path}`} className="chain-ep">
                <MethodBadge method={e.method === 'WS' ? 'GET' : e.method} />
                <span className="mono chain-ep-path">{e.path}</span>
                <span className="dim chain-ep-meta">{e.owner} · {e.title}</span>
              </li>
            ))}
          </ul>
        </div>
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
