import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { endpoints, chains } from '../data/mock';
import type { EndpointCategory } from '../data/mock';

const catLabels: { id: EndpointCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'token', label: 'Token' },
  { id: 'nft', label: 'NFT' },
  { id: 'market', label: 'Market Data' },
  { id: 'defi', label: 'DeFi' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'scan', label: 'Scan' },
  { id: 'social', label: 'SocialFi' },
  { id: 'prediction', label: 'Prediction' },
  { id: 'stablecoin', label: 'Stablecoin' },
];

const unified = endpoints.filter((e) => e.category !== 'json-rpc' && e.category !== 'direct');

// Deterministic pseudo coverage per endpoint (real app reads endpoint.providers)
function coverage(path: string) {
  const seed = path.length;
  const chainCount = 6 + (seed % 9);
  const providerCount = 2 + (seed % 5);
  return { chainCount, providerCount };
}

export function UnifiedApis() {
  const [active, setActive] = useState<EndpointCategory>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'trending' | 'alpha'>('trending');

  const filtered = useMemo(() => {
    let out = active === 'all' ? unified : unified.filter((e) => e.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((e) => e.path.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (sort === 'alpha') out = [...out].sort((a, b) => a.path.localeCompare(b.path));
    return out;
  }, [active, search, sort]);

  return (
    <div className="view">
      <div className="view-toolbar rise rise-1">
        <div className="tb-search small">
          <Icon.Search size={14} />
          <input placeholder="Search endpoints…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ep-controls">
          <button className="btn"><Icon.Defi size={14} /> Filter chains</button>
          <div className="seg">
            <button className={`seg-item ${sort === 'trending' ? 'active' : ''}`} onClick={() => setSort('trending')}>Trending</button>
            <button className={`seg-item ${sort === 'alpha' ? 'active' : ''}`} onClick={() => setSort('alpha')}>Alphabetical</button>
          </div>
        </div>
      </div>

      <div className="chip-strip rise rise-2">
        {catLabels.map((c) => (
          <button key={c.id} className={`chip ${active === c.id ? 'on' : ''}`} onClick={() => setActive(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <section className="unified-grid rise rise-3">
        {filtered.map((e) => {
          const { chainCount, providerCount } = coverage(e.path);
          const shown = chains.slice(0, 4);
          return (
            <button key={e.path} className="usum-card">
              <span className={`badge ${e.method === 'GET' ? 'method-get' : 'method-post'}`} style={{ alignSelf: 'flex-start' }}>{e.method}</span>
              <span className="mono usum-path">{e.path}</span>
              <span className="usum-desc dim">{e.description}</span>
              <div className="usum-foot">
                <div className="chain-avatars">
                  {shown.map((c) => (
                    <img key={c.id} className="chain-avatar" src={c.icon} alt={c.name} title={c.name} />
                  ))}
                  {chainCount > 4 && <span className="chain-avatar more">+{chainCount - 4}</span>}
                </div>
                <span className="dim mono usum-prov">{providerCount} providers</span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="empty">No endpoints match your filters.</div>}
      </section>
    </div>
  );
}
