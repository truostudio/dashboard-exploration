import { useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  TitledPanel, Field, Select, TextInput, Badge, MethodBadge, Empty, Spec, CopyButton,
} from '../components/ui';
import { unifiedCategories } from '../data/catalog';
import { chains } from '../data/mock';

const testable = unifiedCategories.flatMap((c) => c.endpoints).filter((e) => e.method === 'GET');

/** Chains worth offering first. The full list is long and this is a scratchpad. */
const TEST_CHAINS = chains.slice(0, 8);

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

type Tab = 'Body' | 'Request';

export function ApiTester() {
  const [path, setPath] = useState(testable[0].path);
  const [chain, setChain] = useState('ethereum');
  const [address, setAddress] = useState('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('Body');

  const url = `https://api.uniblock.dev/v1${path}?chain=${chain}&address=${address}`;
  const curl = `curl '${url}' \\\n  -H 'x-api-key: ub_demo_8f4c2a91b73e5a90c1f6d8e2b5a7c3d9'`;

  function run() {
    setRunning(true);
    setRes(null);
    setTimeout(() => {
      setRunning(false);
      setRes(sampleResponse);
      setTab('Body');
    }, 700);
  }

  return (
    <div className="view tester">
      {/* One line, like a real client: method, URL, send. The composer used to
          bury the request behind two stacked labelled panels, so the thing you
          are actually sending was never visible in one piece. */}
      <div className="tester-bar rise rise-1">
        <MethodBadge method="GET" />
        <span className="tester-url mono" title={url}>
          <span className="dim">https://api.uniblock.dev/v1</span>
          <strong>{path}</strong>
          <span className="dim">?chain={chain}&amp;address={address.slice(0, 10)}…</span>
        </span>
        <CopyButton value={url} label="Copy URL" />
        <button className="btn primary tester-send" onClick={run} disabled={running}>
          {running ? <Icon.Refresh size={13} className="spin" /> : <Icon.Play size={13} />}
          {running ? 'Sending…' : 'Send'}
        </button>
      </div>

      <section className="tester-grid rise rise-2">
        <TitledPanel title="Request" sub="Your project key is attached automatically.">
          <div className="tester-form">
            <Field label="Endpoint">
              <Select
                label="Endpoint"
                value={path}
                onChange={setPath}
                options={testable.map((e) => ({ value: e.path, label: `${e.path} · ${e.title}` }))}
              />
            </Field>
            <Field label="Chain" as="label">
              <Select
                value={chain}
                onChange={setChain}
                options={TEST_CHAINS.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field label="Address" as="label">
              <TextInput value={address} onChange={setAddress} />
            </Field>
          </div>

          <div className="tester-auth">
            <Icon.Key size={14} className="tester-auth-icon" />
            <span className="dim">
              Sent as <span className="mono">x-api-key</span> on every request. Auto-routing picks
              the provider.
            </span>
          </div>
        </TitledPanel>

        <TitledPanel
          title="Response"
          sub={res ? undefined : 'Nothing sent yet.'}
          actions={
            res && (
              <div className="resp-meta">
                <Badge tone="success">200 OK</Badge>
                <span className="mono dim">64 ms</span>
                <Badge>alchemy</Badge>
              </div>
            )
          }
        >
          {res && (
            <Segmented
              className="tester-tabs"
              label="Response view"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'Body' as const, label: 'Body' },
                { value: 'Request' as const, label: 'cURL' },
              ]}
            />
          )}

          {!res && !running && (
            <Empty bare icon={<Icon.Play size={20} />} title="No response yet">
              Hit <strong>Send</strong> and the live JSON lands here, with the provider that served
              it and the round trip it took.
            </Empty>
          )}

          {running && (
            <Empty bare icon={<Icon.Refresh size={20} className="spin" />} title="Routing…">
              Scoring providers for this chain and method, then sending to the fastest healthy one.
            </Empty>
          )}

          {res && tab === 'Body' && (
            <>
              <pre className="code-pre response-pre">{res}</pre>
              <Spec
                rows={[
                  { label: 'Served by', value: 'Alchemy' },
                  { label: 'Round trip', value: '64 ms' },
                  { label: 'Compute units', value: '3' },
                  { label: 'Attempts', value: '1' },
                ]}
              />
            </>
          )}

          {res && tab === 'Request' && <pre className="code-pre response-pre">{curl}</pre>}
        </TitledPanel>
      </section>
    </div>
  );
}
