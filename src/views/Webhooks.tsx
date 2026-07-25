import { Icon } from '../components/Icons';
import { Panel, Table, RowChevron, ViewToolbar, Badge, useCopy } from '../components/ui';
import { webhooks } from '../data/mock';

const columns = [
  { key: 'event', header: 'Event Type' },
  { key: 'name', header: 'Name' },
  { key: 'network', header: 'Network' },
  { key: 'provider', header: 'Provider' },
  { key: 'url', header: 'Webhook URL' },
  { key: 'created', header: 'Created At' },
  { key: 'go' },
];

export function Webhooks() {
  const { copy, isCopied } = useCopy();

  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        lead={<span className="dim">Real-time event delivery with automatic retries and signed payloads.</span>}
      >
        <button className="btn primary">
          <Icon.Plus size={14} /> Create Webhook <Icon.External size={13} />
        </button>
      </ViewToolbar>

      <Panel marks flush className="rise rise-2">
        <Table columns={columns}>
          {webhooks.map((w) => (
            <tr key={w.id} className="row-click">
              <td><Badge tone="new">{w.event}</Badge></td>
              <td className="cell-strong">{w.label}</td>
              <td className="dim">{w.chain}</td>
              <td className="dim">{w.provider}</td>
              <td>
                <button
                  className="url-copy-btn"
                  onClick={(e) => { e.stopPropagation(); copy(w.url, w.id); }}
                >
                  {isCopied(w.id) ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
                  <span className="mono url-copy-text">{w.url}</span>
                </button>
              </td>
              <td>
                <div className="list-main">
                  <span>{w.created}</span>
                  <span className="dim">{w.ago}</span>
                </div>
              </td>
              <RowChevron />
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
