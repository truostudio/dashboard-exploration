import { useState } from 'react';
import { Icon } from '../components/Icons';
import { providers, chains } from '../data/mock';

const regions = ['us-east', 'us-west', 'eu-west', 'ap-southeast', 'global'] as const;

type Region = (typeof regions)[number];

export function SettingsProject() {
  const [name, setName] = useState('eth-mainnet-prod');
  const [env, setEnv] = useState<'dev' | 'staging' | 'prod'>('prod');
  const [region, setRegion] = useState<Region>('global');
  const [autoFailover, setAutoFailover] = useState(true);
  const [retries, setRetries] = useState(2);
  const [order, setOrder] = useState(['alchemy', 'quicknode', 'infura', 'helius']);

  function move(id: string, dir: -1 | 1) {
    const i = order.indexOf(id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  }

  return (
    <div className="view">
      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">General</h2>
            <p className="panel-sub dim">Project identity and where Uniblock should originate requests from.</p>
          </div>
        </header>

        <div className="settings-grid">
          <label className="field">
            <span className="field-label">Project name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Project ID</span>
            <input className="input" value={name} disabled />
          </label>

          <div className="field">
            <span className="field-label">Environment</span>
            <div className="seg">
              {(['dev', 'staging', 'prod'] as const).map((e) => (
                <button key={e} className={`seg-item ${env === e ? 'active' : ''}`} onClick={() => setEnv(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Region</span>
            <div className="seg">
              {regions.map((r) => (
                <button key={r} className={`seg-item ${region === r ? 'active' : ''}`} onClick={() => setRegion(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn primary">Save changes</button>
          <button className="btn ghost">Discard</button>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Routing</h2>
            <p className="panel-sub dim">
              Uniblock routes each request to the fastest healthy provider in your pool. Reorder to set fallback
              priority. Disable a provider to remove it from the pool entirely.
            </p>
          </div>
          <span className="badge">Smart routing</span>
        </header>

        <div className="route-list">
          {order.map((id, i) => {
            const p = providers.find((x) => x.id === id)!;
            return (
              <div key={id} className="route-row">
                <span className="route-rank mono">{String(i + 1).padStart(2, '0')}</span>
                <div className="route-main">
                  <span className="route-name">{p.name}</span>
                  <span className="dim mono">{p.latencyMs}ms · {p.uptime}% uptime · {p.status}</span>
                </div>
                <div className="route-actions">
                  <button className="btn ghost icon-only" aria-label="Move up" onClick={() => move(id, -1)} disabled={i === 0}>
                    <Icon.ChevronDown size={13} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button className="btn ghost icon-only" aria-label="Move down" onClick={() => move(id, 1)} disabled={i === order.length - 1}>
                    <Icon.ChevronDown size={13} />
                  </button>
                  <button className="btn ghost icon-only" aria-label="Remove" onClick={() => setOrder(order.filter((x) => x !== id))}>
                    <Icon.X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="form-actions">
          <button className="btn"><Icon.Plus size={13} /> Add provider</button>
          <div className="form-actions-spacer" />
          <label className="toggle">
            <input type="checkbox" checked={autoFailover} onChange={(e) => setAutoFailover(e.target.checked)} />
            <span className="toggle-slider" aria-hidden />
            <span className="toggle-label">Automatic failover</span>
          </label>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Limits & retries</h2>
            <p className="panel-sub dim">How aggressively Uniblock should retry on transient errors.</p>
          </div>
        </header>

        <div className="settings-grid">
          <label className="field">
            <span className="field-label">Retries on failure</span>
            <div className="seg">
              {[0, 1, 2, 3].map((n) => (
                <button key={n} className={`seg-item ${retries === n ? 'active' : ''}`} onClick={() => setRetries(n)}>
                  {n}
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span className="field-label">Per-key rate limit</span>
            <input className="input" defaultValue="500 req/s" />
          </label>

          <label className="field">
            <span className="field-label">Default chain</span>
            <select className="input" defaultValue="ethereum">
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">IP allowlist</span>
            <input className="input" placeholder="0.0.0.0/0 (open)" />
          </label>
        </div>
      </section>

      <section className="panel danger">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Danger zone</h2>
            <p className="panel-sub dim">Irreversible operations. Double-check what you're doing.</p>
          </div>
        </header>

        <div className="danger-row">
          <div className="danger-text">
            <span className="danger-label">Transfer ownership</span>
            <span className="dim">Move this project to another team member. They will become the new owner.</span>
          </div>
          <button className="btn">Transfer</button>
        </div>
        <div className="danger-row">
          <div className="danger-text">
            <span className="danger-label">Delete project</span>
            <span className="dim">Permanently delete <span className="mono">{name}</span> and revoke all of its API keys.</span>
          </div>
          <button className="btn danger">
            <Icon.Trash size={13} /> Delete project
          </button>
        </div>
      </section>
    </div>
  );
}
