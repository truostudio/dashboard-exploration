import { Icon } from '../components/Icons';
import { Panel, PanelHead, TitledPanel, Table, ViewToolbar, CopyButton } from '../components/ui';
import { apiKeys } from '../data/mock';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'key', header: 'Key' },
  { key: 'created', header: 'Created At' },
  { key: 'used', header: 'Last used' },
  { key: 'actions', align: 'right' as const },
];

const manageRows = [
  { id: 'rename', icon: 'Settings' as const, title: 'Rename Project', sub: 'Edit name displayed on dashboard.' },
  { id: 'archive', icon: 'Trash' as const, title: 'Archive Project', sub: 'Remove project from dashboard.', danger: true },
];

export function SettingsProject() {
  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        lead={<span className="dim">Keys, project name, and lifecycle for eth-mainnet-prod.</span>}
      >
        <button className="btn"><Icon.External size={14} /> Manage Integrations</button>
      </ViewToolbar>

      <Panel flush className="rise rise-2">
        <PanelHead
          inset
          title="API Keys"
          sub="Manage your project API keys."
          actions={<button className="btn primary"><Icon.Plus size={14} /> Create API key</button>}
        />
        <Table columns={columns} ruled>
          {apiKeys.map((k) => (
            <tr key={k.id}>
              <td className="cell-strong">{k.name}</td>
              <td><span className="mono">{k.prefix}••••</span></td>
              <td className="dim">{k.created}</td>
              <td className="dim">{k.lastUsed}</td>
              <td className="num">
                <span className="row-actions">
                  <CopyButton value={k.prefix} copyKey={k.id} />
                  <button className="btn ghost icon-only" aria-label="Reveal"><Icon.Eye size={14} /></button>
                  <button className="btn ghost icon-only" aria-label="Delete"><Icon.Trash size={14} /></button>
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <TitledPanel title="Manage Project" className="rise rise-3">
        <div className="manage-list">
          {manageRows.map((row) => {
            const I = Icon[row.icon];
            return (
              <button key={row.id} className="manage-row">
                <span className={`manage-avatar ${row.danger ? 'danger' : ''}`.trim()}><I size={16} /></span>
                <span className="manage-text">
                  <span className="manage-title">{row.title}</span>
                  <span className="dim">{row.sub}</span>
                </span>
                <Icon.Chevron size={15} className="dim" />
              </button>
            );
          })}
        </div>
      </TitledPanel>
    </div>
  );
}
