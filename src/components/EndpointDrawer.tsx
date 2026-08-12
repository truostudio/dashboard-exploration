import { useEffect, useMemo, useState } from 'react';
import { Icon } from './Icons';
import { Avatar, MethodBadge, CopyButton, SearchInput, Empty } from './ui';
import { groupByCategory, platformStats } from '../data/catalog';
import type { ApiEndpoint } from '../data/catalog';
import { chains } from '../data/mock';

export type DrawerSource = {
  /** Heading, e.g. "Kraken" or "NFT". */
  title: string;
  /** Mono label above the heading, e.g. "DIRECT API". */
  eyebrow: string;
  /**
   * Drives what each row carries. Direct endpoints are provider-native, so the
   * useful thing is the path to copy. Unified endpoints are the same call
   * across many chains, so the useful thing is the chain coverage.
   */
  surface: 'unified' | 'direct';
  description?: string;
  icon?: string;
  endpoints: ApiEndpoint[];
  /** Real total from the docs, may exceed `endpoints.length`. */
  totalCount?: number;
  /** Real category list, used when the endpoint list isn't transcribed. */
  categories?: { label: string; count: number }[];
  docsUrl?: string;
};

type Props = {
  source: DrawerSource | null;
  onClose: () => void;
};

export function EndpointDrawer({ source, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [chainsOpen, setChainsOpen] = useState(false);

  // Reset the filter whenever a different thing is opened.
  useEffect(() => {
    setQuery('');
  }, [source?.title]);

  useEffect(() => {
    if (!source) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [source, onClose]);

  const groups = useMemo(() => {
    if (!source) return [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? source.endpoints.filter(
          (e) =>
            e.path.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q),
        )
      : source.endpoints;
    return groupByCategory(filtered);
  }, [source, query]);

  if (!source) return null;

  const shown = groups.reduce((n, g) => n + g.endpoints.length, 0);
  const total = source.totalCount ?? source.endpoints.length;
  const hasList = source.endpoints.length > 0;
  const categoryCount =
    source.categories?.length ?? new Set(source.endpoints.map((e) => e.category)).size;

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true" aria-label={source.title} onClick={onClose}>
      <aside className="drawer marks" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <div className="drawer-id">
            {/* Direct providers have logos; the Unified API is not a vendor and
                has none, so the avatar fell back to a monogram, a circle
                containing the first letter of the category it already says
                underneath. No mark is better than a made-up one. */}
            {source.surface === 'direct' && <Avatar src={source.icon} name={source.title} size="xl" />}
            <div className="drawer-titles">
              <span className="eyebrow">{source.eyebrow}</span>
              <h2 className="drawer-title">{source.title}</h2>
            </div>
          </div>
          <button className="btn ghost icon-only" aria-label="Close" onClick={onClose}>
            <Icon.X size={16} />
          </button>
        </header>

        {source.description && <p className="drawer-desc muted">{source.description}</p>}

        <div className="drawer-stats">
          <div className="drawer-stat">
            <span className="drawer-stat-num pixel">{total}</span>
            <span className="drawer-stat-label">Endpoints</span>
          </div>
          <div className="drawer-stat">
            <span className="drawer-stat-num pixel">
              {source.surface === 'unified' ? platformStats.chains : categoryCount}
            </span>
            <span className="drawer-stat-label">
              {source.surface === 'unified'
                ? 'Chains'
                : categoryCount === 1
                ? 'Category'
                : 'Categories'}
            </span>
          </div>
        </div>

        {/* Collapsed by default. This list was written when the app carried
            sixteen chains; it now carries all 83 the docs publish, which pushed
            the endpoints, the reason the drawer is open, most of a screen
            down. It is reference material, so it opens on request. */}
        {source.surface === 'unified' && (
          <section className="drawer-chains">
            <button
              type="button"
              className="drawer-chains-head"
              aria-expanded={chainsOpen}
              onClick={() => setChainsOpen((o) => !o)}
            >
              <Icon.ChevronDown size={12} className={`drawer-chains-caret ${chainsOpen ? 'open' : ''}`} />
              <span className="eyebrow">Supported chains</span>
              <span className="mono dim">
                {chains.length} listed · {platformStats.chains} supported
              </span>
            </button>
            <div className={`drawer-chains-wrap ${chainsOpen ? 'open' : ''}`}>
              <ul className="drawer-chain-list">
                {chains.map((chain) => (
                  <li key={chain.id} className="drawer-chain">
                    <img className="drawer-chain-icon" src={chain.icon} alt="" />
                    <span className="drawer-chain-name">{chain.name}</span>
                    <span className="mono dim drawer-chain-sym">{chain.symbol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {hasList && (
          <div className="drawer-search">
            <SearchInput grow value={query} onChange={setQuery} placeholder="Filter endpoints…" />
            <span className="dim drawer-count mono">
              {query ? `${shown} of ${source.endpoints.length}` : `${source.endpoints.length} listed`}
            </span>
          </div>
        )}

        <div className="drawer-body">
          {hasList ? (
            <>
              {groups.map((group) => (
                <section key={group.category} className="drawer-group">
                  <header className="drawer-group-head">
                    <h3 className="drawer-group-name">{group.category}</h3>
                    <span className="mono dim">{group.endpoints.length}</span>
                  </header>
                  <ul className="drawer-list">
                    {group.endpoints.map((endpoint) => (
                      <li key={`${endpoint.method}-${endpoint.path}`} className="drawer-row">
                        <MethodBadge method={endpoint.method} />
                        <div className="drawer-row-text">
                          <span className="drawer-row-title">{endpoint.title}</span>
                          <span className="mono dim drawer-row-path">{endpoint.path}</span>
                        </div>
                        <CopyButton value={endpoint.path} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {groups.length === 0 && <Empty>No endpoints match “{query}”.</Empty>}
            </>
          ) : (
            /* No transcribed list, so show the real category breakdown instead. */
            <section className="drawer-group">
              <header className="drawer-group-head">
                <h3 className="drawer-group-name">Categories</h3>
                <span className="mono dim">{source.categories?.length ?? 0}</span>
              </header>
              <ul className="drawer-cats">
                {source.categories?.map((category) => (
                  <li key={category.label} className="drawer-cat">
                    <span className="drawer-cat-name">{category.label}</span>
                    <span className="mono dim">{category.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {source.docsUrl && (
          <footer className="drawer-foot">
            <a className="btn primary" href={source.docsUrl} target="_blank" rel="noreferrer">
              <Icon.External size={14} /> Open full reference
            </a>
            <button className="btn" onClick={onClose}>Close</button>
          </footer>
        )}
      </aside>
    </div>
  );
}
