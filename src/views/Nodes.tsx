import { useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  Hero, Panel, TitledPanel, Badge, Spec, Table, TableFoot, BarList, StatTiles, Meter, Num,
  Sparkline, Delta, CopyButton,
} from '../components/ui';
import { chainIcon } from '../data/analytics';
import { dedicatedNodes, fleet, SIZING_QUESTIONS } from '../data/nodes';
import type { DedicatedNode, NodeStatus } from '../data/nodes';
import type { ViewId } from '../App';

/**
 * Dedicated nodes.
 *
 * Two screens live here and the empty one is the default. Dedicated nodes are
 * an Enterprise arrangement switched on after a conversation, so almost every
 * project that opens this page has never had one, and the empty state is the
 * real screen: it has to explain the feature and how to get it, not apologise
 * for having no rows. Both states open on the same `Hero` as Quickstart, for
 * the same reason, this is the top of a screen someone is seeing for the first
 * time.
 *
 * The provisioned state is behind a dev-only switch (see `StateSwitch`). It is
 * design work: there is no provisioning flow to reach it through yet, and the
 * screen still has to be reviewable.
 */

type ViewState = 'empty' | 'provisioned';

const WHAT_YOU_GET = [
  {
    icon: 'Lightning' as const,
    title: 'Reserved capacity',
    body: 'Your own client on your own hardware, not a slice of a shared pool. No noisy neighbour in your tail latency.',
  },
  {
    icon: 'Route' as const,
    title: 'Priority routing, with a floor',
    body: 'Requests land on your node first and fall back to the shared fleet the moment it drifts off the head. You lose the latency, never the answer.',
  },
  {
    icon: 'Shield' as const,
    title: 'A real SLA',
    body: 'Uptime and p95 commitments in writing, plus the archive methods the shared pool rate-limits: traces, wide log ranges, historical state.',
  },
];

const STATUS: Record<NodeStatus, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  healthy: { tone: 'success', label: 'At head' },
  syncing: { tone: 'warning', label: 'Catching up' },
  degraded: { tone: 'danger', label: 'Degraded' },
};

const int = (n: number) => n.toLocaleString('en-US');

/* ============================================================
   Empty: the resting state
   ============================================================ */

function EmptyState() {
  return (
    <>
      <Hero
        className="rise rise-1"
        eyebrow="Dedicated nodes / none provisioned"
        title={<>A node of your own,<br />sized to your traffic.</>}
        sub="We size nodes per chain against what you actually send, which is why this one starts with a conversation rather than a checkout page. Tell us the methods and the p95 you are holding yourself to and we will tell you what it takes."
        actions={
          <>
            <a
              className="btn-blk on-light is-solid"
              href="https://uniblock.dev/contact"
              target="_blank"
              rel="noreferrer"
            >
              <Icon.Mail size={12} /> Book a sizing call
            </a>
            <a
              className="btn-blk on-light"
              href="https://docs.uniblock.dev"
              target="_blank"
              rel="noreferrer"
            >
              <Icon.Book size={12} /> Read the docs <Icon.External size={12} />
            </a>
            {/* Was "What a dedicated node costs", which went nowhere and could
                not be answered anyway: the price comes out of the sizing
                conversation. It now points at the panel that says what that
                conversation covers, which is the honest version of the same
                question. */}
            <button
              className="btn-blk on-light is-bare"
              onClick={() => document.getElementById('node-sizing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              What sizing covers
            </button>
          </>
        }
      />

      <p className="node-note dim rise rise-2">
        Nothing is blocked in the meantime. Auto-routing already spreads this project across every
        healthy provider, and the archive methods a dedicated node exists for are served from the
        shared pool at a lower rate limit.
      </p>

      <section className="bento rise rise-2">
        {WHAT_YOU_GET.map((item) => {
          const I = Icon[item.icon];
          return (
            <Panel key={item.title} className="node-card">
              <span className="node-card-icon"><I size={18} /></span>
              <h3 className="node-card-title">{item.title}</h3>
              <p className="node-card-body dim">{item.body}</p>
            </Panel>
          );
        })}
      </section>

      <TitledPanel
        id="node-sizing"
        title="What we would need from you"
        sub="Roughly what the sizing conversation covers, so you can come prepared."
        className="rise rise-3"
      >
        <Spec rows={SIZING_QUESTIONS} />
      </TitledPanel>
    </>
  );
}

/* ============================================================
   Provisioned: the fleet
   ============================================================ */

const NODE_COLUMNS = [
  { key: 'node', header: 'Node' },
  { key: 'client', header: 'Client' },
  { key: 'head', header: 'Head' },
  { key: 'p95', header: 'p95', align: 'right' as const },
  { key: 'trend', header: '24h' },
  { key: 'load', header: 'Load' },
  { key: 'status', header: 'Status', align: 'right' as const },
];

function NodeRow({
  node,
  selected,
  onSelect,
}: {
  node: DedicatedNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = STATUS[node.status];
  const load = Math.round((node.rps / node.capacity) * 100);
  const icon = chainIcon(node.chain);
  return (
    <tr className={`row-click ${selected ? 'is-open' : ''}`.trim()} onClick={onSelect}>
      <td>
        <span className="node-id">
          {icon && <img className="chip-mark" src={icon} alt="" />}
          <span className="cell-strong">{node.chainName}</span>
          <Badge>{node.kind}</Badge>
        </span>
        <span className="node-id-sub dim mono">{node.id} · {node.region}</span>
      </td>
      <td className="mono dim">{node.client}</td>
      <td>
        <span className="mono">{int(node.height)}</span>
        <span className="node-id-sub dim mono">
          {node.lag === 0
            ? `at head · ${node.peers} peers`
            : `${int(node.lag)} ${node.unit}${node.lag === 1 ? '' : 's'} behind · ${node.lagSeconds}s`}
        </span>
      </td>
      <td className="num mono">{node.rps > 0 ? `${node.p95} ms` : '—'}</td>
      <td>
        {node.rps > 0
          ? <Sparkline points={node.latency.filter((v) => v > 0)} />
          : <span className="dim mono">idle</span>}
      </td>
      <td className="node-load">
        <Meter value={load} size="sm" />
        <span className="mono dim">{node.rps > 0 ? `${load}%` : '0%'}</span>
      </td>
      <td className="num">
        <Badge tone={status.tone}>{status.label}</Badge>
      </td>
    </tr>
  );
}

/**
 * Enough rows to fill the column beside the node's own panel without the list
 * outgrowing it. A node can serve far more than this, hence the pager.
 */
const METHODS_PER_PAGE = 5;

function NodeDetail({ node }: { node: DedicatedNode }) {
  const [page, setPage] = useState(1);
  const [back, setBack] = useState(false);
  const pages = Math.max(1, Math.ceil(node.methods.length / METHODS_PER_PAGE));
  const goPage = (next: number) => { setBack(next < page); setPage(next); };
  const diskPct = Math.round((node.disk.usedTb / node.disk.totalTb) * 100);
  const daysLeft = Math.round(((node.disk.totalTb - node.disk.usedTb) * 1000) / node.disk.growthGbDay);

  return (
    <>
      <section className="node-detail">
        <TitledPanel
          title={`${node.chainName} · ${node.kind}`}
          sub={`Provisioned ${node.provisioned} · $${int(node.monthly)}/mo`}
          actions={<Badge tone={STATUS[node.status].tone}>{STATUS[node.status].label}</Badge>}
        >
          <div className="node-endpoints">
            {[['HTTPS', node.https], ['WSS', node.wss]].map(([label, url]) => (
              <div className="node-endpoint" key={label}>
                <span className="eyebrow">{label}</span>
                <span className="mono node-endpoint-url">{url}</span>
                <CopyButton value={url} copyKey={url} size={13} />
              </div>
            ))}
          </div>
          <Spec
            rows={[
              { label: 'Client', value: <span className="mono">{node.client}</span> },
              ...(node.pairedWith
                ? [{ label: 'Paired with', value: <span className="mono">{node.pairedWith}</span> }]
                : []),
              { label: 'Region', value: <span className="mono">{node.region}</span> },
              { label: 'Peers', value: <span className="mono">{node.peers}</span> },
              {
                label: 'Latency',
                value: <span className="mono">p50 {node.p50} · p95 {node.p95} · p99 {node.p99} ms</span>,
              },
              {
                label: 'Shared fleet p95',
                value: (
                  <span className="mono">
                    {node.sharedP95} ms <span className="dim">what these calls cost without it</span>
                  </span>
                ),
              },
              { label: 'Uptime, 30d', value: <span className="mono">{node.uptime.toFixed(2)}%</span> },
              { label: 'Errors', value: <span className="mono">{node.errorRate.toFixed(2)}%</span> },
            ]}
          />

          <div className="node-disk">
            <div className="node-disk-head">
              <span className="eyebrow">State on disk</span>
              <span className="mono dim">
                {node.disk.usedTb.toFixed(2)} / {node.disk.totalTb} TB · +{node.disk.growthGbDay} GB/day
              </span>
            </div>
            <Meter value={diskPct} />
            <p className="node-disk-note dim">
              {daysLeft > 120
                ? `About ${Math.round(daysLeft / 30)} months of headroom at the current growth rate. We size up before it matters.`
                : `About ${daysLeft} days of headroom at the current growth rate. We will be in touch well before that.`}
            </p>
          </div>
        </TitledPanel>

        <TitledPanel
          title="What it is serving"
          sub="Share of this node's calls over the last 24 hours."
          className="node-methods"
        >
          <div className="node-methods-list">
            {/* Keyed on the page so the list slides rather than swapping in
                place, and `is-back` carries the direction so paging backwards
                does not feel identical to paging forwards. */}
            <div className={`swap-in ${back ? 'is-back' : ''}`.trim()} key={page}>
              <BarList
                items={node.methods
                  .slice((page - 1) * METHODS_PER_PAGE, page * METHODS_PER_PAGE)
                  .map((m) => ({
                    id: m.name,
                    label: <span className="mono">{m.name}</span>,
                    meta: m.note,
                    share: m.share,
                    value: m.calls,
                  }))}
              />
            </div>
          </div>
          {pages > 1 && (
            <TableFoot
              page={page}
              pages={pages}
              onChange={goPage}
              summary={`${node.methods.length} methods`}
            />
          )}
        </TitledPanel>
      </section>

      <TitledPanel
        title="Recent events"
        sub="Upgrades, restarts, reorgs, and every time traffic went to the shared fleet instead."
      >
        <ul className="node-events">
          {node.events.map((e) => (
            <li key={e.id} className={`node-event is-${e.kind}`}>
              <span className="mono node-event-ts dim">{e.ts}</span>
              <div className="node-event-body">
                <span className="node-event-title">{e.title}</span>
                <span className="node-event-detail dim">{e.detail}</span>
              </div>
              <Badge>{e.kind}</Badge>
            </li>
          ))}
        </ul>
      </TitledPanel>
    </>
  );
}

function ProvisionedState({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const [selectedId, setSelectedId] = useState(dedicatedNodes[0].id);
  const selected = dedicatedNodes.find((n) => n.id === selectedId) ?? dedicatedNodes[0];
  const load = Math.round((fleet.rps / fleet.capacity) * 100);
  const saved = fleet.sharedP95 - fleet.p95;

  return (
    <>
      <Hero
        className="rise rise-1"
        eyebrow={`Dedicated nodes / ${fleet.count} provisioned`}
        title={<>Your own clients,<br />not a slice of ours.</>}
        sub={`Two nodes are at the head and one is catching up after a restart. While Solana resyncs its traffic is on the shared fleet, ${fleet.sharedP95} ms p95 instead of ${fleet.p95} ms, and nothing is erroring.`}
        actions={
          <>
            <button className="btn-blk on-light is-solid">
              <Icon.Plus size={12} /> Add a node
            </button>
            <a
              className="btn-blk on-light"
              href="https://docs.uniblock.dev"
              target="_blank"
              rel="noreferrer"
            >
              <Icon.Book size={12} /> Docs <Icon.External size={12} />
            </a>
            {/* Was "Compare against the shared fleet", which named a comparison
                without saying against what, on which axis, or where you would
                go to see it. The comparison it meant is latency by provider,
                and that already has a home. */}
            <button className="btn-blk on-light is-bare" onClick={() => onNavigate('analytics')}>
              Routing and latency analytics
            </button>
          </>
        }
      />

      <Panel className="rise rise-2">
        <StatTiles
          columns={4}
          tiles={[
            {
              id: 'nodes',
              label: 'Nodes',
              value: <Num value={fleet.count} format={(n) => String(Math.round(n))} />,
              foot: <span className="dim mono">{fleet.offHead} off the head</span>,
            },
            {
              id: 'p95',
              label: 'Fleet p95',
              value: <Num value={fleet.p95} format={(n) => `${Math.round(n)} ms`} />,
              foot: <Delta pct={-(saved / fleet.sharedP95) * 100} good since="shared fleet" />,
            },
            {
              id: 'load',
              label: 'Sustained load',
              value: <Num value={fleet.rps} format={(n) => int(Math.round(n))} />,
              foot: <span className="dim mono">of {int(fleet.capacity)} rps · {load}%</span>,
            },
            {
              id: 'uptime',
              label: 'Worst uptime, 30d',
              value: <Num value={fleet.uptime} format={(n) => `${n.toFixed(2)}%`} />,
              foot: <span className="dim mono">${int(fleet.monthly)}/mo committed</span>,
            },
          ]}
        />
      </Panel>

      <TitledPanel
        title="Fleet"
        sub="Pick a node to see what it is serving and what it has been through."
        flush
        className="rise rise-3"
      >
        <Table columns={NODE_COLUMNS} ruled className="node-table">
          {dedicatedNodes.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              selected={node.id === selectedId}
              onSelect={() => setSelectedId(node.id)}
            />
          ))}
        </Table>
      </TitledPanel>

      {/* Keyed on the node: picking a different one is a different subject, and
          leaving the method pager on page 2 of the node you just left is not a
          state anyone asked to keep. The key also replays the entrance, so the
          panels settle into the new node instead of cutting to it. */}
      <div className="node-detail-swap swap-in is-subtle" key={selected.id}>
        <NodeDetail node={selected} />
      </div>
    </>
  );
}

/* ============================================================
   Dev-only state switch
   ============================================================ */

/**
 * Vite strips this whole branch from a production build: `import.meta.env.DEV`
 * is replaced with `false` at build time and the dead branch goes with it. It is
 * scaffolding for reviewing the provisioned screen, which has no route into it
 * yet, so it is drawn as scaffolding: dashed, tagged, out of the layout.
 */
function StateSwitch({ value, onChange }: { value: ViewState; onChange: (v: ViewState) => void }) {
  return (
    <div className="dev-switch">
      <span className="mono dev-switch-tag">dev</span>
      <Segmented
        label="Nodes view state"
        value={value}
        onChange={onChange}
        options={[
          { value: 'empty', label: 'Empty' },
          { value: 'provisioned', label: 'Provisioned' },
        ]}
      />
    </div>
  );
}

export function Nodes({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const [state, setState] = useState<ViewState>('empty');

  return (
    <div className="view">
      {state === 'empty' ? <EmptyState /> : <ProvisionedState onNavigate={onNavigate} />}
      {import.meta.env.DEV && <StateSwitch value={state} onChange={setState} />}
    </div>
  );
}
