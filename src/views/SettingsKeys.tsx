import { useState } from 'react';
import { Icon } from '../components/Icons';
import { apiKeys } from '../data/mock';

const allScopes = ['unified', 'json-rpc', 'webhooks', 'admin'] as const;

export function SettingsKeys() {
  const [keys, setKeys] = useState(apiKeys);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [env, setEnv] = useState<'prod' | 'staging' | 'dev'>('dev');
  const [scopes, setScopes] = useState<Set<string>>(new Set(['unified']));

  function copy(prefix: string) {
    navigator.clipboard?.writeText(`${prefix}_••••••••`);
    setCopied(prefix);
    setTimeout(() => setCopied(null), 1200);
  }

  function toggleScope(s: string) {
    const next = new Set(scopes);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setScopes(next);
  }

  function create() {
    if (!name.trim()) return;
    const prefix =
      env === 'prod'
        ? `ub_live_${Math.random().toString(36).slice(2, 10)}`
        : `ub_test_${Math.random().toString(36).slice(2, 10)}`;
    setKeys((k) => [
      {
        id: `k${k.length + 1}`,
        name: name.trim(),
        env,
        prefix,
        scopes: [...scopes],
        created: 'just now',
        lastUsed: 'never',
        rate: env === 'prod' ? '500 req/s' : '100 req/s',
      },
      ...k,
    ]);
    setName('');
    setScopes(new Set(['unified']));
    setEnv('dev');
    setCreating(false);
  }

  function revoke(id: string) {
    setKeys((k) => k.filter((x) => x.id !== id));
  }

  return (
    <div className="view">
      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">API Keys</h2>
            <p className="panel-sub dim">
              Use scoped keys to grant production access without sharing your owner key. Rotate keys without
              downtime — old and new are valid for 60 seconds during a rotation.
            </p>
          </div>
          <button className="btn primary" onClick={() => setCreating((v) => !v)}>
            <Icon.Plus size={13} /> {creating ? 'Cancel' : 'New key'}
          </button>
        </header>

        {creating && (
          <div className="key-form">
            <div className="settings-grid">
              <label className="field">
                <span className="field-label">Key name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Server — payments" />
              </label>
              <div className="field">
                <span className="field-label">Environment</span>
                <div className="seg">
                  {(['dev', 'staging', 'prod'] as const).map((e) => (
                    <button key={e} className={`seg-item ${env === e ? 'active' : ''}`} onClick={() => setEnv(e)}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="field">
              <span className="field-label">Scopes</span>
              <div className="scope-row">
                {allScopes.map((s) => (
                  <button
                    key={s}
                    className={`scope-chip ${scopes.has(s) ? 'on' : ''}`}
                    onClick={() => toggleScope(s)}
                  >
                    {scopes.has(s) && <Icon.Check size={11} />} {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn primary" onClick={create} disabled={!name.trim() || scopes.size === 0}>
                Create key
              </button>
              <button className="btn ghost" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Env</th>
                <th>Key</th>
                <th>Scopes</th>
                <th>Created</th>
                <th>Last used</th>
                <th className="num"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td><span style={{ fontWeight: 500 }}>{k.name}</span></td>
                  <td>
                    <span className={`badge ${k.env === 'prod' ? 'method-post' : ''}`}>{k.env}</span>
                  </td>
                  <td>
                    <div className="key-cell">
                      <span className="mono">
                        {revealed[k.id] ? `${k.prefix}_••••••••` : `${k.prefix.slice(0, 11)}…`}
                      </span>
                      <button
                        className="sb-key-btn"
                        aria-label="Toggle key"
                        onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                      >
                        <Icon.Eye size={12} />
                      </button>
                      <button
                        className="sb-key-btn"
                        aria-label="Copy"
                        onClick={() => copy(k.prefix)}
                      >
                        {copied === k.prefix ? <Icon.Check size={12} /> : <Icon.Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="scope-row tight">
                      {k.scopes.map((s) => (
                        <span key={s} className="badge">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="muted">{k.created}</td>
                  <td className="muted">{k.lastUsed}</td>
                  <td className="num">
                    <button className="btn ghost icon-only" aria-label="Rotate"><Icon.Refresh size={13} /></button>
                    <button className="btn ghost icon-only" aria-label="Revoke" onClick={() => revoke(k.id)}>
                      <Icon.Trash size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
