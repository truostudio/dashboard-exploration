import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { rpcGroups, rpcNetworkCount } from '../data/mock';

const HTTP = 'https://api.uniblock.dev/uni/v1/json-rpc';
const WSS = 'wss://api.uniblock.dev/uni/v1/json-rpc';

export function JsonRpc() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'trending' | 'az'>('trending');
  const [ep, setEp] = useState<Record<string, 'https' | 'wss'>>({});
  const [wssProv, setWssProv] = useState<Record<string, string>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = search.toLowerCase();
    let gs = rpcGroups
      .map((g) => ({
        ...g,
        networks: g.networks.filter(
          (n) => !q || n.name.toLowerCase().includes(q) || n.chainId.includes(q) || g.name.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.networks.length);
    if (sort === 'az') gs = [...gs].sort((a, b) => a.name.localeCompare(b.name));
    return gs;
  }, [search, sort]);

  function copy(id: string, url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="view">
      <p className="dim rise rise-1" style={{ fontSize: 13, lineHeight: '20px', maxWidth: '88ch' }}>
        Each chain groups its mainnet and related networks. Switch HTTPS or WebSockets to view the matching URL,
        and open a row for RPC tools and supported methods. WebSocket routing needs a provider selected; until
        then the row shows as offline.
      </p>

      <div className="view-toolbar rise rise-2">
        <div className="tb-search" style={{ flex: 1 }}>
          <Icon.Search size={15} />
          <input placeholder="Search networks by name or chain ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ep-controls">
          <button className="btn"><Icon.Settings size={14} /> Filters</button>
          <div className="seg">
            <button className={`seg-item ${sort === 'trending' ? 'active' : ''}`} onClick={() => setSort('trending')}>Trending</button>
            <button className={`seg-item ${sort === 'az' ? 'active' : ''}`} onClick={() => setSort('az')}>A–Z</button>
          </div>
        </div>
      </div>

      <div className="section-row rise rise-3">
        <h3 className="section-h">{sort === 'az' ? 'All networks' : 'Popular networks'}</h3>
        <span className="dim mono" style={{ fontSize: 12 }}>{rpcNetworkCount} networks</span>
      </div>

      {groups.length === 0 && <div className="empty">No networks match your filters.</div>}

      {groups.map((g) => {
        const type = ep[g.id] ?? 'https';
        const wss = type === 'wss';
        const base = wss ? WSS : HTTP;
        return (
          <article key={g.id} className="panel rpc-group rise rise-3">
            <header className="rpc-group-head">
              <img className="rpc-group-icon" src={g.icon} alt="" />
              <h2 className="rpc-group-name">{g.name}</h2>
              <div className="endpoint-toggle">
                <span className="dim endpoint-label">Endpoint type</span>
                <div className="ep-pill">
                  <button className={!wss ? 'on' : ''} onClick={() => setEp((s) => ({ ...s, [g.id]: 'https' }))}>HTTPS</button>
                  <button className={wss ? 'on' : ''} onClick={() => setEp((s) => ({ ...s, [g.id]: 'wss' }))}>WebSockets</button>
                </div>
              </div>
            </header>

            <div className="table-wrap" style={{ margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Network</th>
                    {wss && <th>Provider</th>}
                    <th>{wss ? 'WebSocket URL' : 'HTTPS URL'}</th>
                    <th>Last request</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {g.networks.map((n) => {
                    const rowKey = `${g.id}-${n.chainId}`;
                    const provider = wssProv[rowKey];
                    const url = wss
                      ? provider
                        ? `${base}?chainId=${n.chainId}&provider=${provider}`
                        : `${base}?chainId=${n.chainId}`
                      : `${base}?chainId=${n.chainId}`;
                    const online = !wss || !!provider;
                    const sel = n.wssProviders.find((p) => p.name === provider);
                    return (
                      <tr key={n.chainId}>
                        <td>
                          <span className="member-cell">
                            <img className="rpc-net-icon" src={g.icon} alt="" />
                            {n.name}
                          </span>
                        </td>

                        {wss && (
                          <td>
                            <div className="wss-select">
                              <button
                                className={`wss-select-btn ${sel ? 'picked' : ''}`}
                                onClick={() => setOpenMenu(openMenu === rowKey ? null : rowKey)}
                              >
                                {sel ? (
                                  <>
                                    <img src={sel.icon} alt="" />
                                    <span>{sel.name}</span>
                                  </>
                                ) : (
                                  <span className="dim">Select provider</span>
                                )}
                                <Icon.ChevronDown size={13} />
                              </button>
                              {openMenu === rowKey && (
                                <div className="wss-menu">
                                  {n.wssProviders.map((p) => (
                                    <button
                                      key={p.name}
                                      className={`wss-menu-item ${provider === p.name ? 'on' : ''}`}
                                      onClick={() => { setWssProv((s) => ({ ...s, [rowKey]: p.name })); setOpenMenu(null); }}
                                    >
                                      <img src={p.icon} alt="" />
                                      <span>{p.name}</span>
                                      {provider === p.name && <Icon.Check size={13} />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        <td>
                          <div className="rpc-url">
                            <span className={`mono rpc-url-text ${wss && !provider ? 'dim' : ''}`}>{url}</span>
                            <button className="rpc-url-copy" aria-label="Copy URL" disabled={wss && !provider} onClick={() => copy(rowKey, url)}>
                              {copied === rowKey ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="dim">{n.lastRequest}</td>
                        <td>
                          {online ? (
                            <span className="badge success"><span className="dot ok" /> Online</span>
                          ) : (
                            <span className="badge"><span className="dot" /> Offline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}

      {openMenu && <div className="wss-backdrop" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
