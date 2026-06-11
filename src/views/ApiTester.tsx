import { useState } from 'react';
import { Icon } from '../components/Icons';
import { endpoints } from '../data/mock';

const testable = endpoints.filter((e) => e.method === 'GET');

const sampleResponse = `{
  "chain": "ethereum",
  "address": "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
  "balance": "0x1bc16d674ec80000",
  "balance_decimal": "2.0",
  "symbol": "ETH",
  "decimals": 18,
  "block": 19834201,
  "provider": "alchemy",
  "latency_ms": 64
}`;

export function ApiTester() {
  const [path, setPath] = useState(testable[0].path);
  const [chain, setChain] = useState('ethereum');
  const [address, setAddress] = useState('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState<string | null>(null);

  function run() {
    setRunning(true);
    setRes(null);
    setTimeout(() => {
      setRunning(false);
      setRes(sampleResponse);
    }, 700);
  }

  return (
    <div className="view">
      <section className="qs-grid rise rise-1">
        <article className="panel">
          <header className="panel-head">
            <div>
              <span className="eyebrow">Request</span>
              <h2 className="panel-title">Composer</h2>
            </div>
          </header>

          <div className="field">
            <label className="field-label">Endpoint</label>
            <div className="composer-row">
              <span className="badge method-get">GET</span>
              <select className="input" value={path} onChange={(e) => setPath(e.target.value)}>
                {testable.map((e) => (
                  <option key={e.path} value={e.path}>{e.path}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-grid">
            <div className="field">
              <label className="field-label">Chain</label>
              <select className="input" value={chain} onChange={(e) => setChain(e.target.value)}>
                <option value="ethereum">ethereum</option>
                <option value="base">base</option>
                <option value="polygon">polygon</option>
                <option value="solana">solana</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Address</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn primary" onClick={run} disabled={running}>
              {running ? <Icon.Refresh size={13} /> : <Icon.Play size={13} />}
              {running ? 'Running…' : 'Send request'}
            </button>
            <span className="form-actions-spacer" />
            <span className="dim mono" style={{ fontSize: 12 }}>credentials prefilled</span>
          </div>
        </article>

        <article className="panel">
          <header className="panel-head">
            <div>
              <span className="eyebrow">Response</span>
              <h2 className="panel-title">Result</h2>
            </div>
            {res && (
              <div className="resp-meta">
                <span className="badge success">200 OK</span>
                <span className="mono dim">64 ms</span>
                <span className="badge">alchemy</span>
              </div>
            )}
          </header>

          {!res && !running && (
            <div className="empty">Send a request to see the live response.</div>
          )}
          {running && <div className="empty">Routing through the fastest healthy provider…</div>}
          {res && <pre className="code-pre response-pre">{res}</pre>}
        </article>
      </section>
    </div>
  );
}
