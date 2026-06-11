import { useState } from 'react';
import { Icon } from '../components/Icons';
import { apiKeys } from '../data/mock';

export function SettingsProject() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="view">
      <div className="view-toolbar rise rise-1">
        <span className="dim" style={{ fontSize: 13 }}>Keys, project name, and lifecycle for eth-mainnet-prod.</span>
        <button className="btn"><Icon.External size={14} /> Manage Integrations</button>
      </div>

      {/* API Keys */}
      <article className="panel rise rise-2" style={{ padding: 0 }}>
        <header className="panel-head" style={{ padding: '18px 20px 0' }}>
          <div>
            <h2 className="panel-title">API Keys</h2>
            <p className="panel-sub dim">Manage your project API keys.</p>
          </div>
          <button className="btn primary"><Icon.Plus size={14} /> Create API key</button>
        </header>
        <div className="table-wrap" style={{ margin: '14px 0 0' }}>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Key</th><th>Created At</th><th>Last used</th><th></th></tr>
            </thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 500 }}>{k.name}</td>
                  <td><span className="mono">{k.prefix}{'••••'}</span></td>
                  <td className="dim">{k.created}</td>
                  <td className="dim">{k.lastUsed}</td>
                  <td className="num">
                    <span className="row-actions">
                      <button className="btn ghost icon-only" aria-label="Copy" onClick={() => { navigator.clipboard?.writeText(k.prefix); setCopied(k.id); setTimeout(() => setCopied(null), 1200); }}>
                        {copied === k.id ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
                      </button>
                      <button className="btn ghost icon-only" aria-label="Edit"><Icon.Eye size={14} /></button>
                      <button className="btn ghost icon-only" aria-label="Delete"><Icon.Trash size={14} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Manage Project */}
      <article className="panel rise rise-3">
        <header className="panel-head"><div><h2 className="panel-title">Manage Project</h2></div></header>
        <div className="manage-list">
          <button className="manage-row">
            <span className="manage-avatar"><Icon.Settings size={16} /></span>
            <span className="manage-text">
              <span className="manage-title">Rename Project</span>
              <span className="dim">Edit name displayed on dashboard.</span>
            </span>
            <Icon.Chevron size={15} className="dim" />
          </button>
          <button className="manage-row">
            <span className="manage-avatar danger"><Icon.Trash size={16} /></span>
            <span className="manage-text">
              <span className="manage-title">Archive Project</span>
              <span className="dim">Remove project from dashboard.</span>
            </span>
            <Icon.Chevron size={15} className="dim" />
          </button>
        </div>
      </article>
    </div>
  );
}
