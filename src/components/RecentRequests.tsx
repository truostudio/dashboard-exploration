import { recentRequests } from '../data/mock';

function statusClass(s: number) {
  if (s >= 500) return 'badge danger';
  if (s >= 400) return 'badge';
  return 'badge success';
}

export function RecentRequests() {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Recent requests</h2>
          <p className="panel-sub dim">Live tail of your latest API activity</p>
        </div>
        <button className="btn ghost">View all</button>
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
            {recentRequests.map((r) => (
              <tr key={r.id}>
                <td className="mono dim">{r.ts}</td>
                <td>
                  <span
                    className={`badge ${
                      r.method === 'GET' ? 'method-get' : 'method-post'
                    }`}
                  >
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
  );
}
