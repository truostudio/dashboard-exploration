import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { recentRequests } from '../data/mock';

const statusFilters = ['all', '2xx', '4xx', '5xx'] as const;
type StatusFilter = (typeof statusFilters)[number];

function statusClass(s: number) {
  if (s >= 500) return 'badge danger';
  if (s >= 400) return 'badge warning';
  return 'badge success';
}

export function Logs() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [tail, setTail] = useState(true);

  const rows = useMemo(() => {
    const base = recentRequests.concat(recentRequests).map((r, i) => ({ ...r, id: `${r.id}-${i}` }));
    return base.filter((r) => {
      if (status === '2xx' && !(r.status >= 200 && r.status < 300)) return false;
      if (status === '4xx' && !(r.status >= 400 && r.status < 500)) return false;
      if (status === '5xx' && !(r.status >= 500)) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (
          !r.endpoint.toLowerCase().includes(s) &&
          !r.chain.toLowerCase().includes(s) &&
          !r.provider.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [q, status]);

  return (
    <div className="view">
      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Live request log</h2>
            <p className="panel-sub dim">Every API call this project routed in the last hour. Click a row for the full trace.</p>
          </div>

          <div className="logs-controls">
            <div className="tb-search small">
              <Icon.Search size={13} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by endpoint, chain, provider…"
                aria-label="Filter logs"
              />
            </div>
            <div className="seg">
              {statusFilters.map((f) => (
                <button key={f} className={`seg-item ${status === f ? 'active' : ''}`} onClick={() => setStatus(f)}>
                  {f}
                </button>
              ))}
            </div>
            <button className={`btn ${tail ? 'primary' : ''}`} onClick={() => setTail((v) => !v)}>
              {tail ? <Icon.Check size={13} /> : <Icon.Play size={13} />} Tail
            </button>
            <button className="btn ghost"><Icon.Download size={13} /> Export</button>
          </div>
        </header>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Chain</th>
                <th>Provider</th>
                <th className="num">Latency</th>
                <th className="num">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono dim">{r.ts}</td>
                  <td>
                    <span className={`badge ${r.method === 'GET' ? 'method-get' : 'method-post'}`}>
                      {r.method}
                    </span>
                  </td>
                  <td className="mono">{r.endpoint}</td>
                  <td>{r.chain}</td>
                  <td className="muted">{r.provider}</td>
                  <td className="num mono">{r.latencyMs}ms</td>
                  <td className="num">
                    <span className={statusClass(r.status)}>{r.status}</span>
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
