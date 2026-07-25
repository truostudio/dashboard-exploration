import { useState } from 'react';
import { Icon } from '../components/Icons';
import { TitledPanel, Field, Select, TextInput, FormActions, Badge, MethodBadge, Empty } from '../components/ui';
import { unifiedCategories } from '../data/catalog';

const testable = unifiedCategories.flatMap((c) => c.endpoints).filter((e) => e.method === 'GET');

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
        <TitledPanel eyebrow="Request" title="Composer">
          <Field label="Endpoint">
            <div className="composer-row">
              <MethodBadge method="GET" />
              <Select
                label="Endpoint"
                value={path}
                onChange={setPath}
                options={testable.map((e) => ({ value: e.path, label: `${e.path} · ${e.title}` }))}
              />
            </div>
          </Field>

          <div className="settings-grid">
            <Field label="Chain" as="label">
              <Select
                value={chain}
                onChange={setChain}
                options={['ethereum', 'base', 'polygon', 'solana'].map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="Address" as="label">
              <TextInput value={address} onChange={setAddress} />
            </Field>
          </div>

          <FormActions>
            <button className="btn primary" onClick={run} disabled={running}>
              {running ? <Icon.Refresh size={13} /> : <Icon.Play size={13} />}
              {running ? 'Running…' : 'Send request'}
            </button>
            <span className="form-actions-spacer" />
            <span className="dim mono">credentials prefilled</span>
          </FormActions>
        </TitledPanel>

        <TitledPanel
          eyebrow="Response"
          title="Result"
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
          {!res && !running && <Empty>Send a request to see the live response.</Empty>}
          {running && <Empty>Routing through the fastest healthy provider…</Empty>}
          {res && <pre className="code-pre response-pre">{res}</pre>}
        </TitledPanel>
      </section>
    </div>
  );
}
