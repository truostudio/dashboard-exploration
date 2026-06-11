import { useState } from 'react';
import { Icon } from '../components/Icons';
import { webhooks } from '../data/mock';

export function Webhooks() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="view">
      <div className="view-toolbar rise rise-1">
        <span className="dim" style={{ fontSize: 13 }}>
          Real-time event delivery with automatic retries and signed payloads.
        </span>
        <button className="btn primary"><Icon.Plus size={14} /> Create Webhook <Icon.External size={13} /></button>
      </div>

      <article className="panel marks rise rise-2" style={{ padding: 0 }}>
        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Name</th>
                <th>Network</th>
                <th>Provider</th>
                <th>Webhook URL</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((w) => (
                <tr key={w.id} className="row-click">
                  <td><span className="badge new">{w.event}</span></td>
                  <td style={{ fontWeight: 500 }}>{w.label}</td>
                  <td className="dim">{w.chain}</td>
                  <td className="dim">{w.provider}</td>
                  <td>
                    <button
                      className="url-copy-btn"
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(w.url); setCopied(w.id); setTimeout(() => setCopied(null), 1200); }}
                    >
                      {copied === w.id ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
                      <span className="mono url-copy-text">{w.url}</span>
                    </button>
                  </td>
                  <td>
                    <div className="list-main">
                      <span>{w.created}</span>
                      <span className="dim" style={{ fontSize: 11.5 }}>{w.ago}</span>
                    </div>
                  </td>
                  <td className="num"><Icon.Chevron size={14} className="ep-chev" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
