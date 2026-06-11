import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { rpcChains, rpcMethods } from '../data/mock';

const API_KEY = 'ub_live_8f4c2a91b73e5a90c1f6d8e2b5a7c3d9';
const HTTP_BASE = 'https://api.uniblock.dev/uni/v1/json-rpc';
const WSS_BASE = 'wss://api.uniblock.dev/uni/v1/json-rpc';

export function JsonRpc() {
  const [selected, setSelected] = useState(rpcChains[0]);
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<'all' | 'mainnet' | 'testnet'>('all');
  const [sort, setSort] = useState<'trending' | 'alpha'>('trending');
  const [proto, setProto] = useState<'https' | 'wss'>('https');
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    let out = rpcChains.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || String(c.chainId).includes(search));
    if (network === 'testnet') out = [];
    if (sort === 'alpha') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [search, network, sort]);

  const httpUrl = `${HTTP_BASE}?chainId=${selected.chainId}&apiKey=${API_KEY}`;
  const wssUrl = `${WSS_BASE}?chainId=${selected.chainId}&apiKey=${API_KEY}`;
  const url = proto === 'https' ? httpUrl : wssUrl;

  const curl = `curl ${HTTP_BASE}?chainId=${selected.chainId} \\
  -X POST -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'`;

  const groups = useMemo(() => {
    const m = new Map<string, typeof rpcMethods>();
    rpcMethods.forEach((r) => { if (!m.has(r.group)) m.set(r.group, []); m.get(r.group)!.push(r); });
    return [...m.entries()];
  }, []);

  return (
    <div className="view">
      <p className="dim rise rise-1" style={{ fontSize: 13, lineHeight: '20px', maxWidth: '78ch' }}>
        Each chain groups its mainnet and related networks. Switch HTTPS or WebSockets to view the matching URL,
        and open a network for RPC tools and supported methods. WebSocket routing needs a provider selected; until
        then the row shows as offline.
      </p>

      {/* Filter toolbar */}
      <div className="view-toolbar rise rise-2">
        <div className="tb-search small">
          <Icon.Search size={14} />
          <input placeholder="Search networks or chain ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ep-controls">
          <div className="seg">
            {(['all', 'mainnet', 'testnet'] as const).map((n) => (
              <button key={n} className={`seg-item ${network === n ? 'active' : ''}`} onClick={() => setNetwork(n)}>
                {n === 'all' ? 'All' : n === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </button>
            ))}
          </div>
          <div className="seg">
            <button className={`seg-item ${sort === 'trending' ? 'active' : ''}`} onClick={() => setSort('trending')}>Trending</button>
            <button className={`seg-item ${sort === 'alpha' ? 'active' : ''}`} onClick={() => setSort('alpha')}>Alphabetical</button>
          </div>
        </div>
      </div>

      {/* Chain grid */}
      {filtered.length === 0 ? (
        <div className="empty">No networks match your filters.</div>
      ) : (
        <section className="jrpc-grid rise rise-3">
          {filtered.map((c) => (
            <button key={c.chainId} className={`jrpc-card ${selected.chainId === c.chainId ? 'on' : ''}`} onClick={() => setSelected(c)}>
              <div className="jrpc-card-head">
                <img className="jrpc-icon" src={c.icon} alt="" />
                <div className="jrpc-meta">
                  <span className="jrpc-name">{c.name}</span>
                  <span className="dim" style={{ fontSize: 12 }}>Chain ID {c.chainId}</span>
                </div>
              </div>
              <div className="jrpc-status">
                <span className="dot ok" aria-hidden /> Active
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Inline detail for selected chain */}
      <article className="panel marks rise rise-4">
        <header className="panel-head">
          <div>
            <span className="eyebrow"><img className="chain-img sm" src={selected.icon} alt="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />{selected.name} · Chain ID {selected.chainId}</span>
            <h2 className="panel-title">Connect to {selected.name}</h2>
          </div>
          <div className="seg">
            <button className={`seg-item ${proto === 'https' ? 'active' : ''}`} onClick={() => setProto('https')}>HTTPS</button>
            <button className={`seg-item ${proto === 'wss' ? 'active' : ''}`} onClick={() => setProto('wss')}>WebSocket</button>
          </div>
        </header>

        <div className="key-display">
          <span className="badge">{proto === 'https' ? 'URL' : 'WSS'}</span>
          <span className="mono key-display-text">{url.replace(API_KEY, `${API_KEY.slice(0, 11)}…`)}</span>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
            {copied ? <Icon.Check size={13} /> : <Icon.Copy size={13} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="qs-grid">
          <div>
            <span className="rpc-group-label">CURL Request</span>
            <pre className="code-pre" style={{ background: 'var(--ub-grid)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>{curl}</pre>
          </div>
          <div>
            <span className="rpc-group-label">Example Response</span>
            <pre className="code-pre" style={{ background: 'var(--ub-grid)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12e1f4a"
}`}</pre>
          </div>
        </div>
      </article>

      {/* Supported methods */}
      <article className="panel rise rise-5">
        <header className="panel-head">
          <div><span className="eyebrow">Reference</span><h2 className="panel-title">Supported methods</h2></div>
          <span className="dim ep-count">{rpcMethods.length} methods</span>
        </header>
        <div className="rpc-groups">
          {groups.map(([group, methods]) => (
            <div className="rpc-group" key={group}>
              <div className="rpc-group-label">{group}</div>
              {methods.map((m) => (
                <button key={m.name} className="rpc-method">
                  <span className="mono rpc-method-name">{m.name}</span>
                  <span className="dim rpc-method-desc">{m.description}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
