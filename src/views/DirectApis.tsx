import { useState } from 'react';
import { Icon } from '../components/Icons';
import { directProviders, directSpotlight } from '../data/mock';

export function DirectApis() {
  const [query, setQuery] = useState('');
  const list = directProviders.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="view">
      <article className="spotlight rise rise-1">
        <div className="spotlight-body">
          <span className="eyebrow">{directSpotlight.category}</span>
          <h2 className="spotlight-title">{directSpotlight.title}</h2>
          <p className="spotlight-desc">{directSpotlight.description}</p>
          <div className="spotlight-actions">
            <button className="btn primary"><Icon.External size={13} /> Explore endpoints</button>
            <span className="dim mono" style={{ fontSize: 12 }}>{directSpotlight.endpoints} endpoints</span>
          </div>
        </div>
        <span className="badge solid spotlight-tag">Spotlight</span>
      </article>

      <div className="view-toolbar rise rise-2">
        <div className="ep-head-left">
          <h2 className="panel-title">Providers</h2>
          <span className="ep-count dim">{list.length} of {directProviders.length}</span>
        </div>
        <div className="tb-search small">
          <Icon.Search size={14} />
          <input
            placeholder="Search providers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="prov-direct-grid rise rise-3">
        {list.map((p) => {
          const offerings = p.featured ? ['REST', 'WebSocket'] : p.endpoints > 25 ? ['REST', 'Webhooks'] : ['REST'];
          return (
            <button key={p.name} className={`prov-tile ${p.featured ? 'featured' : ''}`}>
              <div className="prov-tile-head">
                <img className="prov-avatar" src={p.icon} alt={p.name} />
                <div className="prov-tile-name">
                  <span className="prov-tile-title">
                    {p.featured && <span className="spark" aria-hidden>✦</span>}
                    {p.name}
                  </span>
                  <span className="prov-tile-sub dim">{p.subtitle}</span>
                </div>
                <Icon.Chevron size={14} className="prov-tile-chev" />
              </div>
              <div className="offering-chips">
                {offerings.map((o) => <span key={o} className="offering-chip">{o}</span>)}
              </div>
              <div className="prov-tile-meta">
                <span className="mono">{p.endpoints} endpoints</span>
                <span className="dot" aria-hidden />
                <span className="mono">{p.chains} chains</span>
              </div>
            </button>
          );
        })}
        {list.length === 0 && <div className="empty">No providers match “{query}”.</div>}
      </section>
    </div>
  );
}
