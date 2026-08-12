import { Icon } from '../components/Icons';
import { Panel, TitledPanel, Badge, Spec } from '../components/ui';

/**
 * Dedicated nodes.
 *
 * Empty is the *default* state here, not an error and not a loading gap:
 * dedicated nodes are an Enterprise arrangement that gets switched on after a
 * conversation, so almost every project that opens this page will never have
 * had one. That makes the empty state the real screen, it has to explain what
 * the feature is and how to get it, rather than apologise for having no rows.
 */

const WHAT_YOU_GET = [
  {
    icon: 'Lightning' as const,
    title: 'Reserved capacity',
    body: 'Your own node, not a slice of a shared pool. No noisy neighbours on the tail latency.',
  },
  {
    icon: 'Route' as const,
    title: 'Priority routing',
    body: 'Requests land on your node first and only fall back to the shared fleet if it is unhealthy.',
  },
  {
    icon: 'Shield' as const,
    title: 'A real SLA',
    body: 'Uptime and latency commitments in writing, with engineering you can reach directly.',
  },
];

export function Nodes() {
  return (
    <div className="view">
      <Panel className="rise rise-1 node-hero">
        <span className="node-hero-icon"><Icon.Nodes size={26} /></span>
        <Badge tone="warning">Enterprise</Badge>
        <h2 className="node-hero-title">Dedicated nodes are not switched on here</h2>
        <p className="node-hero-body dim">
          We size nodes per chain against your real traffic, so this one starts with a
          conversation rather than a checkout page.
        </p>
        <div className="node-cta">
          <a className="btn primary" href="https://uniblock.dev/contact" target="_blank" rel="noreferrer">
            <Icon.Mail size={14} />
            Book a call
          </a>
          <a className="btn" href="https://docs.uniblock.dev" target="_blank" rel="noreferrer">
            <Icon.Book size={14} />
            Read the docs
            <Icon.External size={12} />
          </a>
        </div>
        <p className="node-foot dim">
          Everything else keeps working in the meantime. Auto-routing already spreads your traffic
          across every healthy provider.
        </p>
      </Panel>

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
        title="What we would need from you"
        sub="Roughly what the sizing conversation covers, so you can come prepared."
        className="rise rise-3"
      >
        <Spec
          rows={[
            { label: 'Chains', value: 'Which networks need dedicated capacity' },
            { label: 'Throughput', value: 'Sustained and peak requests per second' },
            { label: 'Methods', value: 'Anything heavy: archive reads, traces, large log ranges' },
            { label: 'Regions', value: 'Where your callers are' },
            { label: 'Latency target', value: 'The p95 you are holding yourself to' },
          ]}
        />
      </TitledPanel>
    </div>
  );
}
