import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { endpoints } from '../data/mock';
import type { EndpointCategory } from '../data/mock';

type Category = {
  id: EndpointCategory;
  label: string;
  icon: keyof typeof Icon;
  badge?: 'NEW';
};

const categories: Category[] = [
  { id: 'all', label: 'All', icon: 'Grid' },
  { id: 'json-rpc', label: 'JSON-RPC', icon: 'Code' },
  { id: 'market', label: 'Market Data', icon: 'Chart' },
  { id: 'nft', label: 'NFT', icon: 'Image' },
  { id: 'scan', label: 'Scan', icon: 'Search' },
  { id: 'token', label: 'Token', icon: 'Coin' },
  { id: 'transaction', label: 'Transaction', icon: 'Tx' },
  { id: 'defi', label: 'DeFi', icon: 'Defi' },
  { id: 'social', label: 'SocialFi', icon: 'Social' },
  { id: 'direct', label: 'Direct API', icon: 'Send' },
  { id: 'prediction', label: 'Prediction Markets', icon: 'Prediction', badge: 'NEW' },
  { id: 'stablecoin', label: 'Stablecoin', icon: 'Stablecoin', badge: 'NEW' },
];

type SortMode = 'popular' | 'alpha';

export function Endpoints() {
  const [active, setActive] = useState<EndpointCategory>('all');
  const [sort, setSort] = useState<SortMode>('popular');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let out = endpoints;
    if (active !== 'all') out = out.filter((e) => e.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (e) =>
          e.path.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }
    if (sort === 'alpha') {
      out = [...out].sort((a, b) => a.path.localeCompare(b.path));
    }
    return out;
  }, [active, sort, query]);

  return (
    <div className="view">
      <section className="cat-rail" aria-label="Endpoint categories">
        {categories.map((c) => {
          const I = Icon[c.icon];
          return (
            <button
              key={c.id}
              className={`cat ${active === c.id ? 'active' : ''}`}
              onClick={() => setActive(c.id)}
            >
              <I size={18} />
              <span className="cat-label">{c.label}</span>
              {c.badge && <span className="badge new cat-badge">{c.badge}</span>}
            </button>
          );
        })}
      </section>

      <section className="panel">
        <header className="panel-head">
          <div className="ep-head-left">
            <h2 className="panel-title">
              {active === 'all'
                ? 'All Endpoints'
                : categories.find((c) => c.id === active)?.label}
            </h2>
            <span className="dim ep-count">
              {filtered.length} endpoint{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="ep-controls">
            <div className="tb-search small">
              <Icon.Search size={13} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                aria-label="Filter endpoints"
              />
            </div>
            <div className="seg">
              <button
                className={`seg-item ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => setSort('popular')}
              >
                Most Popular
              </button>
              <button
                className={`seg-item ${sort === 'alpha' ? 'active' : ''}`}
                onClick={() => setSort('alpha')}
              >
                Alphabetical
              </button>
            </div>
          </div>
        </header>

        <div className="ep-grid">
          {filtered.map((e) => (
            <button key={e.path + e.method} className="ep-card">
              <div className="ep-card-row">
                <span
                  className={`badge ${
                    e.method === 'GET' ? 'method-get' : 'method-post'
                  }`}
                >
                  {e.method}
                </span>
                <span className="mono ep-path">{e.path}</span>
                {e.badge === 'new' && (
                  <span className="badge new ep-tag">NEW</span>
                )}
                <Icon.Chevron size={14} className="ep-chev" />
              </div>
              <p className="ep-desc">{e.description}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="empty">No endpoints match this filter.</div>
          )}
        </div>
      </section>
    </div>
  );
}
