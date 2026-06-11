import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { endpoints } from '../data/mock';

type Surface = 'all' | 'unified' | 'direct';
type Row = {
  method: 'GET' | 'POST' | 'WS';
  path: string;
  surface: 'unified' | 'direct' | 'json-rpc';
  provider?: string;
  category: string;
};

const directRows: Row[] = [
  { method: 'GET',  path: 'alchemy_getTokenBalances',   surface: 'direct', provider: 'Alchemy',  category: 'Token' },
  { method: 'GET',  path: 'helius_getAssetsByOwner',    surface: 'direct', provider: 'Helius',   category: 'NFT' },
  { method: 'POST', path: 'qn_fetchNFTs',               surface: 'direct', provider: 'QuickNode',category: 'NFT' },
  { method: 'GET',  path: 'moralis_getWalletHistory',   surface: 'direct', provider: 'Moralis',  category: 'Transaction' },
  { method: 'GET',  path: 'goldrush_getTokenHolders',   surface: 'direct', provider: 'GoldRush', category: 'Token' },
];

const unifiedRows: Row[] = endpoints.map((e) => ({
  method: e.method,
  path: e.path,
  surface: e.category === 'json-rpc' ? 'json-rpc' : 'unified',
  category: e.category.replace(/^\w/, (c) => c.toUpperCase()),
}));

const allRows: Row[] = [...unifiedRows, ...directRows];

const PAGE = 10;

export function AllApis() {
  const [surface, setSurface] = useState<Surface>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let out = allRows;
    if (surface === 'unified') out = out.filter((r) => r.surface !== 'direct');
    if (surface === 'direct') out = out.filter((r) => r.surface === 'direct');
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((r) => r.path.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return out;
  }, [surface, search]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div className="view">
      <div className="view-toolbar rise rise-1">
        <div className="seg">
          {(['all', 'unified', 'direct'] as Surface[]).map((s) => (
            <button key={s} className={`seg-item ${surface === s ? 'active' : ''}`} onClick={() => { setSurface(s); setPage(1); }}>
              {s === 'all' ? 'All' : s === 'unified' ? 'Unified' : 'Direct'}
            </button>
          ))}
        </div>
        <div className="ep-controls">
          <div className="tb-search small">
            <Icon.Search size={14} />
            <input placeholder="Search endpoints…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button className="btn"><Icon.Settings size={14} /> Filters</button>
        </div>
      </div>

      <article className="panel marks rise rise-2">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Surface</th>
                <th>Category</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.path}>
                  <td><span className={`badge ${r.method === 'GET' ? 'method-get' : r.method === 'POST' ? 'method-post' : 'method-ws'}`}>{r.method}</span></td>
                  <td className="mono">{r.path}</td>
                  <td>
                    {r.surface === 'direct'
                      ? <span className="badge"><Icon.Send size={11} /> Direct{r.provider ? ` · ${r.provider}` : ''}</span>
                      : r.surface === 'json-rpc'
                      ? <span className="badge"><Icon.Code size={11} /> JSON-RPC</span>
                      : <span className="badge new"><Icon.Defi size={11} /> Unified</span>}
                  </td>
                  <td className="dim">{r.category}</td>
                  <td className="num"><Icon.Chevron size={14} className="ep-chev" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <span className="dim">{rows.length} endpoints</span>
          <div className="pager">
            <button className="btn ghost icon-only" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><Icon.Chevron size={14} style={{ transform: 'rotate(180deg)' }} /></button>
            <span className="mono dim">{page} / {pages}</span>
            <button className="btn ghost icon-only" disabled={page === pages} onClick={() => setPage((p) => p + 1)}><Icon.Chevron size={14} /></button>
          </div>
        </div>
      </article>
    </div>
  );
}
